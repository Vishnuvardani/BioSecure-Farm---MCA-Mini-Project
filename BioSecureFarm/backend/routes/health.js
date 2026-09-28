const router = require('express').Router();
const { createHealthRecord, getHealthRecords, updateHealthRecord } = require('../controllers/healthController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getHealthRecords).post(authorize('farmer', 'veterinarian', 'admin'), createHealthRecord);
router.put('/:id', authorize('farmer', 'veterinarian', 'admin'), updateHealthRecord);

module.exports = router;
