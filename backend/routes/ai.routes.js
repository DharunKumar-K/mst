const express = require('express');
const Evidence = require('../models/Evidence');
const AiReport = require('../models/AiReport');
const batchService = require('../services/batch/batch.service');
const { reconcile } = require('../services/ai/aiClient');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.post('/reconcile', async (req, res, next) => {
  try {
    const batch = await batchService.getBatch(req.body.batchId);
    if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });
    const evidence = await Evidence.find({ batchId: batch.batchId }).sort({ timestamp: 1 });
    const result = await reconcile(batch.toObject(), evidence.map((item) => item.toObject()));
    const report = await AiReport.create({ batchId: batch.batchId, ...result });
    batch.aiReport = report._id;
    batch.status = 'AI_ANALYZED';
    await batch.save();
    return res.json({ ok: true, data: { report } });
  } catch (error) {
    return next(error);
  }
});

router.get('/report/:batchId', async (req, res, next) => {
  try {
    const report = await batchService.getLatestAiReport(req.params.batchId);
    if (!report) return res.status(404).json({ ok: false, error: 'AI report not found' });
    return res.json({ ok: true, data: { report } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;