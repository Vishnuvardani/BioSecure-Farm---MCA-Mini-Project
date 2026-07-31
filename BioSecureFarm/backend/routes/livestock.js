const router = require('express').Router();
const { addLivestock, getLivestock, updateLivestock, getLivestockStats } = require('../controllers/livestockController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/stats', getLivestockStats);
router.route('/').get(getLivestock).post(authorize('farmer', 'admin'), addLivestock);
router.put('/:id', authorize('farmer', 'veterinarian', 'admin'), updateLivestock);

module.exports = router;
