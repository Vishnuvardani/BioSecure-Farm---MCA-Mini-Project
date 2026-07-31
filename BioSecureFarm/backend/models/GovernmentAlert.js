const mongoose = require('mongoose');

const govAlertSchema = new mongoose.Schema({
  issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  alertType: { type: String, enum: ['outbreak', 'advisory', 'ban', 'compliance'], required: true },
  severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
  affectedDistricts: [String],
  affectedSpecies: [String],
  disease: { type: String },
  isActive: { type: Boolean, default: true },
  expiryDate: { type: Date }
}, { timestamps: true });

module.exports = mongoose.model('GovernmentAlert', govAlertSchema);
