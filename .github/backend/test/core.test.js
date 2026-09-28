const test = require('node:test');
const assert = require('node:assert/strict');
const { normalizeEvent } = require('../services/evidence/normalize');
const { sha256 } = require('../services/evidence/hash');
const { merkleRoot } = require('../services/evidence/merkle');
const { mockReconcile } = require('../services/ai/aiClient');
const { routePrefix } = require('../routes');

test('normalizes a canonical simulation evidence event', () => {
  const normalized = normalizeEvent({
    batchId: ' CP-2026-001 ', type: 'weighbridge', source: 'Recycler-A', origin: 'simulation',
    timestamp: '2026-09-28T12:00:00Z', data: { weight: 1000, unit: 'kg' },
  });
  assert.equal(normalized.batchId, 'CP-2026-001');
  assert.equal(normalized.timestamp.toISOString(), '2026-09-28T12:00:00.000Z');
});

test('rejects evidence with an unsupported type', () => {
  assert.throws(() => normalizeEvent({
    batchId: 'CP-2026-001', type: 'unknown', source: 'test', origin: 'upload',
    timestamp: '2026-09-28T12:00:00Z', data: {},
  }), { status: 400, message: 'Unsupported evidence type' });
});

test('hashes artifacts with SHA-256 and builds an order-independent Merkle root', () => {
  assert.equal(sha256('abc'), 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad');
  const hashes = [sha256('first'), sha256('second')];
  assert.equal(merkleRoot(hashes), merkleRoot([...hashes].reverse()));
  assert.equal(merkleRoot([]), null);
});

test('mock reconciliation flags a claim that differs from committed output', () => {
  const result = mockReconcile(
    { claim: { quantity: 900, unit: 'kg' } },
    [
      { type: 'weighbridge', data: { weight: 1000 } },
      { type: 'processing_log', data: { outputWeight: 850 } },
      { type: 'downstream_invoice', data: { quantity: 900 } },
    ],
  );
  assert.equal(result.status, 'FLAGGED');
  assert.ok(result.flags.includes('CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE'));
});

test('mock reconciliation flags unit mismatches and reviews missing required evidence', () => {
  const mismatched = mockReconcile(
    { claim: { quantity: 100, unit: 'kg' } },
    [{ type: 'weighbridge', data: { weight: 100, unit: 'lb' } }],
  );
  assert.equal(mismatched.status, 'FLAGGED');
  assert.ok(mismatched.flags.includes('UNIT_MISMATCH'));

  const incomplete = mockReconcile({ claim: { quantity: 100, unit: 'kg' } }, []);
  assert.equal(incomplete.status, 'REVIEW');
  assert.ok(incomplete.flags.includes('MISSING_EVIDENCE'));
});

test('rejects unsafe event IDs and mounts batch routes at the plural API path', () => {
  assert.throws(() => normalizeEvent({
    eventId: '../outside', batchId: 'CP-2026-001', type: 'weighbridge', source: 'test', origin: 'upload',
    timestamp: '2026-09-28T12:00:00Z', data: {},
  }), { status: 400 });
  assert.equal(routePrefix('batch.routes.js'), 'batches');
  assert.equal(routePrefix('simulation.routes.js'), 'simulation');
});