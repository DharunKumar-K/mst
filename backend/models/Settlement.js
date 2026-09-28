const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  batchId: { type: String, required: true, index: true },
  amount: { type: Number, required: true },
  payer: { type: String, required: true },
  recipient: { type: String },
  txHash: { type: String },
  status: { type: String, enum: ['DEPOSITED', 'RELEASED', 'HELD', 'REFUNDED'], default: 'DEPOSITED' }
}, { timestamps: true });

module.exports = mongoose.model('Settlement', settlementSchema);
