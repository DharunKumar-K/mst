/**
 * Simulation Service — orchestrates full simulation runs.
 *
 * Flow:
 *   1. Run scenario → SimulationEvent
 *   2. Adapt → EvidenceEvent[]
 *   3. Create batch in DB
 *   4. Ingest each evidence event via P2's ingest()
 *   5. Optionally tamper evidence (TAMPERED scenario)
 *   6. Store SimulationRun record
 */

const crypto = require('node:crypto');
const Batch = require('../../models/Batch');
const SimulationRun = require('../../models/SimulationRun');
const { ingest } = require('../evidence/ingest');
const { overwriteEvidenceForSimulation, verifyIntegrity } = require('../evidence/integrity');
const { runScenario, listScenarios, loadAllScenarios } = require('./scenarios');
const { toEvidenceEvents, fromScenarioDefinition } = require('./adapter');

/**
 * Execute a full simulation run for a given scenario.
 *
 * @param {string} scenario    NORMAL | INCONSISTENT | TAMPERED
 * @param {string} [batchId]   optional batch ID override
 * @returns {object}           { run, batch, events, evidenceResults }
 */
async function generate(scenario, batchId) {
  const validScenarios = listScenarios();
  const normalizedScenario = String(scenario).toUpperCase();
  if (!validScenarios.includes(normalizedScenario)) {
    throw Object.assign(
      new Error(`Invalid scenario: ${scenario}. Must be one of: ${validScenarios.join(', ')}`),
      { status: 400 }
    );
  }

  const simEvent = runScenario(normalizedScenario, batchId);
  const effectiveBatchId = simEvent.batch.batchId;

  // Create batch in database
  const existingBatch = await Batch.findOne({ batchId: effectiveBatchId });
  let batch;
  if (existingBatch) {
    batch = existingBatch;
  } else {
    batch = await Batch.create({
      batchId: effectiveBatchId,
      producer: simEvent.batch.producer,
      recycler: simEvent.batch.recycler,
      material: simEvent.batch.material,
      claim: simEvent.batch.claim,
      status: 'CREATED',
    });
  }

  // Convert to evidence events and ingest
  const evidenceEvents = toEvidenceEvents(simEvent);
  const evidenceResults = [];
  const ingestedEventIds = [];

  for (const event of evidenceEvents) {
    try {
      const result = await ingest(event);
      evidenceResults.push({ eventId: event.eventId, status: 'ingested', evidenceId: result.evidence.evidenceId });
      ingestedEventIds.push(event.eventId);
    } catch (error) {
      evidenceResults.push({ eventId: event.eventId, status: 'error', error: error.message });
    }
  }

  // For TAMPERED scenario: overwrite the processing_log evidence to simulate tampering
  if (normalizedScenario === 'TAMPERED') {
    const processingEvent = evidenceResults.find((r) => r.eventId.includes('processing') && r.status === 'ingested');
    if (processingEvent) {
      try {
        // Overwrite the stored artifact with tampered data
        // Original committed evidence says outputWeight = recoveredEvidenceWeight (680)
        // Tampered data changes it to claimedRecoveredWeight (900)
        await overwriteEvidenceForSimulation(processingEvent.evidenceId || processingEvent.eventId, {
          inputWeight: simEvent.definition.inputWeight,
          outputWeight: simEvent.definition.claimedRecoveredWeight, // tampered: 900 instead of 680
          unit: 'kg',
          runtime: simEvent.processing.runtime,
          status: simEvent.processing.status,
          machineLoad: simEvent.processing.machineLoad,
          tampered: true,
        });
        evidenceResults.push({ eventId: 'tamper-action', status: 'tampered', target: processingEvent.eventId });
      } catch (error) {
        evidenceResults.push({ eventId: 'tamper-action', status: 'error', error: error.message });
      }
    }
  }

  // Create simulation run record
  const runId = `run-${crypto.randomUUID()}`;
  const run = await SimulationRun.create({
    runId,
    batchId: effectiveBatchId,
    scenario: normalizedScenario,
    startTime: new Date(simEvent.generatedAt),
    endTime: new Date(),
    events: evidenceResults,
    status: evidenceResults.every((r) => r.status !== 'error') ? 'COMPLETED' : 'PARTIAL',
  });

  return {
    run,
    batch,
    events: evidenceResults,
    simEvent,
  };
}

/**
 * Tamper with evidence for a specific batch (for demo purposes).
 *
 * @param {string} batchId
 * @param {object} [tamperedData]  optional replacement data
 * @returns {object}
 */
async function tamperBatch(batchId, tamperedData) {
  if (process.env.NODE_ENV === 'production') {
    throw Object.assign(new Error('Tampering is disabled in production'), { status: 403 });
  }

  const Evidence = require('../../models/Evidence');
  const processingEvidence = await Evidence.findOne({
    batchId,
    type: 'processing_log',
  });

  if (!processingEvidence) {
    throw Object.assign(new Error('No processing_log evidence found for this batch'), { status: 404 });
  }

  const replacement = tamperedData || {
    inputWeight: processingEvidence.data.inputWeight,
    outputWeight: (processingEvidence.data.outputWeight || 0) + 200, // inflate by 200kg
    unit: processingEvidence.data.unit || 'kg',
    tampered: true,
  };

  await overwriteEvidenceForSimulation(processingEvidence.evidenceId, replacement);

  // Verify integrity to confirm tampering is detectable
  const integrity = await verifyIntegrity(batchId);

  return {
    batchId,
    tamperedEvidenceId: processingEvidence.evidenceId,
    replacement,
    integrity,
  };
}

/**
 * Get events for a specific batch simulation.
 *
 * @param {string} batchId
 * @returns {object}
 */
async function getEventsByBatch(batchId) {
  const run = await SimulationRun.findOne({ batchId }).sort({ createdAt: -1 });
  if (!run) {
    throw Object.assign(new Error('No simulation run found for this batch'), { status: 404 });
  }
  return run;
}

module.exports = {
  generate,
  tamperBatch,
  getEventsByBatch,
  listScenarios,
  loadAllScenarios,
};
