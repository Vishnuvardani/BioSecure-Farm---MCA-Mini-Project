const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  farm: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  itemName: { type: String, required: true },
  category: { type: String, enum: ['feed', 'medicine', 'vaccine', 'disinfectant', 'equipment', 'other'], required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true },
  purchaseDate: { type: Date },
  expiryDate: { type: Date },
  minimumStock: { type: Number, default: 0 },
  supplier: { type: String },
  notes: { type: String },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Inventory', inventorySchema);
