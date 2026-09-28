# Core API contract

Base URL: `/api`. JSON endpoints use `Content-Type: application/json` unless noted. Protected endpoints require `Authorization: Bearer <token>`. Every response uses `{ "ok": true, "data": ... }` or `{ "ok": false, "error": "..." }`.

### `GET /health` (unprotected)

Request: no body.

Success `200`: `{ "ok": true, "data": { "status": "ok" } }`.

Error: no application-specific error response; an unavailable process cannot serve this endpoint. Example: `{ "ok": false, "error": "Internal server error" }`.

## Authentication

### `POST /auth/register`

Request: `{ "name": "Dell", "email": "dell@example.test", "password": "change-me", "role": "PRODUCER" }` (`role` is optional; public registration is restricted to producer/recycler).

Success `201`: `{ "ok": true, "data": { "user": { "id": "...", "name": "Dell", "email": "dell@example.test", "role": "PRODUCER" }, "token": "<jwt>" } }`.

Error: `400` for invalid input, `409` for an existing email. Example: `{ "ok": false, "error": "Email is already registered" }`.

### `POST /auth/login`

Request: `{ "email": "dell@example.test", "password": "change-me" }`.

Success `200`: same `user` and `token` shape as register. Error: `401` for invalid credentials. Example: `{ "ok": false, "error": "Invalid email or password" }`.

### `GET /auth/me` (authenticated)

Request: no body.

Success `200`: `{ "ok": true, "data": { "user": { "id": "...", "name": "Dell", "email": "dell@example.test", "role": "PRODUCER" } } }`.

Error: `401` for a missing, invalid, or expired token. Example: `{ "ok": false, "error": "Authentication required" }`.

## Batches

### `POST /batches` (authenticated)

Request: `{ "batchId": "CP-2026-001", "producer": "Dell", "recycler": "Recycler-A", "material": "recycled polymer", "claim": { "quantity": 900, "unit": "kg" } }`.

Success `201`: `{ "ok": true, "data": { "batch": { "batchId": "CP-2026-001", "status": "CREATED", "evidenceRoot": null } } }`.

Error: `400` for missing/invalid fields, `409` for duplicate batch id. Example: `{ "ok": false, "error": "Batch CP-2026-001 already exists" }`.

### `GET /batches` (authenticated)

Request: no body; optional `?page=1&limit=20`.

Success `200`: `{ "ok": true, "data": { "batches": [], "page": 1, "limit": 20, "total": 0 } }`.

Error: `400` for invalid pagination. Example: `{ "ok": false, "error": "Invalid pagination parameters" }`.

### `GET /batches/:id` (authenticated)

Request: path id is the batch id.

Success `200`: `{ "ok": true, "data": { "batch": {} } }`.

Error: `404` when absent. Example: `{ "ok": false, "error": "Batch not found" }`.

## Evidence

### `POST /evidence/upload` (authenticated, multipart form)

Fields: `batchId`, `type`, `source`, `timestamp`, `data` (JSON string), optional file field `file`. The route builds an `EvidenceEvent` with `origin: "upload"` and calls the same ingestion service used by simulation.

Success `201`: `{ "ok": true, "data": { "evidence": { "evidenceId": "...", "batchId": "CP-2026-001", "type": "weighbridge", "fileHash": "<sha256>" }, "evidenceRoot": "<sha256>" } }`.

Error: `400` invalid event, `404` missing batch, `413` file too large. Example: `{ "ok": false, "error": "Evidence file exceeds the 10 MB limit" }`.

### `POST /evidence/events` (authenticated, JSON)

Request: one [EvidenceEvent](evidence-event.md) JSON object. The supplied `origin` is preserved, allowing simulation and upload adapters to invoke the same ingestion function.

Success `201`: `{ "ok": true, "data": { "evidence": { "evidenceId": "...", "batchId": "CP-2026-001", "fileHash": "<sha256>" }, "evidenceRoot": "<sha256>" } }`.

Error: `400` invalid event, `404` missing batch. Example: `{ "ok": false, "error": "Unsupported evidence type" }`.

### `GET /evidence/:batchId`

Request: batch id in path.

Success `200`: `{ "ok": true, "data": { "evidence": [], "evidenceRoot": "<sha256-or-null>" } }`.

Error: `404` unknown batch. Example: `{ "ok": false, "error": "Batch not found" }`.

### `GET /evidence/:batchId/integrity`

Request: batch id in path.

Success `200`: `{ "ok": true, "data": { "allHashesMatch": true, "mismatchedEvidenceIds": [] } }`.

Error: `404` unknown batch. Example: `{ "ok": false, "error": "Batch not found" }`.

## AI reconciliation

### `POST /ai/reconcile` (authenticated)

Request: `{ "batchId": "CP-2026-001" }`.

Success `200`: `{ "ok": true, "data": { "report": { "batchId": "CP-2026-001", "status": "CONSISTENT", "flags": [] } } }`.

Error: `404` unknown batch, `502` AI service unavailable when mock mode is disabled. Example: `{ "ok": false, "error": "AI service unavailable" }`.

### `GET /ai/report/:batchId`

Request: batch id in path.

Success `200`: `{ "ok": true, "data": { "report": {} } }`.

Error: `404` when batch/report is absent. Example: `{ "ok": false, "error": "AI report not found" }`.

## Integration endpoints reserved for parallel work

The automatic route loader mounts future `simulation.routes.js` and `attestation.routes.js` at `/api/simulation` and `/api/attestation`. Their request/response contracts belong in `simulation.md` and `chain.md`; they are not implemented by this scaffold.