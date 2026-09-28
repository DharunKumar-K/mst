"""
Extraction Module — extracts structured quantities from evidence events.

Normalizes diverse evidence data formats into a consistent structure
for the rules engine to consume.
"""


def extract_quantity(data: dict, keys: list[str]) -> float | None:
    """Extract a numeric quantity from evidence data, trying multiple keys."""
    for key in keys:
        val = data.get(key)
        if val is not None:
            try:
                return float(val)
            except (ValueError, TypeError):
                continue
    return None


def extract_unit(data: dict, default: str = "kg") -> str:
    """Extract unit from evidence data."""
    unit = data.get("unit", default)
    return str(unit).strip().lower() if unit else default


def group_evidence_by_type(evidence: list[dict]) -> dict[str, list[dict]]:
    """Group evidence items by their type."""
    groups: dict[str, list[dict]] = {}
    for item in evidence:
        ev_type = item.get("type", "unknown")
        groups.setdefault(ev_type, []).append(item)
    return groups


def extract_all(batch: dict, evidence: list[dict]) -> dict:
    """
    Extract all relevant quantities from batch and evidence.

    Returns a flat dict with:
      - claim_quantity, claim_unit
      - input_weight (from weighbridge)
      - output_weight (from processing_log)
      - downstream_quantity (from downstream_invoice)
      - capacity (from capacity evidence)
      - evidence types present/missing
    """
    by_type = group_evidence_by_type(evidence)

    claim = batch.get("claim", {})
    claim_quantity = float(claim.get("quantity", 0))
    claim_unit = extract_unit(claim)

    # Weighbridge → input weight
    weighbridge = by_type.get("weighbridge", [{}])[0] if "weighbridge" in by_type else {}
    input_weight = extract_quantity(
        weighbridge.get("data", {}),
        ["weight", "quantity", "inputWeight"],
    )

    # Processing log → output weight
    processing = by_type.get("processing_log", [{}])[0] if "processing_log" in by_type else {}
    output_weight = extract_quantity(
        processing.get("data", {}),
        ["outputWeight", "quantity", "weight"],
    )
    processing_input = extract_quantity(
        processing.get("data", {}),
        ["inputWeight", "input", "weight"],
    )

    # Downstream invoice → downstream quantity
    downstream = by_type.get("downstream_invoice", [{}])[0] if "downstream_invoice" in by_type else {}
    downstream_quantity = extract_quantity(
        downstream.get("data", {}),
        ["quantity", "weight"],
    )

    # Capacity
    capacity_ev = by_type.get("capacity", [{}])[0] if "capacity" in by_type else {}
    capacity = extract_quantity(
        capacity_ev.get("data", {}),
        ["capacity", "quantity", "weight"],
    )

    # Units from evidence
    evidence_units = set()
    for item in evidence:
        u = extract_unit(item.get("data", {}), "")
        if u:
            evidence_units.add(u)

    # Required evidence types
    required_types = ["weighbridge", "processing_log", "downstream_invoice"]
    missing_evidence = [t for t in required_types if t not in by_type or not by_type[t]]

    return {
        "claim_quantity": claim_quantity,
        "claim_unit": claim_unit,
        "input_weight": input_weight,
        "output_weight": output_weight,
        "processing_input": processing_input,
        "downstream_quantity": downstream_quantity,
        "capacity": capacity,
        "evidence_units": evidence_units,
        "missing_evidence": missing_evidence,
        "evidence_types_present": list(by_type.keys()),
    }
