# CirqProof

CirqProof is a simulation-only circular-material evidence and verification platform. It records batch evidence off-chain, reconciles claims against evidence, and exposes stable interfaces for the frontend, AI service, simulator, and future attestation integrations.

## Repository layout

- `backend/`: Express API, MongoDB models, authentication, evidence integrity, and AI client.
- `shared/`: frozen enums, API contracts, and demo scenarios shared across services.
- `ai-service/`, `simulator/`, `contracts/`, and `frontend/`: integration surfaces for parallel work.
- `docs/`: implementation and operational documentation.

## Backend quick start

Requirements: Node.js 18+ and MongoDB 6+.

```sh
cd backend
npm install
cp .env.example .env
npm run dev
```

The API defaults to `http://localhost:4000`. Set `AI_MOCK=true` to use the deterministic local reconciliation response while the AI service is unavailable. Evidence files are stored outside MongoDB under `backend/storage/evidence` by default.

See [shared/api/core.md](shared/api/core.md) for endpoint contracts and [shared/api/evidence-event.md](shared/api/evidence-event.md) for the shared evidence event shape.