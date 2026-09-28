const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  batchId: { type: String, required: true, index: true },
  challenger: { type: String, required: true },
  reason: { type: String },
  txHash: { type: String },
  status: { type: String, enum: ['CHALLENGED', 'UNDER_REVIEW', 'RESOLVED'], default: 'CHALLENGED' },
  resolution: { type: Boolean }
}, { timestamps: true });

module.exports = mongoose.model('Challenge', challengeSchema);
