const Inventory = require('../models/Inventory');

exports.createItem = async (req, res, next) => {
  try {
    const item = await Inventory.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, data: item });
  } catch (err) { next(err); }
};

exports.getInventory = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.category) filter.category = req.query.category;
    if (req.user.role === 'farmer') filter.owner = req.user._id;
    const items = await Inventory.find(filter).populate('farm', 'farmName').sort('-createdAt');
    const now = new Date();
    const data = items.map(i => ({
      ...i.toObject(),
      isLowStock: i.quantity <= i.minimumStock,
      isExpired: i.expiryDate && i.expiryDate < now
    }));
    res.json({ success: true, count: data.length, data });
  } catch (err) { next(err); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const item = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
    res.json({ success: true, data: item });
  } catch (err) { next(err); }
};
