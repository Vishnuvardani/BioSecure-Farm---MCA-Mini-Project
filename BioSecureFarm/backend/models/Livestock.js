const mongoose = require('mongoose');

const livestockSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tagId: { type: String, unique: true, required: true },
  species: { type: String, enum: ['pig', 'chicken', 'duck', 'turkey', 'goose'], required: true },
  breed: { type: String },
  gender: { type: String, enum: ['male', 'female', 'unknown'] },
  dateOfBirth: { type: Date },
  weight: { type: Number },
  healthStatus: { type: String, enum: ['healthy', 'sick', 'quarantine', 'deceased'], default: 'healthy' },
  vaccinationStatus: { type: String, enum: ['up_to_date', 'due', 'overdue'], default: 'due' },
  lastVaccination: { type: Date },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Livestock', livestockSchema);
