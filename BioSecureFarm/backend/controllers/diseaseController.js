const Disease = require('../models/Disease');
const GISLocation = require('../models/GISLocation');
const notificationService = require('../services/notificationService');

exports.reportDisease = async (req, res, next) => {
  try {
    const disease = await Disease.create({ ...req.body, reportedBy: req.user._id });
    if (req.body.coordinates) {
      await GISLocation.create({
        disease: disease._id, locationType: 'outbreak', name: disease.diseaseName,
        location: { type: 'Point', coordinates: req.body.coordinates },
        riskLevel: disease.severity
      });
    }
    if (disease.severity === 'high' || disease.severity === 'critical') {
      await notificationService.broadcastNotification(
        `Disease Alert: ${disease.diseaseName}`,
        `A ${disease.severity} severity case reported. Affected: ${disease.affectedCount} animals.`,
        'disease', null
      );
    }
    res.status(201).json({ success: true, data: disease });
  } catch (err) { next(err); }
};

exports.getDiseases = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.status) filter.status = req.query.status;
    if (req.query.type) filter.diseaseType = req.query.type;
    const diseases = await Disease.find(filter)
      .populate('farm', 'farmName address')
      .populate('reportedBy', 'fullName role')
      .sort('-createdAt');
    res.json({ success: true, count: diseases.length, data: diseases });
  } catch (err) { next(err); }
};

exports.updateDisease = async (req, res, next) => {
  try {
    const disease = await Disease.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!disease) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: disease });
  } catch (err) { next(err); }
};
