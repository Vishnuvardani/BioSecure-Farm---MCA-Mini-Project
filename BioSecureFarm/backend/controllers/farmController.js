const Farm = require('../models/Farm');
const GISLocation = require('../models/GISLocation');

exports.createFarm = async (req, res, next) => {
  try {
    const regNum = 'FARM-' + Date.now();
    const farm = await Farm.create({ ...req.body, owner: req.user._id, registrationNumber: regNum });
    if (req.body.coordinates) {
      await GISLocation.create({
        farm: farm._id, locationType: 'farm', name: farm.farmName,
        location: { type: 'Point', coordinates: req.body.coordinates },
        riskLevel: 'low'
      });
    }
    res.status(201).json({ success: true, data: farm });
  } catch (err) { next(err); }
};

exports.getFarms = async (req, res, next) => {
  try {
    const filter = {};
    if (req.user.role === 'farmer') filter.owner = req.user._id;
    if (req.user.role === 'veterinarian') filter.assignedVet = req.user._id;
    if (req.query.district) filter['address.district'] = req.query.district;

    const farms = await Farm.find(filter)
      .populate('owner', 'fullName email mobile')
      .populate('assignedVet', 'fullName email')
      .sort('-createdAt');
    res.json({ success: true, count: farms.length, data: farms });
  } catch (err) { next(err); }
};

exports.getFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findById(req.params.id)
      .populate('owner', 'fullName email mobile')
      .populate('assignedVet', 'fullName email');
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, data: farm });
  } catch (err) { next(err); }
};

exports.updateFarm = async (req, res, next) => {
  try {
    const farm = await Farm.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!farm) return res.status(404).json({ success: false, message: 'Farm not found' });
    res.json({ success: true, data: farm });
  } catch (err) { next(err); }
};

exports.deleteFarm = async (req, res, next) => {
  try {
    await Farm.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Farm deactivated' });
  } catch (err) { next(err); }
};

exports.getFarmStats = async (req, res, next) => {
  try {
    const ownerId = req.user.role === 'farmer' ? req.user._id : null;
    const filter = ownerId ? { owner: ownerId } : {};
    const total = await Farm.countDocuments(filter);
    const byType = await Farm.aggregate([
      { $match: filter },
      { $group: { _id: '$farmType', count: { $sum: 1 } } }
    ]);
    const byRisk = await Farm.aggregate([
      { $match: filter },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);
    res.json({ success: true, data: { total, byType, byRisk } });
  } catch (err) { next(err); }
};
