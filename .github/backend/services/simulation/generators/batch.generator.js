/**
 * Batch Generator — creates deterministic batch metadata
 * for CirqProof simulation runs.
 *
 * Uses seeded randomness so that given the same batchId and seed,
 * the same batch metadata is produced every time.
 */

const MATERIALS = ['recycled polymer', 'recycled PET', 'recycled HDPE', 'recycled aluminium', 'recycled glass'];
const PRODUCERS = ['Dell', 'HP', 'Lenovo', 'Samsung', 'Apple'];
const RECYCLERS = ['Recycler-A', 'Recycler-B', 'GreenCycle Inc', 'EcoProcess Ltd', 'CircularMats'];

function seededRandom(seed) {
  let h = 0xdeadbeef ^ seed;
  return function () {
    h = Math.imul(h ^ (h >>> 16), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };
}

function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = Math.imul(31, hash) + str.charCodeAt(i) | 0;
  }
  return hash;
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

/**
 * @param {object} options
 * @param {string} options.batchId
 * @param {number} [options.seed]
 * @param {string} [options.producer]
 * @param {string} [options.recycler]
 * @param {string} [options.material]
 * @param {number} [options.claimQuantity]
 * @param {string} [options.claimUnit]
 * @returns {object} batch metadata
 */
function generateBatch(options = {}) {
  const batchId = options.batchId || `CP-${new Date().getFullYear()}-${String(Date.now() % 10000).padStart(4, '0')}`;
  const seed = options.seed ?? hashCode(batchId);
  const rng = seededRandom(seed);

  const now = new Date();
  const createdAt = new Date(now.getTime() - Math.floor(rng() * 7 * 24 * 60 * 60 * 1000));

  return {
    batchId,
    producer: options.producer || pick(PRODUCERS, rng),
    recycler: options.recycler || pick(RECYCLERS, rng),
    material: options.material || pick(MATERIALS, rng),
    claim: {
      quantity: options.claimQuantity || Math.round(500 + rng() * 1500),
      unit: options.claimUnit || 'kg',
    },
    createdAt: createdAt.toISOString(),
  };
}

module.exports = { generateBatch, seededRandom, hashCode, pick };
