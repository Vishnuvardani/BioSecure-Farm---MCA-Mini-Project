const router = require('express').Router();
const { protect, authorize } = require('../middleware/auth');
const VeterinarianReport = require('../models/VeterinarianReport');
const GovernmentAlert = require('../models/GovernmentAlert');

router.use(protect);

router.get('/vet', async (req, res, next) => {
  try {
    const filter = req.user.role === 'veterinarian' ? { veterinarian: req.user._id } : {};
    if (req.query.farm) filter.farm = req.query.farm;
    const reports = await VeterinarianReport.find(filter)
      .populate('farm', 'farmName').populate('veterinarian', 'fullName').sort('-inspectionDate');
    res.json({ success: true, data: reports });
  } catch (err) { next(err); }
});

router.post('/vet', authorize('veterinarian', 'admin'), async (req, res, next) => {
  try {
    const report = await VeterinarianReport.create({ ...req.body, veterinarian: req.user._id });
    res.status(201).json({ success: true, data: report });
  } catch (err) { next(err); }
});

router.get('/alerts', async (req, res, next) => {
  try {
    const alerts = await GovernmentAlert.find({ isActive: true })
      .populate('issuedBy', 'fullName').sort('-createdAt');
    res.json({ success: true, data: alerts });
  } catch (err) { next(err); }
});

router.post('/alerts', authorize('government_officer', 'admin'), async (req, res, next) => {
  try {
    const alert = await GovernmentAlert.create({ ...req.body, issuedBy: req.user._id });
    res.status(201).json({ success: true, data: alert });
  } catch (err) { next(err); }
});

module.exports = router;
