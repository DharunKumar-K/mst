/**
 * Weight Generator — produces deterministic weight measurements
 * across the recycling lifecycle.
 *
 * input → processed → recovered → residue
 *
 * Controlled noise is applied via seeded randomness so results
 * are reproducible for any given seed.
 */

const { seededRandom, hashCode } = require('./batch.generator');

/**
 * Apply bounded noise to a value.
 * @param {number} value     base value
 * @param {number} noisePct  max % deviation (e.g. 0.02 = ±2%)
 * @param {Function} rng     seeded random function
 * @returns {number}         value with noise, rounded to 1 decimal
 */
function withNoise(value, noisePct, rng) {
  const deviation = value * noisePct * (2 * rng() - 1);
  return Math.round((value + deviation) * 10) / 10;
}

/**
 * @param {object} options
 * @param {number} options.inputWeight
 * @param {number} options.processedWeight
 * @param {number} options.recoveredWeight
 * @param {number} [options.seed]
 * @param {string} [options.batchId]
 * @param {number} [options.noisePct]  max noise percentage (default 0 = deterministic)
 * @param {string} [options.unit]
 * @returns {object} weight measurements
 */
function generateWeights(options = {}) {
  const seed = options.seed ?? hashCode(options.batchId || 'default');
  const rng = seededRandom(seed);
  const noisePct = options.noisePct ?? 0;
  const unit = options.unit || 'kg';

  const inputWeight = withNoise(options.inputWeight || 1000, noisePct, rng);
  const processedWeight = withNoise(options.processedWeight || inputWeight * 0.95, noisePct, rng);
  const recoveredWeight = withNoise(options.recoveredWeight || processedWeight * 0.72, noisePct, rng);
  const residueWeight = Math.round((processedWeight - recoveredWeight) * 10) / 10;

  return {
    inputWeight,
    processedWeight,
    recoveredWeight,
    residueWeight,
    unit,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { generateWeights, withNoise };
