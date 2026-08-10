const Vaccination = require('../models/Vaccination');
const Livestock = require('../models/Livestock');
const notificationService = require('../services/notificationService');

exports.createVaccination = async (req, res, next) => {
  try {
    const vacc = await Vaccination.create({ ...req.body, administeredBy: req.user._id });
    if (req.body.livestock) {
      await Livestock.findByIdAndUpdate(req.body.livestock, {
        lastVaccination: req.body.administeredDate,
        vaccinationStatus: 'up_to_date'
      });
    }
    res.status(201).json({ success: true, data: vacc });
  } catch (err) { next(err); }
};

exports.getVaccinations = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.farm) filter.farm = req.query.farm;
    if (req.query.status) filter.status = req.query.status;
    const vaccinations = await Vaccination.find(filter)
      .populate('farm', 'farmName')
      .populate('livestock', 'tagId species')
      .populate('administeredBy', 'fullName')
      .sort('-administeredDate');
    res.json({ success: true, count: vaccinations.length, data: vaccinations });
  } catch (err) { next(err); }
};

exports.updateVaccination = async (req, res, next) => {
  try {
    const vacc = await Vaccination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vacc) return res.status(404).json({ success: false, message: 'Record not found' });
    res.json({ success: true, data: vacc });
  } catch (err) { next(err); }
};

exports.getUpcoming = async (req, res, next) => {
  try {
    const upcoming = await Vaccination.find({
      status: 'scheduled',
      nextDueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    }).populate('farm', 'farmName').populate('livestock', 'tagId species');
    res.json({ success: true, data: upcoming });
  } catch (err) { next(err); }
};
