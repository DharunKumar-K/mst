# AI service integration

The backend owns the public `POST /api/ai/reconcile` and `GET /api/ai/report/:batchId` routes. `backend/services/ai/aiClient.js` calls the separately owned FastAPI service using `AI_SERVICE_URL`; set `AI_MOCK=true` for a deterministic local response during parallel development.

The client sends `{ "batch": ..., "evidence": [...] }`. The service result is normalized to `status`, `massBalanceResult`, `capacityResult`, `downstreamMatch`, `flags`, `missingEvidence`, `explanation`, and `recommendation` before persistence as an `AiReport`. Service-specific endpoints and request/response schemas should be finalized by the AI service owner.