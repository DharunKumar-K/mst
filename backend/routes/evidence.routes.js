const express = require('express');
const Batch = require('../models/Batch');
const Evidence = require('../models/Evidence');
const upload = require('../middleware/upload');
const { requireAuth } = require('../middleware/auth');
const { ingest } = require('../services/evidence/ingest');
const { verifyIntegrity } = require('../services/evidence/integrity');

const router = express.Router();
router.use(requireAuth);

function eventFromRequest(req, origin) {
  let data = req.body.data;
  if (typeof data === 'string') {
    try { data = JSON.parse(data); } catch (_error) { throw Object.assign(new Error('data must be valid JSON'), { status: 400 }); }
  }
  return {
    eventId: req.body.eventId,
    batchId: req.body.batchId,
    type: req.body.type,
    timestamp: req.body.timestamp,
    source: req.body.source,
    origin,
    data,
    file: req.file ? {
      name: req.file.originalname,
      mime: req.file.mimetype,
      contentBase64: req.file.buffer.toString('base64'),
    } : req.body.file,
  };
}

router.post('/upload', upload.single('file'), async (req, res, next) => {
  try {
    const result = await ingest(eventFromRequest(req, 'upload'));
    return res.status(201).json({ ok: true, data: result });
  } catch (error) {
    return next(error);
  }
});

router.post('/events', async (req, res, next) => {
  try {
    const result = await ingest(req.body);
    return res.status(201).json({ ok: true, data: result });
  } catch (error) {
    return next(error);
  }
});

router.get('/:batchId/integrity', async (req, res, next) => {
  try {
    return res.json({ ok: true, data: await verifyIntegrity(req.params.batchId) });
  } catch (error) {
    return next(error);
  }
});

router.get('/:batchId', async (req, res, next) => {
  try {
    const batch = await Batch.findOne({ batchId: req.params.batchId }).select('batchId evidenceRoot');
    if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });
    const evidence = await Evidence.find({ batchId: req.params.batchId }).sort({ timestamp: 1 });
    return res.json({ ok: true, data: { evidence, evidenceRoot: batch.evidenceRoot } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;