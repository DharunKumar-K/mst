import pytest
from rules.engine import (
    rule_mass_balance,
    rule_capacity_check,
    rule_downstream_match,
    rule_claim_vs_evidence,
    rule_logical_timestamps,
    rule_non_negative_weights,
    rule_unit_normalization
)

def test_mass_balance_rule_pass():
    res = rule_mass_balance({"input_weight": 1000, "output_weight": 950})
    assert res["passed"] is True
    assert res["flag"] is None
    assert res["difference"] == 0

def test_mass_balance_rule_fail():
    res = rule_mass_balance({"input_weight": 1000, "output_weight": 1050})
    assert res["passed"] is False
    assert res["flag"] == "MASS_BALANCE_MISMATCH"
    assert res["difference"] == 50

def test_capacity_rule_pass():
    res = rule_capacity_check({"input_weight": 1000, "capacity": 1200})
    assert res["passed"] is True
    assert res["flag"] is None

def test_capacity_rule_fail():
    res = rule_capacity_check({"input_weight": 1300, "capacity": 1200})
    assert res["passed"] is False
    assert res["flag"] == "CAPACITY_EXCEEDED"

def test_downstream_rule_pass():
    res = rule_downstream_match({"claim_quantity": 680, "downstream_quantity": 700, "recovered_weight": 700})
    assert res["passed"] is True
    assert res["flag"] is None

def test_downstream_rule_fail():
    res = rule_downstream_match({"claim_quantity": 680, "downstream_quantity": 670, "recovered_weight": 700})
    assert res["passed"] is False
    assert res["flag"] == "CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM"

def test_claim_vs_evidence_pass():
    res = rule_claim_vs_evidence({"claim_quantity": 675, "output_weight": 680})
    assert res["passed"] is True
    assert res["flag"] is None

def test_claim_vs_evidence_fail():
    res = rule_claim_vs_evidence({"claim_quantity": 685, "output_weight": 680})
    assert res["passed"] is False
    assert res["flag"] == "CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE"

def test_timestamps_pass():
    timestamps = {
        "weighbridge": "2026-09-28T10:00:00Z",
        "processing_log": "2026-09-28T11:00:00Z",
        "output_record": "2026-09-28T12:00:00Z"
    }
    res = rule_logical_timestamps({"timestamps": timestamps})
    assert res["passed"] is True
    assert res["flag"] is None

def test_timestamps_fail():
    timestamps = {
        "weighbridge": "2026-09-28T12:00:00Z",
        "processing_log": "2026-09-28T11:00:00Z", # before input!
        "output_record": "2026-09-28T10:00:00Z"
    }
    res = rule_logical_timestamps({"timestamps": timestamps})
    assert res["passed"] is False
    assert res["flag"] == "INVALID_TIMESTAMP_ORDER"

def test_negative_weights_fail():
    res = rule_non_negative_weights({
        "input_weight": 1000,
        "output_weight": -50, # negative
        "recovered_weight": 950,
        "downstream_quantity": 900,
        "capacity": 2000,
        "claim_quantity": 900
    })
    assert res["passed"] is False
    assert res["flag"] == "INVALID_WEIGHT"

def test_unit_consistency_fail():
    res = rule_unit_normalization({
        "claim_unit": "kg",
        "evidence_units": {"kg", "lbs"}
    })
    assert res["passed"] is False
    assert res["flag"] == "UNIT_MISMATCH"
