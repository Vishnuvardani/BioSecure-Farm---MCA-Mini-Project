const router = require('express').Router();
const { createVaccination, getVaccinations, updateVaccination, getUpcoming } = require('../controllers/vaccinationController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.get('/upcoming', getUpcoming);
router.route('/').get(getVaccinations).post(authorize('farmer', 'veterinarian', 'admin'), createVaccination);
router.put('/:id', authorize('veterinarian', 'admin'), updateVaccination);

module.exports = router;
