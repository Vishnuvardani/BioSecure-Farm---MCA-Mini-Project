const mongoose = require('mongoose');

const gisSchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm' },
  disease: { type: mongoose.Schema.Types.ObjectId, ref: 'Disease' },
  locationType: { type: String, enum: ['farm', 'outbreak', 'hotspot', 'checkpoint'], required: true },
  name: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  radius: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['low', 'moderate', 'high', 'critical'], default: 'low' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

gisSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('GISLocation', gisSchema);
