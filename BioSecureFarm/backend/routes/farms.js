const router = require('express').Router();
const { createFarm, getFarms, getFarm, updateFarm, deleteFarm, getFarmStats } = require('../controllers/farmController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getFarmStats);
router.route('/').get(getFarms).post(authorize('farmer', 'admin'), createFarm);
router.route('/:id').get(getFarm).put(authorize('farmer', 'admin'), updateFarm).delete(authorize('admin'), deleteFarm);

module.exports = router;
