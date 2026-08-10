const mongoose = require('mongoose');

const vaccinationSchema = new mongoose.Schema({
  livestock: { type: mongoose.Schema.Types.ObjectId, ref: 'Livestock' },
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  vaccineName: { type: String, required: true },
  disease: { type: String, required: true },
  administeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  administeredDate: { type: Date, required: true },
  nextDueDate: { type: Date },
  batchNumber: { type: String },
  manufacturer: { type: String },
  dosage: { type: String },
  status: { type: String, enum: ['scheduled', 'completed', 'missed'], default: 'scheduled' },
  notes: { type: String },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Vaccination', vaccinationSchema);
