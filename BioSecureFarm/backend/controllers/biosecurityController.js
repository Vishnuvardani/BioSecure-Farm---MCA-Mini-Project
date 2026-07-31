const Biosecurity = require('../models/Biosecurity');
const Farm = require('../models/Farm');
const notificationService = require('../services/notificationService');

const getRecommendations = (params, score) => {
  const recs = [];
  if (params.farmHygiene?.score < 15) recs.push('Improve farm hygiene and sanitation protocols');
  if (params.waterQuality?.score < 10) recs.push('Test and treat water supply regularly');
  if (params.feedManagement?.score < 10) recs.push('Implement proper feed storage and management');
  if (params.visitorControl?.score < 10) recs.push('Enforce strict visitor access control');
  if (params.wasteDisposal?.score < 10) recs.push('Upgrade waste disposal and management systems');
  if (params.vaccinationCompliance?.score < 15) recs.push('Ensure all animals are vaccinated on schedule');
  if (score < 50) recs.push('Immediate biosecurity intervention required');
  return recs;
};

exports.createAssessment = async (req, res, next) => {
  try {
    const assessment = await Biosecurity.create({ ...req.body, assessedBy: req.user._id });
    assessment.recommendations = getRecommendations(req.body.parameters, assessment.totalScore);
    assessment.nextAssessmentDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await assessment.save();

    await Farm.findByIdAndUpdate(req.body.farm, {
      biosecurityScore: assessment.totalScore,
      riskLevel: assessment.riskLevel
    });

    if (assessment.riskLevel === 'high') {
      await notificationService.createNotification(
        req.user._id,
        'High Biosecurity Risk Detected',
        `Farm biosecurity score is ${assessment.totalScore}/100 - Immediate action required`,
        'alert'
      );
    }

    res.status(201).json({ success: true, data: assessment });
  } catch (err) { next(err); }
};

exports.getAssessments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.farm) filter.farm = req.query.farm;
    const assessments = await Biosecurity.find(filter)
      .populate('farm', 'farmName')
      .populate('assessedBy', 'fullName')
      .sort('-assessmentDate');
    res.json({ success: true, data: assessments });
  } catch (err) { next(err); }
};

exports.predictDisease = async (req, res, next) => {
  try {
    const { species, symptoms, biosecurityScore, vaccinationRate, nearbyOutbreaks, season } = req.body;

    // AI Disease Prediction - Decision Tree / Random Forest simulation
    const predictions = [];

    if (species === 'chicken' || species === 'duck' || species === 'turkey') {
      const birdFluRisk = calculateBirdFluRisk(symptoms, biosecurityScore, nearbyOutbreaks, season);
      predictions.push({ disease: 'Bird Flu (H5N1)', probability: birdFluRisk.probability, riskLevel: birdFluRisk.level, recommendations: birdFluRisk.recs });
    }

    if (species === 'pig') {
      const asfRisk = calculateASFRisk(symptoms, biosecurityScore, nearbyOutbreaks, vaccinationRate);
      predictions.push({ disease: 'African Swine Fever', probability: asfRisk.probability, riskLevel: asfRisk.level, recommendations: asfRisk.recs });
    }

    const fmdRisk = calculateFMDRisk(symptoms, biosecurityScore, vaccinationRate);
    predictions.push({ disease: 'Foot and Mouth Disease', probability: fmdRisk.probability, riskLevel: fmdRisk.level, recommendations: fmdRisk.recs });

    res.json({ success: true, data: { predictions, analysisDate: new Date() } });
  } catch (err) { next(err); }
};

function calculateBirdFluRisk(symptoms, bioScore, outbreaks, season) {
  let score = 0;
  const symptomList = symptoms || [];
  if (symptomList.includes('respiratory_distress')) score += 25;
  if (symptomList.includes('sudden_death')) score += 30;
  if (symptomList.includes('swollen_head')) score += 20;
  if (symptomList.includes('decreased_egg_production')) score += 15;
  if (bioScore < 50) score += 20;
  if (outbreaks > 0) score += outbreaks * 10;
  if (season === 'winter' || season === 'monsoon') score += 10;
  const probability = Math.min(score, 100);
  return {
    probability,
    level: probability >= 70 ? 'high' : probability >= 40 ? 'moderate' : 'low',
    recs: probability >= 70
      ? ['Immediate quarantine', 'Contact veterinarian', 'Report to authorities', 'Cull affected birds']
      : ['Monitor closely', 'Improve biosecurity', 'Vaccinate flock']
  };
}

function calculateASFRisk(symptoms, bioScore, outbreaks, vacRate) {
  let score = 0;
  const symptomList = symptoms || [];
  if (symptomList.includes('high_fever')) score += 30;
  if (symptomList.includes('skin_hemorrhage')) score += 25;
  if (symptomList.includes('loss_of_appetite')) score += 15;
  if (symptomList.includes('vomiting')) score += 20;
  if (bioScore < 50) score += 20;
  if (outbreaks > 0) score += outbreaks * 15;
  if (vacRate < 50) score += 15;
  const probability = Math.min(score, 100);
  return {
    probability,
    level: probability >= 70 ? 'high' : probability >= 40 ? 'moderate' : 'low',
    recs: probability >= 70
      ? ['Immediate isolation', 'No movement of pigs', 'Notify government', 'Disinfect premises']
      : ['Enhance biosecurity', 'Restrict farm access', 'Monitor daily']
  };
}

function calculateFMDRisk(symptoms, bioScore, vacRate) {
  let score = 0;
  const symptomList = symptoms || [];
  if (symptomList.includes('blisters_mouth')) score += 35;
  if (symptomList.includes('lameness')) score += 25;
  if (symptomList.includes('drooling')) score += 20;
  if (bioScore < 50) score += 15;
  if (vacRate < 60) score += 20;
  const probability = Math.min(score, 100);
  return {
    probability,
    level: probability >= 70 ? 'high' : probability >= 40 ? 'moderate' : 'low',
    recs: probability >= 70
      ? ['Quarantine farm', 'Emergency vaccination', 'Report to authorities']
      : ['Maintain vaccination schedule', 'Disinfect entry points']
  };
}
