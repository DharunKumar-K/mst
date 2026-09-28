"""
Reconciliation Module — orchestrates rules + AI explanation.

Flow:
  1. Run deterministic rules (ALWAYS executes)
  2. Attempt LLM explanation (optional)
  3. If LLM fails → template explanation (guaranteed fallback)

The LLM NEVER:
  - Calculates mass balance
  - Outputs "FRAUD DETECTED"
  - Makes the CONSISTENT/FLAGGED determination

The LLM ONLY:
  - Receives rule results, flags, and missing evidence
  - Produces a natural language explanation
  - Uses "EVIDENCE INCONSISTENCY" language (never "FRAUD")
"""

import os
import json
import logging
from rules.engine import run_rules

logger = logging.getLogger(__name__)


# ─── Template Explanations (Fallback) ────────────────────────────────────────

TEMPLATE_EXPLANATIONS = {
    "MASS_BALANCE_MISMATCH": (
        "Evidence inconsistency detected: the reported output weight ({output} kg) "
        "exceeds the input weight ({input} kg). Under normal processing conditions, "
        "output cannot exceed input due to material loss during recycling."
    ),
    "CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM": (
        "Evidence inconsistency detected: the claimed recovery of {claim} kg "
        "exceeds the downstream-supported quantity of {downstream} kg. "
        "The downstream buyer's records do not support the full claimed amount."
    ),
    "CAPACITY_EXCEEDED": (
        "Evidence inconsistency detected: the input weight of {input} kg "
        "exceeds the declared plant capacity of {capacity} kg. "
        "The facility's stated processing capacity cannot accommodate this batch."
    ),
    "CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE": (
        "Evidence inconsistency detected: the claimed recovery quantity of {claim} kg "
        "differs from the committed processing evidence which shows {output} kg. "
        "The claim does not match the evidence recorded at the time of processing."
    ),
    "EVIDENCE_HASH_MISMATCH": (
        "Evidence integrity violation detected: one or more evidence artifacts "
        "have been modified after their initial commitment. The stored hash "
        "no longer matches the artifact content. Mismatched evidence IDs: {mismatched}."
    ),
    "MISSING_EVIDENCE": (
        "Required evidence is missing: {missing}. "
        "A complete reconciliation requires weighbridge, processing log, "
        "and downstream invoice evidence."
    ),
    "UNIT_MISMATCH": (
        "Evidence inconsistency detected: unit mismatch found across evidence. "
        "Claim unit is '{claim_unit}' but evidence contains: {evidence_units}."
    ),
    "INVALID_WEIGHT": (
        "Evidence inconsistency detected: one or more weight values are negative. "
        "Negative fields: {negative_fields}."
    ),
    "INVALID_TIMESTAMP_ORDER": (
        "Evidence inconsistency detected: timestamps are not in logical chronological order. "
        "Out of order: {out_of_order}."
    ),
}

RECOMMENDATION_TEMPLATES = {
    "CONSISTENT": "All evidence is consistent with the batch claim. Proceed to verification review.",
    "FLAGGED": "Review the flagged inconsistencies and supply corrected evidence before verification.",
    "REVIEW": "Required evidence is missing. Supply the missing evidence types before proceeding.",
}


def build_template_explanation(rule_results: dict) -> str:
    """Build explanation from templates when LLM is unavailable."""
    flags = rule_results.get("flags", [])
    rules = rule_results.get("rules", [])

    if not flags:
        return "Available evidence is consistent with the batch claim."

    explanations = []
    for flag in flags:
        template = TEMPLATE_EXPLANATIONS.get(flag)
        if not template:
            explanations.append(f"Flag raised: {flag}")
            continue

        # Find the rule that raised this flag
        rule_data = next((r for r in rules if r.get("flag") == flag), {})

        try:
            explanation = template.format(
                input=rule_data.get("input", "N/A"),
                output=rule_data.get("output", rule_data.get("committedOutput", "N/A")),
                claim=rule_results.get("massBalanceResult", {}).get("claim", "N/A"),
                downstream=rule_results.get("downstreamMatch", {}).get("quantity", "N/A"),
                capacity=rule_results.get("capacityResult", {}).get("capacity", "N/A"),
                missing=", ".join(rule_results.get("missingEvidence", [])),
                mismatched=", ".join(rule_data.get("mismatchedEvidenceIds", [])),
                claim_unit=rule_data.get("claim_unit", "kg"),
                evidence_units=", ".join(rule_data.get("evidence_units", [])),
                negative_fields=", ".join(rule_data.get("negative_fields", [])),
                out_of_order=", ".join(rule_data.get("out_of_order", [])),
            )
            explanations.append(explanation)
        except (KeyError, IndexError):
            explanations.append(f"Flag raised: {flag}")

    return "\n\n".join(explanations)


def build_recommendation(status: str) -> str:
    """Build recommendation based on status."""
    return RECOMMENDATION_TEMPLATES.get(status, RECOMMENDATION_TEMPLATES["REVIEW"])


# ─── LLM Explanation ─────────────────────────────────────────────────────────


