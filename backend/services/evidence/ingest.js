const crypto = require('node:crypto');
const Batch = require('../../models/Batch');
const Evidence = require('../../models/Evidence');
const { normalizeEvent } = require('./normalize');
const { sha256 } = require('./hash');
const { merkleRoot } = require('./merkle');
const { storeArtifact } = require('./storage');

function artifactFrom(event) {
  if (!event.file) return { content: Buffer.from(canonicalJson(event.data)), name: null, mime: 'application/json' };
  if (typeof event.file.contentBase64 !== 'string') {
    throw Object.assign(new Error('Evidence file must include contentBase64'), { status: 400 });
  }
  const content = Buffer.from(event.file.contentBase64, 'base64');
  if (content.toString('base64').replace(/=+$/, '') !== event.file.contentBase64.replace(/=+$/, '')) {
    throw Object.assign(new Error('Evidence file contains invalid base64'), { status: 400 });
  }
  return { content, name: event.file.name || null, mime: event.file.mime || 'application/octet-stream' };
}

function canonicalJson(value) {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

async function ingest(input) {
  const event = normalizeEvent(input);
  const batch = await Batch.findOne({ batchId: event.batchId });
  if (!batch) throw Object.assign(new Error('Batch not found'), { status: 404 });

  const artifact = artifactFrom(event);
  const evidenceId = event.eventId || `ev-${crypto.randomUUID()}`;
  const fileHash = sha256(artifact.content);
  const fileLocation = await storeArtifact(evidenceId, artifact.content);

  try {
    const evidence = await Evidence.create({
      evidenceId,
      batchId: event.batchId,
      type: event.type,
      source: event.source,
      origin: event.origin,
      data: event.data,
      fileHash,
      fileLocation,
      fileName: artifact.name,
      mime: artifact.mime,
      timestamp: event.timestamp,
    });
    const records = await Evidence.find({ batchId: event.batchId }).select('fileHash');
    batch.evidenceRoot = merkleRoot(records.map((record) => record.fileHash));
    if (batch.status === 'CREATED') batch.status = 'EVIDENCE_COMMITTED';
    await batch.save();
    return { evidence, evidenceRoot: batch.evidenceRoot };
  } catch (error) {
    const fs = require('node:fs/promises');
    await fs.unlink(fileLocation).catch(() => {});
    throw error;
  }
}

module.exports = { ingest };