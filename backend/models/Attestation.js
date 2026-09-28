const mongoose = require('mongoose');

const attestationSchema = new mongoose.Schema({
  batchId: { type: String, required: true, index: true },
  attestor: { type: String, required: true },
  txHash: { type: String },
  status: { type: String, enum: ['PENDING', 'VERIFIED', 'FAILED'], default: 'PENDING' },
  contractReference: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Attestation', attestationSchema);
