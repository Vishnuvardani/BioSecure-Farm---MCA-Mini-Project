const GISLocation = require('../models/GISLocation');
const Disease = require('../models/Disease');
const Farm = require('../models/Farm');

exports.getAllLocations = async (req, res, next) => {
  try {
    const filter = { isActive: true };
    if (req.query.type) filter.locationType = req.query.type;
    const locations = await GISLocation.find(filter)
      .populate('farm', 'farmName farmType biosecurityScore')
      .populate('disease', 'diseaseName severity status');
    res.json({ success: true, data: locations });
  } catch (err) { next(err); }
};

exports.getNearbyOutbreaks = async (req, res, next) => {
  try {
    const { lng, lat, radius = 50000 } = req.query;
    const outbreaks = await GISLocation.find({
      locationType: 'outbreak',
      isActive: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
          $maxDistance: parseInt(radius)
        }
      }
    }).populate('disease', 'diseaseName severity status affectedCount');
    res.json({ success: true, count: outbreaks.length, data: outbreaks });
  } catch (err) { next(err); }
};

exports.getHeatmapData = async (req, res, next) => {
  try {
    const diseases = await Disease.find({ status: { $in: ['suspected', 'confirmed'] } })
      .select('location diseaseName severity affectedCount');
    const heatmapPoints = diseases
      .filter(d => d.location?.coordinates?.length === 2)
      .map(d => ({
        lat: d.location.coordinates[1],
        lng: d.location.coordinates[0],
        weight: d.severity === 'critical' ? 4 : d.severity === 'high' ? 3 : d.severity === 'moderate' ? 2 : 1,
        disease: d.diseaseName
      }));
    res.json({ success: true, data: heatmapPoints });
  } catch (err) { next(err); }
};

exports.createLocation = async (req, res, next) => {
  try {
    const loc = await GISLocation.create(req.body);
    res.status(201).json({ success: true, data: loc });
  } catch (err) { next(err); }
};

exports.bufferAnalysis = async (req, res, next) => {
  try {
    const { lng, lat, radius = 10000 } = req.query;
    const [farms, outbreaks] = await Promise.all([
      Farm.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        }
      }).select('farmName farmType biosecurityScore riskLevel address'),
      Disease.find({
        location: {
          $near: {
            $geometry: { type: 'Point', coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseInt(radius)
          }
        },
        status: { $in: ['suspected', 'confirmed'] }
      }).select('diseaseName severity status affectedCount')
    ]);
    res.json({ success: true, data: { farmsInBuffer: farms.length, outbreaksInBuffer: outbreaks.length, farms, outbreaks } });
  } catch (err) { next(err); }
};
