const Livestock = require('../models/Livestock');
const Farm = require('../models/Farm');

exports.addLivestock = async (req, res, next) => {
  try {
    const tagId = 'TAG-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
    const animal = await Livestock.create({ ...req.body, owner: req.user._id, tagId });
    await Farm.findByIdAndUpdate(req.body.farm, { $inc: { currentCount: 1 } });
    res.status(201).json({ success: true, data: animal });
  } catch (err) { next(err); }
};

exports.getLivestock = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.user.role === 'farmer') filter.owner = req.user._id;
    if (req.query.species) filter.species = req.query.species;
    if (req.query.healthStatus) filter.healthStatus = req.query.healthStatus;

    const animals = await Livestock.find(filter).populate('farm', 'farmName').sort('-createdAt');
    res.json({ success: true, count: animals.length, data: animals });
  } catch (err) { next(err); }
};

exports.updateLivestock = async (req, res, next) => {
  try {
    const animal = await Livestock.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!animal) return res.status(404).json({ success: false, message: 'Animal not found' });
    res.json({ success: true, data: animal });
  } catch (err) { next(err); }
};

exports.getLivestockStats = async (req, res, next) => {
  try {
    const filter = req.user.role === 'farmer' ? { owner: req.user._id, isActive: true } : { isActive: true };
    const bySpecies = await Livestock.aggregate([
      { $match: filter },
      { $group: { _id: '$species', count: { $sum: 1 } } }
    ]);
    const byHealth = await Livestock.aggregate([
      { $match: filter },
      { $group: { _id: '$healthStatus', count: { $sum: 1 } } }
    ]);
    const total = await Livestock.countDocuments(filter);
    res.json({ success: true, data: { total, bySpecies, byHealth } });
  } catch (err) { next(err); }
};
