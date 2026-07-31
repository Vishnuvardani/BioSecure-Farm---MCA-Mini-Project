const router = require('express').Router();
const { createAssessment, getAssessments, predictDisease } = require('../controllers/biosecurityController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.route('/').get(getAssessments).post(createAssessment);
router.post('/predict', predictDisease);

module.exports = router;
