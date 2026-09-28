// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract CirqProofRegistry {
    enum BatchState {
        CREATED,
        EVIDENCE_COMMITTED,
        AI_ANALYZED,
        ATTESTED,
        VERIFIED,
        CHALLENGED,
        UNDER_REVIEW,
        RESOLVED,
        SETTLED
    }

    struct Batch {
        string batchId;
        address creator;
        BatchState state;
        string evidenceHash;
        string aiResultHash;
        address attestor;
        address challenger;
    }

    mapping(string => Batch) public batches;
    mapping(address => bool) public registeredParticipants;

    address public settlementContract;

    event BatchCreated(string batchId, address creator);
    event EvidenceCommitted(string batchId, string evidenceHash);
    event AiResultRecorded(string batchId, string resultHash);
    event AttestationSubmitted(string batchId, address attestor);
    event AttestationVerified(string batchId);
    event AttestationChallenged(string batchId, address challenger);
    event ChallengeResolved(string batchId, bool isVerified);

    modifier onlyParticipant() {
        require(registeredParticipants[msg.sender], "Not a registered participant");
        _;
    }

    modifier batchExists(string memory batchId) {
        require(batches[batchId].creator != address(0), "Batch does not exist");
        _;
    }

    function setSettlementContract(address _settlementContract) external {
        require(settlementContract == address(0), "Settlement contract already set");
        settlementContract = _settlementContract;
    }

    function registerParticipant(address participant) external {
        registeredParticipants[participant] = true;
    }

    function createBatch(string memory batchId) external onlyParticipant {
        require(batches[batchId].creator == address(0), "Batch already exists");
        
        batches[batchId] = Batch({
            batchId: batchId,
            creator: msg.sender,
            state: BatchState.CREATED,
            evidenceHash: "",
            aiResultHash: "",
            attestor: address(0),
            challenger: address(0)
        });

        emit BatchCreated(batchId, msg.sender);
    }

    function commitEvidence(string memory batchId, string memory evidenceHash) external onlyParticipant batchExists(batchId) {
        Batch storage batch = batches[batchId];
        require(batch.state == BatchState.CREATED, "Invalid state transition");
        require(batch.creator == msg.sender, "Not the batch creator");

        batch.evidenceHash = evidenceHash;
        batch.state = BatchState.EVIDENCE_COMMITTED;

        emit EvidenceCommitted(batchId, evidenceHash);
    }

    function recordAiResult(string memory batchId, string memory resultHash) external batchExists(batchId) {
        Batch storage batch = batches[batchId];
        require(batch.state == BatchState.EVIDENCE_COMMITTED, "Invalid state transition");

        batch.aiResultHash = resultHash;
        batch.state = BatchState.AI_ANALYZED;

        emit AiResultRecorded(batchId, resultHash);
    }

    function submitAttestation(string memory batchId) external onlyParticipant batchExists(batchId) {
        Batch storage batch = batches[batchId];
        require(batch.state == BatchState.AI_ANALYZED, "Invalid state transition");
        
        batch.attestor = msg.sender;
        batch.state = BatchState.ATTESTED;

        emit AttestationSubmitted(batchId, msg.sender);
    }

    function verifyAttestation(string memory batchId) external batchExists(batchId) {
        Batch storage batch = batches[batchId];
        require(batch.state == BatchState.ATTESTED, "Invalid state transition");

        batch.state = BatchState.VERIFIED;

        emit AttestationVerified(batchId);
    }

    function challengeAttestation(string memory batchId) external onlyParticipant batchExists(batchId) {
        Batch storage batch = batches[batchId];
        require(batch.state == BatchState.ATTESTED || batch.state == BatchState.VERIFIED, "Invalid state transition");

        batch.challenger = msg.sender;
        batch.state = BatchState.CHALLENGED;

        emit AttestationChallenged(batchId, msg.sender);
    }

    function resolveChallenge(string memory batchId, bool isVerified) external batchExists(batchId) {
        Batch storage batch = batches[batchId];
        require(batch.state == BatchState.CHALLENGED || batch.state == BatchState.UNDER_REVIEW, "Invalid state transition");

        batch.state = BatchState.RESOLVED;

        emit ChallengeResolved(batchId, isVerified);
    }

    function setSettled(string memory batchId) external batchExists(batchId) {
        require(msg.sender == settlementContract, "Only settlement contract");
        Batch storage batch = batches[batchId];
        require(batch.state == BatchState.VERIFIED || batch.state == BatchState.RESOLVED, "Invalid state transition for settlement");
        
        batch.state = BatchState.SETTLED;
    }
}
