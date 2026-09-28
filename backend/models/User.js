const mongoose = require('mongoose');
const enums = require('../../shared/enums.json');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: enums.roles, required: true, default: 'PRODUCER' },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'Organization', default: null },
}, { timestamps: true });

module.exports = mongoose.models.User || mongoose.model('User', userSchema);