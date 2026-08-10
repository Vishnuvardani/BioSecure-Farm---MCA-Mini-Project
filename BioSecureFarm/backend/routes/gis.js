const router = require('express').Router();
const { getAllLocations, getNearbyOutbreaks, getHeatmapData, createLocation, bufferAnalysis } = require('../controllers/gisController');
const { protect } = require('../middleware/auth');

router.use(protect);
router.get('/', getAllLocations);
router.get('/nearby', getNearbyOutbreaks);
router.get('/heatmap', getHeatmapData);
router.get('/buffer', bufferAnalysis);
router.post('/', createLocation);

module.exports = router;
