const mongoose = require('mongoose');
const enums = require('../../shared/enums.json');

const simulationRunSchema = new mongoose.Schema({
  runId: { type: String, required: true, unique: true, index: true },
  batchId: { type: String, required: true, index: true },
  scenario: { type: String, enum: enums.scenario, required: true },
  startTime: { type: Date, required: true },
  endTime: { type: Date, default: null },
  events: [{ type: mongoose.Schema.Types.Mixed }],
  status: {
    type: String,
    enum: ['PENDING', 'COMPLETED', 'PARTIAL', 'FAILED'],
    default: 'PENDING',
    required: true,
  },
}, { timestamps: true });

module.exports = mongoose.models.SimulationRun || mongoose.model('SimulationRun', simulationRunSchema);
