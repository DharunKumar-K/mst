"""
Deterministic Rule Engine

All arithmetic checks are handled here — the LLM NEVER calculates mass balance.

Rules:
  1. Unit normalization — verify all evidence uses consistent units
  2. Mass balance — output ≤ input
  3. Capacity check — input ≤ plant capacity
  4. Downstream match — claim ≤ downstream-supported quantity
  5. Claim vs committed evidence — claim matches processing output
  6. Cross-source differences — detect significant discrepancies
  7. Hash integrity — if integrity result provided, check for mismatches
  8. Missing evidence — check required evidence types are present
"""

from extraction import extract_all


def rule_unit_normalization(extracted: dict) -> dict:
    """Check that all evidence units are consistent with the claim unit."""
    claim_unit = extracted["claim_unit"]
    evidence_units = extracted["evidence_units"]
    mismatched = [u for u in evidence_units if u and u != claim_unit]

    return {
        "rule": "UNIT_NORMALIZATION",
        "passed": len(mismatched) == 0,
        "claim_unit": claim_unit,
        "evidence_units": list(evidence_units),
        "mismatched_units": mismatched,
        "flag": "UNIT_MISMATCH" if mismatched else None,
    }


def rule_mass_balance(extracted: dict) -> dict:
    """Processed weight must not exceed input weight."""
    input_w = extracted["input_weight"]
    processed_w = extracted["output_weight"]

    if input_w is None or processed_w is None:
        return {
            "rule": "MASS_BALANCE",
            "passed": True,  # cannot check without data
            "input": input_w,
            "processed": processed_w,
            "note": "Insufficient data to check mass balance",
            "flag": None,
        }

    passed = processed_w <= input_w
    return {
        "rule": "MASS_BALANCE",
        "passed": passed,
        "input": input_w,
        "processed": processed_w,
        "difference": round(processed_w - input_w, 2) if not passed else 0,
        "flag": "MASS_BALANCE_MISMATCH" if not passed else None,
    }


def rule_recovery_le_processing(extracted: dict) -> dict:
    """Recovered weight must not exceed processed weight."""
    processed_w = extracted["output_weight"]
    recovered_w = extracted["recovered_weight"]

    if processed_w is None or recovered_w is None:
        return {
            "rule": "RECOVERY_LE_PROCESSING",
            "passed": True,
            "note": "Insufficient data to check recovery vs processing",
            "flag": None,
        }

    passed = recovered_w <= processed_w
    return {
        "rule": "RECOVERY_LE_PROCESSING",
        "passed": passed,
        "processed": processed_w,
        "recovered": recovered_w,
        "flag": "MASS_BALANCE_MISMATCH" if not passed else None,
    }


def rule_non_negative_weights(extracted: dict) -> dict:
    """All weights must be non-negative."""
    weights = {
        "input": extracted["input_weight"],
        "processed": extracted["output_weight"],
        "recovered": extracted["recovered_weight"],
        "downstream": extracted["downstream_quantity"],
        "capacity": extracted["capacity"],
        "claim": extracted["claim_quantity"],
    }
    
    negatives = [k for k, v in weights.items() if v is not None and v < 0]
    
    return {
        "rule": "NON_NEGATIVE_WEIGHTS",
        "passed": len(negatives) == 0,
        "negative_fields": negatives,
        "flag": "INVALID_WEIGHT" if negatives else None,
    }


def rule_capacity_check(extracted: dict) -> dict:
    """Input weight must not exceed plant capacity."""
    input_w = extracted["input_weight"]
    capacity = extracted["capacity"]

    if input_w is None or capacity is None:
        return {
            "rule": "CAPACITY_CHECK",
            "passed": True,
            "input": input_w,
            "capacity": capacity,
            "note": "Insufficient data to check capacity",
            "flag": None,
        }

    passed = input_w <= capacity
    return {
        "rule": "CAPACITY_CHECK",
        "passed": passed,
        "input": input_w,
        "capacity": capacity,
        "withinCapacity": passed,
        "flag": "CAPACITY_EXCEEDED" if not passed else None,
    }


def rule_downstream_match(extracted: dict) -> dict:
    """Downstream quantity must not exceed recovered quantity, and claim <= downstream."""
    claim_q = extracted["claim_quantity"]
    downstream_q = extracted["downstream_quantity"]
    recovered_q = extracted["recovered_weight"]

    if downstream_q is None:
        return {
            "rule": "DOWNSTREAM_MATCH",
            "passed": True,
            "claim": claim_q,
            "downstream": downstream_q,
            "note": "No downstream evidence available",
            "flag": None,
        }

    passed_claim = claim_q <= downstream_q
    passed_recovery = recovered_q is None or downstream_q <= recovered_q
    
    passed = passed_claim and passed_recovery
    
    return {
        "rule": "DOWNSTREAM_MATCH",
        "passed": passed,
        "claim": claim_q,
        "downstream": downstream_q,
        "recovered": recovered_q,
        "matchesClaim": passed_claim,
        "flag": "CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM" if not passed else None,
    }


def rule_claim_vs_evidence(extracted: dict) -> dict:
    """Claimed quantity must match processing output evidence."""
    claim_q = extracted["claim_quantity"]
    output_w = extracted["output_weight"]

    if output_w is None:
        return {
            "rule": "CLAIM_VS_EVIDENCE",
            "passed": True,
            "claim": claim_q,
            "committedOutput": output_w,
            "note": "No processing output evidence available",
            "flag": None,
        }

    passed = claim_q == output_w
    return {
        "rule": "CLAIM_VS_EVIDENCE",
        "passed": passed,
        "claim": claim_q,
        "committedOutput": output_w,
        "difference": round(claim_q - output_w, 2) if not passed else 0,
        "flag": "CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE" if not passed else None,
    }


