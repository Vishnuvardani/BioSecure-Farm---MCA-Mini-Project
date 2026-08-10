const mongoose = require('mongoose');

const biosecuritySchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  assessedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  assessmentDate: { type: Date, default: Date.now },
  parameters: {
    farmHygiene: { score: { type: Number, min: 0, max: 20 }, notes: String },
    waterQuality: { score: { type: Number, min: 0, max: 15 }, notes: String },
    feedManagement: { score: { type: Number, min: 0, max: 15 }, notes: String },
    visitorControl: { score: { type: Number, min: 0, max: 15 }, notes: String },
    wasteDisposal: { score: { type: Number, min: 0, max: 15 }, notes: String },
    vaccinationCompliance: { score: { type: Number, min: 0, max: 20 }, notes: String }
  },
  totalScore: { type: Number },
  riskLevel: { type: String, enum: ['low', 'moderate', 'high'] },
  recommendations: [String],
  nextAssessmentDate: { type: Date }
}, { timestamps: true });

biosecuritySchema.pre('save', function (next) {
  const p = this.parameters;
  this.totalScore = (p.farmHygiene?.score || 0) + (p.waterQuality?.score || 0) +
    (p.feedManagement?.score || 0) + (p.visitorControl?.score || 0) +
    (p.wasteDisposal?.score || 0) + (p.vaccinationCompliance?.score || 0);
  this.riskLevel = this.totalScore >= 81 ? 'low' : this.totalScore >= 51 ? 'moderate' : 'high';
  next();
});

module.exports = mongoose.model('Biosecurity', biosecuritySchema);
