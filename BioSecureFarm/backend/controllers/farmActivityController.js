const FarmActivity = require('../models/FarmActivity');

exports.createActivity = async (req, res, next) => {
  try {
    const activity = await FarmActivity.create({ ...req.body, recordedBy: req.user._id });
    res.status(201).json({ success: true, data: activity });
  } catch (err) { next(err); }
};

exports.getActivities = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.activityType) filter.activityType = req.query.activityType;
    const activities = await FarmActivity.find(filter)
      .populate('farm', 'farmName')
      .populate('recordedBy', 'fullName')
      .sort('-date')
      .limit(50);
    res.json({ success: true, count: activities.length, data: activities });
  } catch (err) { next(err); }
};
