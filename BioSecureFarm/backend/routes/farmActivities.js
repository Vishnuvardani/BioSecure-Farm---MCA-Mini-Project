const router = require('express').Router();
const { createActivity, getActivities } = require('../controllers/farmActivityController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getActivities).post(authorize('farmer', 'veterinarian', 'admin'), createActivity);

module.exports = router;
