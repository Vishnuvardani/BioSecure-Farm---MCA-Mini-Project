const mongoose = require('mongoose');

const farmActivitySchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  activityType: {
    type: String,
    enum: ['cleaning', 'disinfection', 'vaccination', 'vet_visit', 'animal_movement', 'feed_purchase', 'mortality', 'quarantine', 'other'],
    required: true
  },
  date: { type: Date, default: Date.now },
  description: { type: String, required: true },
  personResponsible: { type: String },
  remarks: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('FarmActivity', farmActivitySchema);
