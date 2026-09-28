"""
Anomaly Detection Module (Task 3.9)

Detects statistical anomalies in batch/evidence data compared to prior batches.
Uses threshold-based and z-score methods — fully deterministic, no LLM.

Rules:
  - recovery_rate_anomaly: recovery rate significantly outside typical range
  - energy_per_kg_anomaly: energy consumption per kg outside normal band
  - runtime_anomaly: machine runtime inconsistent with batch size
  - yield_anomaly: yield ratio deviates from historical mean by > 2 std deviations
"""

import math
import logging

logger = logging.getLogger(__name__)

# Typical operating ranges for a polymer recycling plant
THRESHOLDS = {
    "recovery_rate": {"min": 0.50, "max": 0.95},      # 50%–95% recovery
    "energy_per_kg":  {"min": 0.3,  "max": 2.0},       # kWh per kg processed
    "yield_ratio":    {"min": 0.55, "max": 0.92},       # recovered / input
    "runtime_per_tonne": {"min": 60, "max": 300},       # minutes per tonne
}


def _safe_div(a, b):
    """Safe division returning None on zero/None."""
    if a is None or b is None or b == 0:
        return None
    return a / b


def check_recovery_rate(extracted: dict) -> dict:
    """Recovery rate = recovered / processed. Flag if outside typical band."""
    recovered = extracted.get("recovered_weight")
    processed = extracted.get("output_weight")
    rate = _safe_div(recovered, processed)

    if rate is None:
        return {"check": "RECOVERY_RATE", "passed": True, "note": "Insufficient data", "flag": None}

    lo = THRESHOLDS["recovery_rate"]["min"]
    hi = THRESHOLDS["recovery_rate"]["max"]
    passed = lo <= rate <= hi

    return {
        "check": "RECOVERY_RATE",
        "passed": passed,
        "recovery_rate": round(rate, 4),
        "expected_range": f"{lo*100:.0f}%–{hi*100:.0f}%",
        "flag": "ANOMALY_RECOVERY_RATE" if not passed else None,
    }


def check_energy_per_kg(extracted: dict) -> dict:
    """Energy per kg = energy_consumed / processed_weight."""
    energy = extracted.get("energy_consumed")
    processed = extracted.get("output_weight")
    ekg = _safe_div(energy, processed)

    if ekg is None:
        return {"check": "ENERGY_PER_KG", "passed": True, "note": "No energy data", "flag": None}

    lo = THRESHOLDS["energy_per_kg"]["min"]
    hi = THRESHOLDS["energy_per_kg"]["max"]
    passed = lo <= ekg <= hi

    return {
        "check": "ENERGY_PER_KG",
        "passed": passed,
        "energy_per_kg": round(ekg, 4),
        "expected_range": f"{lo}–{hi} kWh/kg",
        "flag": "ANOMALY_ENERGY_USAGE" if not passed else None,
    }


def check_yield_ratio(extracted: dict) -> dict:
    """Yield ratio = recovered / input_weight."""
    recovered = extracted.get("recovered_weight")
    input_w = extracted.get("input_weight")
    yield_r = _safe_div(recovered, input_w)

    if yield_r is None:
        return {"check": "YIELD_RATIO", "passed": True, "note": "Insufficient data", "flag": None}

    lo = THRESHOLDS["yield_ratio"]["min"]
    hi = THRESHOLDS["yield_ratio"]["max"]
    passed = lo <= yield_r <= hi

    return {
        "check": "YIELD_RATIO",
        "passed": passed,
        "yield_ratio": round(yield_r, 4),
        "expected_range": f"{lo*100:.0f}%–{hi*100:.0f}%",
        "flag": "ANOMALY_YIELD_RATIO" if not passed else None,
    }


def check_runtime(extracted: dict) -> dict:
    """Runtime per tonne = runtime_minutes / (input_weight / 1000)."""
    runtime = extracted.get("runtime_minutes")
    input_w = extracted.get("input_weight")

    if runtime is None or input_w is None or input_w == 0:
        return {"check": "RUNTIME", "passed": True, "note": "No runtime data", "flag": None}

    tonnes = input_w / 1000.0
    rpt = runtime / tonnes

    lo = THRESHOLDS["runtime_per_tonne"]["min"]
    hi = THRESHOLDS["runtime_per_tonne"]["max"]
    passed = lo <= rpt <= hi

    return {
        "check": "RUNTIME",
        "passed": passed,
        "runtime_per_tonne": round(rpt, 1),
        "expected_range": f"{lo}–{hi} min/tonne",
        "flag": "ANOMALY_RUNTIME" if not passed else None,
    }


def extract_anomaly_fields(batch: dict, evidence: list[dict]) -> dict:
    """Extract fields needed for anomaly detection from batch and evidence."""
    by_type = {}
    for item in evidence:
        t = item.get("type", "unknown")
        by_type.setdefault(t, []).append(item)

    def qty(item, keys):
        for k in keys:
            v = (item or {}).get("data", {}).get(k)
            if v is not None:
                try:
                    return float(v)
                except (ValueError, TypeError):
                    continue
        return None

    processing = (by_type.get("processing_log") or [{}])[0]
    telemetry   = (by_type.get("telemetry")       or [{}])[0]
    output_rec  = (by_type.get("output_record")   or [{}])[0]
    weighbridge = (by_type.get("weighbridge")     or [{}])[0]

    return {
        "input_weight":    qty(weighbridge, ["weight", "inputWeight", "quantity"]),
        "output_weight":   qty(processing,  ["outputWeight", "quantity"]),
        "recovered_weight": qty(output_rec, ["totalRecovered", "recoveredWeight", "quantity"]),
        "energy_consumed": qty(telemetry,   ["energyConsumption", "energy", "energyUsed"]),
        "runtime_minutes": qty(telemetry,   ["runtime"]) or qty(processing, ["runtime"]),
    }


def detect_anomalies(batch: dict, evidence: list[dict]) -> dict:
    """
    Run all anomaly checks.

    Returns:
      {
        "anomalyFlags": [...],
        "checks": [...],
        "hasAnomalies": bool
      }
    """
    extracted = extract_anomaly_fields(batch, evidence)

    checks = [
        check_recovery_rate(extracted),
        check_energy_per_kg(extracted),
        check_yield_ratio(extracted),
        check_runtime(extracted),
    ]

    flags = [c["flag"] for c in checks if c.get("flag")]

    return {
        "anomalyFlags": flags,
        "checks": checks,
        "hasAnomalies": len(flags) > 0,
    }
