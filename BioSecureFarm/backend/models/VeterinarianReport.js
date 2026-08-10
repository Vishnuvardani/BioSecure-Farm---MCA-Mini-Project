const mongoose = require('mongoose');

const vetReportSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  veterinarian: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  inspectionDate: { type: Date, required: true },
  findings: { type: String },
  diagnosis: { type: String },
  treatmentRecommendations: [String],
  followUpDate: { type: Date },
  status: { type: String, enum: ['pending', 'completed', 'follow_up'], default: 'pending' },
  attachments: [String]
}, { timestamps: true });

module.exports = mongoose.model('VeterinarianReport', vetReportSchema);
