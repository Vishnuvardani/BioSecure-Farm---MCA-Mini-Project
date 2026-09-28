const mongoose = require('mongoose');

const healthRecordSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  livestock: { type: mongoose.Schema.Types.ObjectId, ref: 'Livestock' },
  batchId: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  symptoms: [String],
  healthCondition: { type: String, enum: ['healthy', 'mild', 'moderate', 'severe', 'critical'], default: 'healthy' },
  previousIllness: { type: String },
  treatment: { type: String },
  medicine: { type: String },
  veterinarian: { type: String },
  remarks: { type: String },
  followUpDate: { type: Date },
  isResolved: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('HealthRecord', healthRecordSchema);
