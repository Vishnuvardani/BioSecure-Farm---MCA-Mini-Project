const Farm = require('../models/Farm');
const Livestock = require('../models/Livestock');
const Vaccination = require('../models/Vaccination');
const Disease = require('../models/Disease');
const Biosecurity = require('../models/Biosecurity');

exports.getDiseaseAnalytics = async (req, res, next) => {
  try {
    const byType = await Disease.aggregate([
      { $group: { _id: '$diseaseType', count: { $sum: 1 }, confirmed: { $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } } } }
    ]);
    const bySeverity = await Disease.aggregate([
      { $group: { _id: '$severity', count: { $sum: 1 } } }
    ]);
    const monthly = await Disease.aggregate([
      { $group: { _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    const total = await Disease.countDocuments();
    const outbreaks = await Disease.countDocuments({ isOutbreak: true });
    res.json({ success: true, data: { total, outbreaks, byType, bySeverity, monthly } });
  } catch (err) { next(err); }
};

exports.getVaccinationAnalytics = async (req, res, next) => {
  try {
    const byStatus = await Vaccination.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    const byDisease = await Vaccination.aggregate([
      { $group: { _id: '$disease', count: { $sum: 1 } } }
    ]);
    const monthly = await Vaccination.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: { year: { $year: '$administeredDate' }, month: { $month: '$administeredDate' } }, count: { $sum: 1 } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    const total = await Vaccination.countDocuments();
    const completed = await Vaccination.countDocuments({ status: 'completed' });
    res.json({ success: true, data: { total, completed, completionRate: total ? ((completed / total) * 100).toFixed(1) : 0, byStatus, byDisease, monthly } });
  } catch (err) { next(err); }
};

exports.getBiosecurityAnalytics = async (req, res, next) => {
  try {
    const byRisk = await Biosecurity.aggregate([
      { $group: { _id: '$riskLevel', count: { $sum: 1 }, avgScore: { $avg: '$totalScore' } } }
    ]);
    const avgScore = await Biosecurity.aggregate([
      { $group: { _id: null, avg: { $avg: '$totalScore' }, min: { $min: '$totalScore' }, max: { $max: '$totalScore' } } }
    ]);
    const monthly = await Biosecurity.aggregate([
      { $group: { _id: { year: { $year: '$assessmentDate' }, month: { $month: '$assessmentDate' } }, avgScore: { $avg: '$totalScore' } } },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
      { $limit: 12 }
    ]);
    res.json({ success: true, data: { byRisk, stats: avgScore[0] || {}, monthly } });
  } catch (err) { next(err); }
};

exports.getDashboardStats = async (req, res, next) => {
  try {
    const filter = req.user.role === 'farmer' ? { owner: req.user._id } : {};
    const [farms, animals, vaccinations, diseases, biosecurity] = await Promise.all([
      Farm.countDocuments(filter),
      Livestock.countDocuments({ ...(filter.owner ? { owner: filter.owner } : {}), isActive: true }),
      Vaccination.countDocuments({ status: 'completed' }),
      Disease.countDocuments({ status: { $in: ['suspected', 'confirmed'] } }),
      Biosecurity.findOne(filter.owner ? { assessedBy: filter.owner } : {}).sort('-assessmentDate')
    ]);
    const upcomingVaccinations = await Vaccination.countDocuments({
      status: 'scheduled',
      nextDueDate: { $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
    });
    res.json({
      success: true,
      data: {
        totalFarms: farms,
        totalAnimals: animals,
        vaccinationsCompleted: vaccinations,
        diseaseAlerts: diseases,
        biosecurityScore: biosecurity?.totalScore || 0,
        upcomingVaccinations
      }
    });
  } catch (err) { next(err); }
};

exports.getDistrictStats = async (req, res, next) => {
  try {
    const districtFarms = await Farm.aggregate([
      { $group: { _id: '$address.district', count: { $sum: 1 }, avgBioScore: { $avg: '$biosecurityScore' } } },
      { $sort: { count: -1 } }
    ]);
    res.json({ success: true, data: districtFarms });
  } catch (err) { next(err); }
};