def rule_cross_source(extracted: dict) -> dict:
    """Check for significant discrepancies between different evidence sources."""
    input_w = extracted["input_weight"]
    processing_input = extracted.get("processing_input")

    if input_w is None or processing_input is None:
        return {
            "rule": "CROSS_SOURCE",
            "passed": True,
            "note": "Insufficient cross-source data",
            "flag": None,
        }

    # Allow 5% tolerance for cross-source differences
    tolerance = input_w * 0.05
    diff = abs(input_w - processing_input)
    passed = diff <= tolerance

    return {
        "rule": "CROSS_SOURCE",
        "passed": passed,
        "weighbridgeInput": input_w,
        "processingInput": processing_input,
        "difference": round(diff, 2),
        "tolerance": round(tolerance, 2),
        "flag": "MASS_BALANCE_MISMATCH" if not passed else None,
    }


def rule_hash_integrity(integrity_result: dict | None) -> dict:
    """Check evidence hash integrity from the integrity verification result."""
    if integrity_result is None:
        return {
            "rule": "HASH_INTEGRITY",
            "passed": True,
            "note": "No integrity result provided",
            "flag": None,
        }

    all_match = integrity_result.get("allHashesMatch", True)
    mismatched = integrity_result.get("mismatchedEvidenceIds", [])

    return {
        "rule": "HASH_INTEGRITY",
        "passed": all_match,
        "allHashesMatch": all_match,
        "mismatchedEvidenceIds": mismatched,
        "flag": "EVIDENCE_HASH_MISMATCH" if not all_match else None,
    }


def rule_missing_evidence(extracted: dict) -> dict:
    """Check that all required evidence types are present."""
    missing = extracted["missing_evidence"]

    return {
        "rule": "MISSING_EVIDENCE",
        "passed": len(missing) == 0,
        "missingTypes": missing,
        "presentTypes": extracted["evidence_types_present"],
        "flag": "MISSING_EVIDENCE" if missing else None,
    }


def rule_logical_timestamps(extracted: dict) -> dict:
    """Timestamps must be logically ordered: weighbridge <= processing_log <= output_record <= downstream_invoice."""
    ts = extracted["timestamps"]
    order = ["weighbridge", "processing_log", "output_record", "downstream_invoice"]
    
    available = [t for t in order if t in ts]
    out_of_order = []
    
    for i in range(len(available) - 1):
        t1 = ts[available[i]]
        t2 = ts[available[i+1]]
        if t1 > t2:
            out_of_order.append(f"{available[i]} > {available[i+1]}")
            
    passed = len(out_of_order) == 0
    return {
        "rule": "LOGICAL_TIMESTAMPS",
        "passed": passed,
        "out_of_order": out_of_order,
        "flag": "INVALID_TIMESTAMP_ORDER" if not passed else None,
    }


def run_rules(
    batch: dict,
    evidence: list[dict],
    integrity_result: dict | None = None,
) -> dict:
    """
    Run all deterministic rules against batch and evidence.

    Returns:
      {
        "status": "CONSISTENT" | "FLAGGED" | "REVIEW",
        "rules": [...],
        "flags": [...],
        "missingEvidence": [...],
        "massBalanceResult": {...},
        "capacityResult": {...},
        "downstreamMatch": {...},
      }
    """
    extracted = extract_all(batch, evidence)

    # Run each rule
    results = [
        rule_unit_normalization(extracted),
        rule_non_negative_weights(extracted),
        rule_logical_timestamps(extracted),
        rule_mass_balance(extracted),
        rule_recovery_le_processing(extracted),
        rule_capacity_check(extracted),
        rule_downstream_match(extracted),
        rule_claim_vs_evidence(extracted),
        rule_cross_source(extracted),
        rule_hash_integrity(integrity_result),
        rule_missing_evidence(extracted),
    ]

    # Collect flags (deduplicated)
    flags: list[str] = []
    seen_flags: set[str] = set()
    for r in results:
        f = r.get("flag")
        if f and f not in seen_flags:
            flags.append(f)
            seen_flags.add(f)

    missing = extracted["missing_evidence"]

    # Determine overall status
    non_missing_flags = [f for f in flags if f != "MISSING_EVIDENCE"]
    if non_missing_flags:
        status = "FLAGGED"
    elif missing:
        status = "REVIEW"
    else:
        status = "CONSISTENT"

    # Build structured sub-results for the AiReport model
    mb = next((r for r in results if r["rule"] == "MASS_BALANCE"), {})
    cap = next((r for r in results if r["rule"] == "CAPACITY_CHECK"), {})
    ds = next((r for r in results if r["rule"] == "DOWNSTREAM_MATCH"), {})

    return {
        "status": status,
        "rules": results,
        "flags": flags,
        "missingEvidence": missing,
        "massBalanceResult": {
            "input": mb.get("input"),
            "output": mb.get("processed"),
            "claim": extracted["claim_quantity"],
        },
        "capacityResult": {
            "capacity": cap.get("capacity"),
            "input": cap.get("input"),
            "withinCapacity": cap.get("withinCapacity", True),
        },
        "downstreamMatch": {
            "quantity": ds.get("downstream"),
            "matchesClaim": ds.get("matchesClaim"),
        },
    }
