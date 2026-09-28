# Chain and attestation integration

The first release is simulation-only: there is no blockchain transaction or on-chain write. Batch documents reserve `chainRefs` with `txHash` and `attestationId` fields; the batch service exposes `setChainRefs(batchId, { txHash, attestationId })` for an eventual adapter.

The automatic route loader will mount a future `attestation.routes.js` at `/api/attestation`. Before enabling it, define its operations, errors, and transaction/attestation response contract here. Until then `chainRefs` remain empty and are not proof of on-chain verification.