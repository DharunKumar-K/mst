# Chain and Attestation Integration

This document defines the frozen blockchain interface for the CirqProof project.

## CirqProofRegistry Interface

### States
The on-chain state machine for a batch includes:
- `CREATED`
- `EVIDENCE_COMMITTED`
- `AI_ANALYZED`
- `ATTESTED`
- `VERIFIED`
- `CHALLENGED`
- `UNDER_REVIEW`
- `RESOLVED`
- `SETTLED`

### Functions
- `registerParticipant(address participant)`
- `createBatch(string batchId)`
- `commitEvidence(string batchId, string evidenceHash)`
- `recordAiResult(string batchId, string resultHash)`
- `submitAttestation(string batchId)`
- `verifyAttestation(string batchId)`
- `challengeAttestation(string batchId)`
- `resolveChallenge(string batchId, bool isVerified)`

### Events
- `BatchCreated(string batchId, address creator)`
- `EvidenceCommitted(string batchId, string evidenceHash)`
- `AiResultRecorded(string batchId, string resultHash)`
- `AttestationSubmitted(string batchId, address attestor)`
- `AttestationVerified(string batchId)`
- `AttestationChallenged(string batchId, address challenger)`
- `ChallengeResolved(string batchId, bool isVerified)`

## CirqProofSettlement Interface

### Functions
- `deposit(string batchId) payable`
- `release(string batchId)`
- `hold(string batchId)`
- `refund(string batchId)`

### Events
- `Deposited(string batchId, address depositor, uint256 amount)`
- `Released(string batchId, address recipient, uint256 amount)`
- `Held(string batchId)`
- `Refunded(string batchId, address recipient, uint256 amount)`