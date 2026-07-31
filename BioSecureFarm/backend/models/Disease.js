const mongoose = require('mongoose');

const diseaseSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  diseaseName: { type: String, required: true },
  diseaseType: { type: String, enum: ['bird_flu', 'african_swine_fever', 'foot_and_mouth', 'newcastle', 'other'] },
  affectedSpecies: [String],
  affectedCount: { type: Number, default: 0 },
  symptoms: [String],
  severity: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'moderate' },
  status: { type: String, enum: ['suspected', 'confirmed', 'resolved', 'under_treatment'], default: 'suspected' },
  outbreakDate: { type: Date },
  resolvedDate: { type: Date },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  treatmentGiven: { type: String },
  labResults: { type: String },
  isOutbreak: { type: Boolean, default: false },
  notifiedAuthorities: { type: Boolean, default: false }
}, { timestamps: true });

diseaseSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Disease', diseaseSchema);
