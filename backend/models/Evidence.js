const mongoose = require('mongoose');
const enums = require('../../shared/enums.json');

const evidenceSchema = new mongoose.Schema({
  evidenceId: { type: String, required: true, unique: true, index: true },
  batchId: { type: String, required: true, index: true },
  type: { type: String, enum: enums.evidenceTypes, required: true },
  source: { type: String, required: true },
  origin: { type: String, enum: enums.evidenceOrigin, required: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  fileHash: { type: String, required: true },
  fileLocation: { type: String, required: true },
  fileName: { type: String, default: null },
  mime: { type: String, default: 'application/json' },
  timestamp: { type: Date, required: true },
}, { timestamps: true, minimize: false });

module.exports = mongoose.models.Evidence || mongoose.model('Evidence', evidenceSchema);