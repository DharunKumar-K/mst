/**
 * Downstream Generator — simulates buyer/downstream transaction data.
 *
 * Generates:
 * - buyer identity
 * - output quantity
 * - transaction amount
 * - timestamp
 */

const { seededRandom, hashCode, pick } = require('./batch.generator');

const BUYERS = [
  'AcmePlastics Corp',
  'GreenBuild Materials',
  'CircularTech Solutions',
  'EcoFab Industries',
  'ReNew Polymers Ltd',
];

/**
 * @param {object} options
 * @param {number} options.downstreamWeight   quantity reaching buyer
 * @param {string} [options.batchId]
 * @param {number} [options.seed]
 * @param {string} [options.unit]
 * @param {string} [options.buyer]
 * @returns {object} downstream event data
 */
function generateDownstream(options = {}) {
  const seed = options.seed ?? hashCode(options.batchId || 'default');
  const rng = seededRandom(seed + 400);
  const unit = options.unit || 'kg';

  const quantity = options.downstreamWeight || 675;
  const buyer = options.buyer || pick(BUYERS, rng);

  // Price per kg: $0.80 - $2.50 depending on material
  const pricePerKg = Math.round((0.80 + rng() * 1.70) * 100) / 100;
  const transactionAmount = Math.round(quantity * pricePerKg * 100) / 100;

  // Transaction date: within 1-5 days after processing
  const now = new Date();
  const daysAfter = 1 + Math.floor(rng() * 5);
  const transactionDate = new Date(now.getTime() + daysAfter * 24 * 60 * 60 * 1000);

  return {
    buyer,
    quantity,
    unit,
    pricePerKg,
    transactionAmount,
    currency: 'USD',
    transactionDate: transactionDate.toISOString(),
    timestamp: new Date().toISOString(),
  };
}

module.exports = { generateDownstream };
