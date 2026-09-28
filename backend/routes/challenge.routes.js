const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');

router.post('/', async (req, res) => {
  try {
    const { batchId, challenger, reason, txHash } = req.body;
    const challenge = new Challenge({ batchId, challenger, reason, txHash });
    await challenge.save();
    res.status(201).json({ success: true, challenge });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/:batchId', async (req, res) => {
  try {
    const challenges = await Challenge.find({ batchId: req.params.batchId });
    res.json({ success: true, challenges });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
