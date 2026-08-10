const router = require('express').Router();
const { reportDisease, getDiseases, updateDisease } = require('../controllers/diseaseController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getDiseases).post(reportDisease);
router.put('/:id', authorize('veterinarian', 'government_officer', 'admin'), updateDisease);

module.exports = router;
