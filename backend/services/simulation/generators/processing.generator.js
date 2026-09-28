/**
 * Processing Generator — simulates recycling processing events.
 *
 * Generates:
 * - runtime (minutes)
 * - processing status (complete, partial, error)
 * - machine load percentage
 */

const { seededRandom, hashCode } = require('./batch.generator');

const PROCESSING_STATUSES = ['complete', 'partial'];

/**
 * @param {object} options
 * @param {number} options.inputWeight
 * @param {number} options.outputWeight
 * @param {string} [options.batchId]
 * @param {number} [options.seed]
 * @param {string} [options.unit]
 * @returns {object} processing event data
 */
function generateProcessing(options = {}) {
  const seed = options.seed ?? hashCode(options.batchId || 'default');
  const rng = seededRandom(seed + 100); // offset seed so it differs from weight gen

  const inputWeight = options.inputWeight || 1000;
  const outputWeight = options.outputWeight || inputWeight * 0.95;
  const unit = options.unit || 'kg';

  // Runtime scales with input weight: ~1 min per 10kg, with some variation
  const baseRuntime = Math.round(inputWeight / 10);
  const runtime = Math.max(10, Math.round(baseRuntime * (0.8 + rng() * 0.4)));

  // Machine load: 40-95%
  const machineLoad = Math.round((40 + rng() * 55) * 10) / 10;

  // Status: deterministic based on whether output >= 90% of input
  const yieldRatio = outputWeight / inputWeight;
  const status = yieldRatio >= 0.5 ? 'complete' : 'partial';

  return {
    inputWeight,
    outputWeight,
    unit,
    runtime,
    status,
    machineLoad,
    yieldRatio: Math.round(yieldRatio * 10000) / 100,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { generateProcessing };