def build_llm_prompt(rule_results: dict) -> str:
    """Build prompt for LLM explanation. The LLM receives pre-calculated results."""
    flags = rule_results.get("flags", [])
    status = rule_results.get("status", "REVIEW")
    mass_balance = rule_results.get("massBalanceResult", {})
    capacity = rule_results.get("capacityResult", {})
    downstream = rule_results.get("downstreamMatch", {})
    missing = rule_results.get("missingEvidence", [])

    prompt = f"""You are an evidence reconciliation analyst for a recycling certification system.

IMPORTANT RULES:
- NEVER use the phrase "FRAUD DETECTED" or similar accusatory language
- Use "EVIDENCE INCONSISTENCY" when describing discrepancies
- Do NOT perform any calculations — all numbers below are pre-calculated by the rules engine
- Explain the findings in clear, professional language

RECONCILIATION STATUS: {status}

RULE RESULTS:
- Mass Balance: Input = {mass_balance.get('input', 'N/A')} kg, Output = {mass_balance.get('output', 'N/A')} kg, Claim = {mass_balance.get('claim', 'N/A')} kg
- Capacity: Plant capacity = {capacity.get('capacity', 'N/A')} kg, Input = {capacity.get('input', 'N/A')} kg, Within capacity: {capacity.get('withinCapacity', 'N/A')}
- Downstream: Downstream quantity = {downstream.get('quantity', 'N/A')} kg, Matches claim: {downstream.get('matchesClaim', 'N/A')}

FLAGS RAISED: {', '.join(flags) if flags else 'None'}
MISSING EVIDENCE: {', '.join(missing) if missing else 'None'}

Please provide:
1. A concise explanation of the reconciliation findings (2-4 sentences)
2. Use professional, neutral language
3. Reference specific quantities from the pre-calculated results above
"""
    return prompt


def get_llm_explanation(rule_results: dict) -> str | None:
    """
    Attempt to get LLM explanation.
    Returns None if LLM is unavailable or fails.
    """
    api_key = os.environ.get("OPENAI_API_KEY") or os.environ.get("GEMINI_API_KEY")
    if not api_key:
        logger.info("No LLM API key configured; using template fallback")
        return None

    try:
        # Try OpenAI-compatible API first
        openai_key = os.environ.get("OPENAI_API_KEY")
        if openai_key:
            return _call_openai(rule_results, openai_key)

        # Try Gemini API
        gemini_key = os.environ.get("GEMINI_API_KEY")
        if gemini_key:
            return _call_gemini(rule_results, gemini_key)

    except Exception as e:
        logger.warning(f"LLM call failed, falling back to template: {e}")
        return None

    return None


def _call_openai(rule_results: dict, api_key: str) -> str | None:
    """Call OpenAI-compatible API for explanation."""
    try:
        import httpx

        prompt = build_llm_prompt(rule_results)
        response = httpx.post(
            os.environ.get("OPENAI_BASE_URL", "https://api.openai.com/v1") + "/chat/completions",
            headers={"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"},
            json={
                "model": os.environ.get("OPENAI_MODEL", "gpt-4o-mini"),
                "messages": [{"role": "user", "content": prompt}],
                "max_tokens": 500,
                "temperature": 0.3,
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["choices"][0]["message"]["content"].strip()
    except Exception as e:
        logger.warning(f"OpenAI call failed: {e}")
        return None


def _call_gemini(rule_results: dict, api_key: str) -> str | None:
    """Call Gemini API for explanation."""
    try:
        import httpx

        prompt = build_llm_prompt(rule_results)
        model = os.environ.get("GEMINI_MODEL", "gemini-2.0-flash")
        response = httpx.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}",
            headers={"Content-Type": "application/json"},
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 500, "temperature": 0.3},
            },
            timeout=15.0,
        )
        response.raise_for_status()
        data = response.json()
        return data["candidates"][0]["content"]["parts"][0]["text"].strip()
    except Exception as e:
        logger.warning(f"Gemini call failed: {e}")
        return None


# ─── Main Reconciliation ─────────────────────────────────────────────────────


def reconcile_batch(
    batch: dict,
    evidence: list[dict],
    integrity_result: dict | None = None,
) -> dict:
    """
    Full reconciliation pipeline:
      1. Run deterministic rules (always succeeds)
      2. Try LLM explanation
      3. Fall back to template explanation if LLM fails

    Returns dict matching the AiReport model shape.
    """
    # Step 1: ALWAYS run deterministic rules
    rule_results = run_rules(batch, evidence, integrity_result)

    # Step 2: Try LLM, fall back to template
    explanation = None
    try:
        explanation = get_llm_explanation(rule_results)
    except Exception as e:
        logger.warning(f"LLM explanation failed: {e}")

    if explanation is None:
        explanation = build_template_explanation(rule_results)

    recommendation = build_recommendation(rule_results["status"])

    return {
        "status": rule_results["status"],
        "massBalanceResult": rule_results["massBalanceResult"],
        "capacityResult": rule_results["capacityResult"],
        "downstreamMatch": rule_results["downstreamMatch"],
        "flags": rule_results["flags"],
        "missingEvidence": rule_results["missingEvidence"],
        "explanation": explanation,
        "recommendation": recommendation,
    }
