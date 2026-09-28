# Simulation API

Reserved for the simulator integration. Simulator events must conform to [EvidenceEvent](evidence-event.md), use `origin: "simulation"`, and enter the backend through the shared evidence ingestion service.

The route loader automatically mounts `backend/routes/simulation.routes.js` at `/api/simulation` when that file is added. The route owner must document request, success, and error examples here before the integration is considered stable.