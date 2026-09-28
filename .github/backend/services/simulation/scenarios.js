/**
 * Scenario Engine — deterministic scenario execution for NORMAL, INCONSISTENT, TAMPERED.
 *
 * Each scenario produces a complete SimulationEvent with all generator outputs.
 * Scenarios are NOT random — they are fully deterministic so that:
 *   NORMAL       → CONSISTENT      every time
 *   INCONSISTENT → FLAGGED          every time
 *   TAMPERED     → FLAGGED          every time
 */

const path = require('node:path');
const { generateBatch } = require('./generators/batch.generator');
const { generateWeights } = require('./generators/weight.generator');
const { generateProcessing } = require('./generators/processing.generator');
const { generateRecovery } = require('./generators/recovery.generator');
const { generateTelemetry } = require('./generators/telemetry.generator');
const { generateDownstream } = require('./generators/downstream.generator');

const SCENARIOS_DIR = path.resolve(__dirname, '../../../shared/scenarios');

function loadScenarioDefinition(scenarioName) {
  const filePath = path.join(SCENARIOS_DIR, `${scenarioName.toLowerCase()}.json`);
  // Clear require cache so file changes are picked up
  delete require.cache[require.resolve(filePath)];
  return require(filePath);
}

/**
 * Generate a complete SimulationEvent from a scenario.
 *
 * @param {string} scenario    NORMAL | INCONSISTENT | TAMPERED
 * @param {string} [batchId]   override batch ID
 * @returns {object}           SimulationEvent
 */
function runScenario(scenario, batchId) {
  const def = loadScenarioDefinition(scenario);
  const effectiveBatchId = batchId || def.batch.batchId;

  const batch = generateBatch({
    batchId: effectiveBatchId,
    producer: def.batch.producer,
    recycler: def.batch.recycler,
    material: def.batch.material,
    claimQuantity: def.batch.claim.quantity,
    claimUnit: def.batch.claim.unit,
  });

  const weights = generateWeights({
    inputWeight: def.inputWeight,
    processedWeight: def.processedWeight,
    recoveredWeight: def.recoveredEvidenceWeight,
    batchId: effectiveBatchId,
    noisePct: 0, // deterministic — no noise
  });

  const processing = generateProcessing({
    inputWeight: def.inputWeight,
    outputWeight: def.recoveredEvidenceWeight,
    batchId: effectiveBatchId,
  });

  const recovery = generateRecovery({
    recoveredWeight: def.recoveredEvidenceWeight,
    material: def.batch.material,
    batchId: effectiveBatchId,
  });

  const telemetry = generateTelemetry({
    batchId: effectiveBatchId,
    inputWeight: def.inputWeight,
  });

  const downstream = generateDownstream({
    downstreamWeight: def.downstreamWeight,
    batchId: effectiveBatchId,
  });

  return {
    scenario,
    batch,
    weights,
    processing,
    recovery,
    telemetry,
    downstream,
    definition: def,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * List available scenarios.
 * @returns {string[]}
 */
function listScenarios() {
  return ['NORMAL', 'INCONSISTENT', 'TAMPERED'];
}

/**
 * Load all scenario definitions.
 * @returns {object[]}
 */
function loadAllScenarios() {
  return listScenarios().map((name) => ({
    name,
    definition: loadScenarioDefinition(name),
  }));
}

module.exports = { runScenario, listScenarios, loadAllScenarios, loadScenarioDefinition };
