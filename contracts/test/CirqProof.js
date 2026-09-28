import { expect } from "chai";
import hre from "hardhat";

describe("CirqProof", function () {
  let registry;
  let settlement;
  let owner;
  let participant;
  let aiService;
  let challenger;
  const batchId = "batch-001";
  const evidenceHash = "hash123";
  const aiResultHash = "result123";

  beforeEach(async function () {
    [owner, participant, aiService, challenger] = await hre.ethers.getSigners();

    const Registry = await hre.ethers.getContractFactory("CirqProofRegistry");
    registry = await Registry.deploy();

    const Settlement = await hre.ethers.getContractFactory("CirqProofSettlement");
    settlement = await Settlement.deploy(await registry.getAddress());

    await registry.setSettlementContract(await settlement.getAddress());
  });

  describe("Registry", function () {
    it("Should register a participant", async function () {
      await registry.registerParticipant(participant.address);
      expect(await registry.registeredParticipants(participant.address)).to.be.true;
    });

    it("Should create a batch", async function () {
      await registry.registerParticipant(participant.address);
      await registry.connect(participant).createBatch(batchId);
      
      const batch = await registry.batches(batchId);
      expect(batch.creator).to.equal(participant.address);
      expect(batch.state).to.equal(0); // CREATED
    });

    it("Should commit evidence", async function () {
      await registry.registerParticipant(participant.address);
      await registry.connect(participant).createBatch(batchId);
      
      await expect(registry.connect(participant).commitEvidence(batchId, evidenceHash))
        .to.emit(registry, "EvidenceCommitted")
        .withArgs(batchId, evidenceHash);

      const batch = await registry.batches(batchId);
      expect(batch.state).to.equal(1); // EVIDENCE_COMMITTED
    });

    it("Should record AI result", async function () {
      await registry.registerParticipant(participant.address);
      await registry.connect(participant).createBatch(batchId);
      await registry.connect(participant).commitEvidence(batchId, evidenceHash);
      
      await expect(registry.connect(aiService).recordAiResult(batchId, aiResultHash))
        .to.emit(registry, "AiResultRecorded")
        .withArgs(batchId, aiResultHash);

      const batch = await registry.batches(batchId);
      expect(batch.state).to.equal(2); // AI_ANALYZED
    });

    it("Should submit and verify attestation", async function () {
      await registry.registerParticipant(participant.address);
      await registry.connect(participant).createBatch(batchId);
      await registry.connect(participant).commitEvidence(batchId, evidenceHash);
      await registry.connect(aiService).recordAiResult(batchId, aiResultHash);

      await expect(registry.connect(participant).submitAttestation(batchId))
        .to.emit(registry, "AttestationSubmitted")
        .withArgs(batchId, participant.address);

      await expect(registry.verifyAttestation(batchId))
        .to.emit(registry, "AttestationVerified")
        .withArgs(batchId);
    });

    it("Should challenge and resolve attestation", async function () {
      await registry.registerParticipant(participant.address);
      await registry.connect(participant).createBatch(batchId);
      await registry.connect(participant).commitEvidence(batchId, evidenceHash);
      await registry.connect(aiService).recordAiResult(batchId, aiResultHash);
      await registry.connect(participant).submitAttestation(batchId);

      await registry.registerParticipant(challenger.address);
      await expect(registry.connect(challenger).challengeAttestation(batchId))
        .to.emit(registry, "AttestationChallenged")
        .withArgs(batchId, challenger.address);

      await expect(registry.resolveChallenge(batchId, true))
        .to.emit(registry, "ChallengeResolved")
        .withArgs(batchId, true);
    });

    it("Should revert on invalid state transitions", async function () {
      await registry.registerParticipant(participant.address);
      await registry.connect(participant).createBatch(batchId);
      
      await expect(registry.verifyAttestation(batchId)).to.be.revertedWith("Invalid state transition");
    });
  });

  describe("Settlement", function () {
    const depositAmount = hre.ethers.parseEther("1.0");

    beforeEach(async function () {
      await registry.registerParticipant(participant.address);
      await registry.connect(participant).createBatch(batchId);
    });

    it("Should deposit funds", async function () {
      await expect(settlement.connect(participant).deposit(batchId, { value: depositAmount }))
        .to.emit(settlement, "Deposited")
        .withArgs(batchId, participant.address, depositAmount);
    });

    it("Should release funds on verified batch", async function () {
      await settlement.connect(participant).deposit(batchId, { value: depositAmount });

      await registry.connect(participant).commitEvidence(batchId, evidenceHash);
      await registry.recordAiResult(batchId, aiResultHash);
      await registry.connect(participant).submitAttestation(batchId);
      await registry.verifyAttestation(batchId);
      
      const tx = await settlement.release(batchId);
      await tx.wait();
      
      const batch = await registry.batches(batchId);
      expect(batch.state).to.equal(8); // SETTLED

      const settlementData = await settlement.settlements(batchId);
      expect(settlementData.isSettled).to.be.true;
    });

    it("Should hold and refund on challenged batch", async function () {
      await settlement.connect(participant).deposit(batchId, { value: depositAmount });

      await expect(settlement.hold(batchId))
        .to.emit(settlement, "Held")
        .withArgs(batchId);

      await registry.connect(participant).commitEvidence(batchId, evidenceHash);
      await registry.recordAiResult(batchId, aiResultHash);
      await registry.connect(participant).submitAttestation(batchId);
      
      await registry.registerParticipant(challenger.address);
      await registry.connect(challenger).challengeAttestation(batchId);
      await registry.resolveChallenge(batchId, false);

      await expect(settlement.refund(batchId))
        .to.emit(settlement, "Refunded")
        .withArgs(batchId, participant.address, depositAmount);
    });

    it("Should prevent double release", async function () {
      await settlement.connect(participant).deposit(batchId, { value: depositAmount });

      await registry.connect(participant).commitEvidence(batchId, evidenceHash);
      await registry.recordAiResult(batchId, aiResultHash);
      await registry.connect(participant).submitAttestation(batchId);
      await registry.verifyAttestation(batchId);

      await settlement.release(batchId);
      
      await expect(settlement.release(batchId)).to.be.revertedWith("Already settled");
    });
  });
});
