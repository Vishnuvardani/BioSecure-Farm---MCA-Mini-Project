const mongoose = require('mongoose');

const farmSchema = new mongoose.Schema({
  farmName: { type: String, required: true },
  farmType: { type: String, enum: ['pig', 'poultry', 'mixed'], required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  registrationNumber: { type: String, unique: true },
  address: {
    street: String,
    city: String,
    district: String,
    state: String,
    pincode: String
  },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  totalArea: { type: Number },
  capacity: { type: Number },
  currentCount: { type: Number, default: 0 },
  assignedVet: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  biosecurityScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['low', 'moderate', 'high'], default: 'high' },
  isActive: { type: Boolean, default: true },
  images: [String],
  lastInspection: { type: Date }
}, { timestamps: true });

farmSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Farm', farmSchema);
