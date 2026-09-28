# AI Service API Documentation

The AI service handles evidence reconciliation using a deterministic rules engine with an LLM fallback for explanations. It provides endpoints for reconciliation, document extraction, and anomaly checking.

**Base URL**: `http://localhost:8000` (or `AI_SERVICE_URL` from the backend)

## 1. POST `/reconcile`
Runs all deterministic rules and generates an LLM-based explanation for the batch.

### Request Body
```json
{
  "batch": {
    "batchId": "CP-2026-001",
    "producer": "Dell",
    "recycler": "Recycler-A",
    "material": "Polymer",
    "claim": {
      "quantity": 680,
      "unit": "kg"
    }
  },
  "evidence": [
    {
      "evidenceId": "ev-01",
      "type": "weighbridge",
      "data": { "weight": 1000, "unit": "kg" },
      "fileHash": "0xabc...",
      "timestamp": "2026-09-28T10:00:00Z"
    }
  ],
  "integrityResult": {
    "allHashesMatch": true,
    "mismatchedEvidenceIds": []
  }
}
```

### Response
```json
{
  "status": "FLAGGED", 
  "massBalanceResult": {
    "input": 1000.0,
    "output": 680.0,
    "claim": 680.0
  },
  "capacityResult": {
    "capacity": 1200.0,
    "input": 1000.0,
    "withinCapacity": true
  },
  "downstreamMatch": {
    "quantity": 675.0,
    "matchesClaim": false
  },
  "flags": [
    "CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM"
  ],
  "missingEvidence": [],
  "explanation": "Evidence inconsistency detected: the claimed recovery of 680.0 kg exceeds the downstream-supported quantity of 675.0 kg.",
  "recommendation": "Review the flagged inconsistencies and supply corrected evidence before verification."
}
```

## 2. POST `/rules/check`
Runs only the deterministic rules without calling the LLM. Extremely fast and fully reproducible. Takes the identical request body as `/reconcile`.

## 3. POST `/document-extract`
Extracts structured data from uploaded files.

### Request Body
```json
{
  "file_name": "invoice.pdf",
  "file_type": "application/pdf",
  "content_base64": "JVBERi0xLjQKJcO..."
}
```

### Response
```json
{
  "ok": true,
  "data": {
    "file_name": "invoice.pdf",
    "file_type": "application/pdf",
    "size_bytes": 1024,
    "extracted": {}
  }
}
```