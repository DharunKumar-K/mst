const axios = require('axios');

function mockReconcile(batch, evidence) {
  const flags = [];
  const byType = Object.groupBy ? Object.groupBy(evidence, (item) => item.type) : evidence.reduce((groups, item) => {
    (groups[item.type] ||= []).push(item);
    return groups;
  }, {});
  const quantityOf = (item, keys) => {
    for (const key of keys) if (Number.isFinite(Number(item?.data?.[key]))) return Number(item.data[key]);
    return null;
  };
  const claimQuantity = Number(batch.claim?.quantity);
  const output = byType.processing_log?.[0];
  const intake = byType.weighbridge?.[0];
  const downstream = byType.downstream_invoice?.[0];
  const capacity = byType.capacity?.[0];
  const outputQuantity = quantityOf(output, ['outputWeight', 'quantity', 'weight']);
  const inputQuantity = quantityOf(intake, ['weight', 'quantity', 'inputWeight']);
  const downstreamQuantity = quantityOf(downstream, ['quantity', 'weight']);
  const capacityQuantity = quantityOf(capacity, ['capacity', 'quantity', 'weight']);
  const claimUnit = String(batch.claim?.unit || '').trim().toLowerCase();
  if (claimUnit && evidence.some((item) => item.data?.unit && String(item.data.unit).trim().toLowerCase() !== claimUnit)) {
    flags.push('UNIT_MISMATCH');
  }
  if (outputQuantity !== null && claimQuantity !== outputQuantity) flags.push('CLAIM_DIFFERS_FROM_COMMITTED_EVIDENCE');
  if (outputQuantity !== null && inputQuantity !== null && outputQuantity > inputQuantity) flags.push('MASS_BALANCE_MISMATCH');
  if (downstreamQuantity !== null && claimQuantity > downstreamQuantity) flags.push('CLAIM_NOT_SUPPORTED_BY_DOWNSTREAM');
  if (capacityQuantity !== null && inputQuantity !== null && inputQuantity > capacityQuantity) flags.push('CAPACITY_EXCEEDED');

  const missingEvidence = ['weighbridge', 'processing_log', 'downstream_invoice'].filter((type) => !byType[type]?.length);
  if (missingEvidence.length) flags.push('MISSING_EVIDENCE');

  return {
    status: flags.some((flag) => flag !== 'MISSING_EVIDENCE') ? 'FLAGGED' : missingEvidence.length ? 'REVIEW' : 'CONSISTENT',
    massBalanceResult: { input: inputQuantity, output: outputQuantity, claim: claimQuantity },
    capacityResult: { capacity: capacityQuantity, input: inputQuantity, withinCapacity: capacityQuantity === null || inputQuantity === null || inputQuantity <= capacityQuantity },
    downstreamMatch: { quantity: downstreamQuantity, matchesClaim: downstreamQuantity === null ? null : downstreamQuantity === claimQuantity },
    flags,
    missingEvidence,
    explanation: flags.some((flag) => flag !== 'MISSING_EVIDENCE')
      ? 'Evidence values conflict with the batch claim.'
      : missingEvidence.length ? 'Required evidence is missing.' : 'Available evidence is consistent with the batch claim.',
    recommendation: flags.length ? 'Review the flags and supply any missing evidence before verification.' : 'Proceed to verification review.',
  };
}

async function reconcile(batch, evidence) {
  if (process.env.AI_MOCK === 'true') return mockReconcile(batch, evidence);
  const baseUrl = process.env.AI_SERVICE_URL;
  if (!baseUrl) throw Object.assign(new Error('AI_SERVICE_URL is not configured'), { status: 502 });
  try {
    const { data } = await axios.post(`${baseUrl.replace(/\/$/, '')}/reconcile`, { batch, evidence }, { timeout: 15000 });
    return data;
  } catch (_error) {
    throw Object.assign(new Error('AI service unavailable'), { status: 502 });
  }
}

module.exports = { reconcile, mockReconcile };