/**
 * Recovery Generator — simulates material recovery from processing.
 *
 * Generates:
 * - recovered materials list
 * - recovery quantity per material type
 */

const { seededRandom, hashCode } = require('./batch.generator');

const RECOVERY_MATERIALS = ['polymer pellets', 'PET flakes', 'HDPE granules', 'aluminium ingots', 'glass cullet'];

/**
 * @param {object} options
 * @param {number} options.recoveredWeight      total recovered weight
 * @param {string} [options.material]           primary material type
 * @param {string} [options.batchId]
 * @param {number} [options.seed]
 * @param {string} [options.unit]
 * @returns {object} recovery event data
 */
function generateRecovery(options = {}) {
  const seed = options.seed ?? hashCode(options.batchId || 'default');
  const rng = seededRandom(seed + 200);
  const unit = options.unit || 'kg';

  const totalRecovered = options.recoveredWeight || 680;
  const primaryMaterial = options.material || 'recycled polymer';

  // Primary material gets 85-95% of recovered weight
  const primaryRatio = 0.85 + rng() * 0.10;
  const primaryQuantity = Math.round(totalRecovered * primaryRatio * 10) / 10;
  const secondaryQuantity = Math.round((totalRecovered - primaryQuantity) * 10) / 10;

  const materials = [
    {
      material: primaryMaterial,
      quantity: primaryQuantity,
      unit,
      grade: 'A',
    },
  ];

  if (secondaryQuantity > 0) {
    materials.push({
      material: 'mixed residuals',
      quantity: secondaryQuantity,
      unit,
      grade: 'B',
    });
  }

  return {
    totalRecovered,
    unit,
    materials,
    recoveryRate: Math.round((primaryQuantity / totalRecovered) * 10000) / 100,
    timestamp: new Date().toISOString(),
  };
}

module.exports = { generateRecovery };
