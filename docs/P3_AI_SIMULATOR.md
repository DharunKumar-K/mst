# P3 — AI + Recycling Plant Simulator

This component generates realistic recycling plant data (Simulation) and validates it deterministically while using AI for human-readable explanations (Reconciliation).

## 1. Simulator Architecture
- **Generators**: Deterministic random generators for batch info, weights, processing metrics, recovery yields, telemetry, and downstream invoices.
- **Scenario Engine**: Executes predefined scenarios (`NORMAL`, `INCONSISTENT`, `TAMPERED`) reproducibly.
- **Adapter**: Maps simulator outputs to the standard `EvidenceEvent` interface defined by P2.
- **CLI (`simulator/cli.js`)**: Runs headless simulation tests and triggers AI reconciliation.

## 2. Evidence Event Structure
All simulator outputs are mapped to `EvidenceEvent[]` and ingested via P2's core `ingest()` function.
Types generated:
- `weighbridge` (Input weight)
- `processing_log` (Processed weight & runtime)
- `output_record` (Recovered material)
- `downstream_invoice` (Downstream buyer transaction)
- `telemetry` (Temp, energy, machine load)
- `capacity` (Plant limits)

## 3. Reconciliation Rules
Arithmetic verification is strictly deterministic. The LLM does NOT calculate anything.
1. **Unit Normalization**: Ensures all units match.
2. **Non-Negative Weights**: Weights must be ≥ 0.
3. **Logical Timestamps**: `weighbridge <= processing_log <= output_record <= downstream_invoice`.
4. **Mass Balance**: `processed_weight <= input_weight`.
5. **Recovery Check**: `recovered_weight <= processed_weight`.
6. **Capacity Check**: `input_weight <= plant_capacity`.
7. **Downstream Match**: `downstream_weight <= recovered_weight` and `claim <= downstream`.
8. **Claim vs Evidence**: `claim == processing_output`.
9. **Cross-source Differences**: Validates input weight from weighbridge vs processing log.
10. **Hash Integrity**: Validates if evidence was tampered with post-ingestion.

## 4. AI Explanation Flow
`P2 Backend` → `AI Service (/reconcile)`
1. **Deterministic Rules**: Runs all 10 rules.
2. **Status Determination**: Sets `CONSISTENT`, `FLAGGED`, or `REVIEW`.
3. **LLM Explanation**: Sends pre-calculated rule outputs to LLM (OpenAI/Gemini). LLM generates a neutral explanation ("EVIDENCE INCONSISTENCY", never "FRAUD").
4. **Template Fallback**: If LLM fails/is unavailable, uses pre-defined templates based on flags.

## 5. Normal Scenario
- **Goal**: Perfect mass balance and downstream support.
- **Flow**: Input (1000) → Processed (950) → Recovered (680) → Downstream (675). Claim = 680.
- **Expected Result**: `CONSISTENT`

## 6. Inconsistent Scenario
- **Goal**: Catch impossible mass balance / claim gaps.
- **Flow**: Processed/Recovered weights don't support the final claim, or downstream only bought 600 kg while claiming 900 kg.
- **Expected Result**: `FLAGGED` (`CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM`, etc.)

## 7. Tampered Scenario
- **Goal**: Catch post-ingestion modifications.
- **Flow**: Committed evidence says 680kg recovered. The data is tampered in the DB to say 900kg.
- **Expected Result**: `FLAGGED` (`CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE`, `EVIDENCE_HASH_MISMATCH`)

## 8. API Endpoints
### Backend Simulation APIs
- `POST /api/simulation/generate` - Run scenario & ingest
- `POST /api/simulation/events` - Ingest raw sim events
- `POST /api/simulation/tamper/:batchId` - Tamper evidence
- `GET /api/simulation/scenarios` - List scenarios
- `GET /api/simulation/events/:batchId` - Get batch events

### AI Service APIs
- `GET /health`
- `POST /reconcile` - Run rules + LLM explanation
- `POST /rules/check` - Run rules only (no LLM)

## 9. How to run the simulator
Using the CLI (Standalone Dry-Run):
```bash
node simulator/cli.js --scenario NORMAL --batch CP-001
node simulator/cli.js --list-scenarios
```
With Database (Requires `MONGODB_URI` in `backend/.env`):
```bash
node simulator/cli.js --full --scenario INCONSISTENT --batch CP-002
```

## 10. How to test each scenario
1. Normal: `node simulator/cli.js --scenario NORMAL`
2. Inconsistent: `node simulator/cli.js --scenario INCONSISTENT`
3. Tampered: `node simulator/cli.js --scenario TAMPERED`
Watch the output to ensure `Expected Outcome` matches the generated flags and `Reconciliation` status.
