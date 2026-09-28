const mongoose = require('mongoose');
const enums = require('../../shared/enums.json');

const batchSchema = new mongoose.Schema({
  batchId: { type: String, required: true, unique: true, index: true, trim: true },
  producer: { type: String, required: true, trim: true },
  recycler: { type: String, required: true, trim: true },
  material: { type: String, required: true, trim: true },
  claim: {
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true },
  },
  status: { type: String, enum: enums.batchStatus, default: 'CREATED', required: true },
  evidenceRoot: { type: String, default: null },
  aiReport: { type: mongoose.Schema.Types.ObjectId, ref: 'AiReport', default: null },
  chainRefs: {
    txHash: { type: String, default: null },
    attestationId: { type: String, default: null },
  },
}, { timestamps: true });

module.exports = mongoose.models.Batch || mongoose.model('Batch', batchSchema);