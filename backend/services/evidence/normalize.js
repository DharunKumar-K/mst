const enums = require('../../../shared/enums.json');

function normalizeEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw Object.assign(new Error('Evidence event must be an object'), { status: 400 });
  const required = ['batchId', 'type', 'source', 'origin', 'data', 'timestamp'];
  for (const field of required) {
    if (event[field] === undefined || event[field] === null || event[field] === '') {
      throw Object.assign(new Error(`Evidence event is missing ${field}`), { status: 400 });
    }
  }
  if (!enums.evidenceTypes.includes(event.type)) throw Object.assign(new Error('Unsupported evidence type'), { status: 400 });
  if (!enums.evidenceOrigin.includes(event.origin)) throw Object.assign(new Error('Unsupported evidence origin'), { status: 400 });
  if (event.eventId !== undefined && (typeof event.eventId !== 'string' || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,127}$/.test(event.eventId))) {
    throw Object.assign(new Error('Evidence eventId may contain only letters, numbers, underscores, and hyphens'), { status: 400 });
  }
  if (typeof event.data !== 'object' || event.data === null || Array.isArray(event.data)) {
    throw Object.assign(new Error('Evidence data must be an object'), { status: 400 });
  }
  const timestamp = new Date(event.timestamp);
  if (Number.isNaN(timestamp.getTime())) throw Object.assign(new Error('Evidence timestamp must be a valid date'), { status: 400 });

  return {
    eventId: event.eventId,
    batchId: String(event.batchId).trim(),
    type: event.type,
    timestamp,
    source: String(event.source).trim(),
    origin: event.origin,
    data: event.data,
    file: event.file,
  };
}

module.exports = { normalizeEvent };