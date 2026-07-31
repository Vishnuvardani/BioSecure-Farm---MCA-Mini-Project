const router = require('express').Router();
const { getDiseaseAnalytics, getVaccinationAnalytics, getBiosecurityAnalytics, getDashboardStats, getDistrictStats } = require('../controllers/analyticsController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/disease', getDiseaseAnalytics);
router.get('/vaccination', getVaccinationAnalytics);
router.get('/biosecurity', getBiosecurityAnalytics);
router.get('/dashboard', getDashboardStats);
router.get('/district', getDistrictStats);

module.exports = router;
