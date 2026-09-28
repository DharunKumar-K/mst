# Simulation API Documentation

The simulation API generates fully deterministic `SimulationEvent` sets corresponding to realistic recycling operations. The backend `adapter.js` converts these to the common `EvidenceEvent` format.

**Base Route**: `/api/simulation`

## 1. POST `/generate`
Triggers the full scenario pipeline.

### Request Body
```json
{
  "scenario": "NORMAL", 
  "batchId": "CP-2026-001" 
}
```
*Note: `scenario` can be `NORMAL`, `INCONSISTENT`, or `TAMPERED`.*

### Response
```json
{
  "ok": true,
  "data": {
    "runId": "uuid...",
    "batchId": "CP-2026-001",
    "scenario": "NORMAL",
    "status": "COMPLETED",
    "events": [
      {
        "eventId": "uuid...",
        "type": "weighbridge",
        "timestamp": "2026-09-28T12:00:00Z",
        "data": { "weight": 1000, "unit": "kg" }
      }
    ]
  }
}
```

## 2. GET `/scenarios`
Gets all available scenario parameters for the UI Simulator Control Panel.

### Response
```json
{
  "ok": true,
  "data": {
    "scenarios": [
      {
        "name": "NORMAL",
        "definition": {
          "inputWeight": 1000,
          "processedWeight": 950,
          "claimedRecoveredWeight": 675,
          "expectedStatus": "CONSISTENT"
        }
      }
    ]
  }
}
```

## 3. POST `/tamper/:batchId`
Simulates a malicious actor modifying committed evidence records *after* they were stored on-chain. Required for the `TAMPERED` scenario.

### Request Body
```json
{
  "data": { "outputWeight": 1200 }
}
```

### Response
```json
{
  "ok": true,
  "data": {
    "evidenceId": "uuid...",
    "originalHash": "0xabc...",
    "newHash": "0xdef...",
    "message": "Evidence tampered successfully"
  }
}
```