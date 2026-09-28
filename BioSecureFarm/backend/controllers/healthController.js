const HealthRecord = require('../models/HealthRecord');

exports.createHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.create({ ...req.body, recordedBy: req.user._id });
    res.status(201).json({ success: true, data: record });
  } catch (err) { next(err); }
};

exports.getHealthRecords = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.livestock) filter.livestock = req.query.livestock;
    if (req.query.healthCondition) filter.healthCondition = req.query.healthCondition;
    const records = await HealthRecord.find(filter)
      .populate('farm', 'farmName')
      .populate('livestock', 'tagId species')
      .populate('recordedBy', 'fullName')
      .sort('-date');
    res.json({ success: true, count: records.length, data: records });
  } catch (err) { next(err); }
};

exports.updateHealthRecord = async (req, res, next) => {
  try {
    const record = await HealthRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: record });
  } catch (err) { next(err); }
};
