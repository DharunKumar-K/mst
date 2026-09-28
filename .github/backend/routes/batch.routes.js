const express = require('express');
const Batch = require('../models/Batch');
const batchService = require('../services/batch/batch.service');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();
router.use(requireAuth);

router.post('/', async (req, res, next) => {
  try {
    const { batchId, producer, recycler, material, claim } = req.body;
    if (!batchId || !producer || !recycler || !material || !claim || !Number.isFinite(Number(claim.quantity)) || Number(claim.quantity) < 0 || !claim.unit) {
      return res.status(400).json({ ok: false, error: 'batchId, producer, recycler, material, and a non-negative claim quantity/unit are required' });
    }
    const batch = await batchService.createBatch({ batchId, producer, recycler, material, claim: { quantity: Number(claim.quantity), unit: claim.unit } });
    return res.status(201).json({ ok: true, data: { batch } });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ ok: false, error: `Batch ${req.body.batchId} already exists` });
    return next(error);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1 || limit > 100) {
      return res.status(400).json({ ok: false, error: 'Invalid pagination parameters' });
    }
    const [batches, total] = await Promise.all([
      Batch.find().sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Batch.countDocuments(),
    ]);
    return res.json({ ok: true, data: { batches, page, limit, total } });
  } catch (error) {
    return next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const batch = await batchService.getBatch(req.params.id);
    if (!batch) return res.status(404).json({ ok: false, error: 'Batch not found' });
    return res.json({ ok: true, data: { batch } });
  } catch (error) {
    return next(error);
  }
});

module.exports = router;