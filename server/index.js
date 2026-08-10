/**
 * BioSecure Farm - Express API Server
 * Connects to mongodb://localhost:27017/biosecure_db
 * Run: node server/index.js
 */
const express    = require("express");
const cors       = require("cors");
const { MongoClient, ObjectId } = require("mongodb");

const app      = express();
const PORT     = 5000;
const MONGO_URI = "mongodb://127.0.0.1:27017";
const DB_NAME   = "biosecure_db";

app.use(cors());
app.use(express.json());

let db;

MongoClient.connect(MONGO_URI)
  .then(client => {
    db = client.db(DB_NAME);
    console.log("[OK] Connected to MongoDB:", DB_NAME);
    app.listen(PORT, () => console.log(`[OK] API Server running on http://localhost:${PORT}/api`));
  })
  .catch(err => {
    console.error("[ERROR] MongoDB connection failed:", err.message);
    process.exit(1);
  });

// ── Generic collection router ─────────────────────────────────────────────
function makeRouter(collectionName) {
  const router = express.Router();

  // GET all with optional query filters
  router.get("/", async (req, res) => {
    try {
      const filter = {};
      for (const [key, val] of Object.entries(req.query)) {
        if (val === "true")  filter[key] = true;
        else if (val === "false") filter[key] = false;
        else filter[key] = val;
      }
      const docs = await db.collection(collectionName).find(filter).toArray();
      res.json(docs);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  // GET by id field (e.g. userId, farmId, etc.)
  router.get("/:id", async (req, res) => {
    try {
      const id = req.params.id;
      // Try all common id fields
      const idFields = ["userId","farmId","livestockId","vaccinationId","outbreakId",
                        "assessmentId","reportId","alertId","locationId","notificationId"];
      let doc = null;
      for (const field of idFields) {
        doc = await db.collection(collectionName).findOne({ [field]: id });
        if (doc) break;
      }
      if (!doc && ObjectId.isValid(id)) {
        doc = await db.collection(collectionName).findOne({ _id: new ObjectId(id) });
      }
      if (!doc) return res.status(404).json({ error: "Not found" });
      res.json(doc);
    } catch (e) { res.status(500).json({ error: e.message }); }
  });

  return router;
}

// ── Special login route ───────────────────────────────────────────────────
app.post("/api/users/login", async (req, res) => {
  try {
    const { email, role } = req.body;

    // Email login: find exact user
    if (email) {
      const user = await db.collection("users").findOne({ email });
      if (!user) return res.status(404).json({ error: "User not found" });
      return res.json(user);
    }

    // Role login (demo mode): for Farmer, find one who actually owns a farm
    if (role === "Farmer") {
      const farmOwnerIds = await db.collection("farms").distinct("ownerId");
      const user = await db.collection("users").findOne({
        role: "Farmer",
        userId: { $in: farmOwnerIds },
      });
      if (user) return res.json(user);
    }

    // For other roles, just return first matching user
    const user = await db.collection("users").findOne({ role: role || "Farmer" });
    if (!user) return res.status(404).json({ error: "User not found for role: " + role });
    res.json(user);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ── Mount collection routes ───────────────────────────────────────────────
const COLLECTIONS = [
  "users", "farms", "livestock", "vaccinations", "diseases",
  "biosecurity", "veterinarian_reports", "government_alerts",
  "gis_locations", "notifications", "analytics",
];
for (const col of COLLECTIONS) {
  app.use(`/api/${col}`, makeRouter(col));
}

// ── Analytics summary route ───────────────────────────────────────────────
app.get("/api/analytics/summary", async (req, res) => {
  try {
    const [farms, diseases, biosecurity, vaccinations] = await Promise.all([
      db.collection("farms").find().toArray(),
      db.collection("diseases").find().toArray(),
      db.collection("biosecurity").find().toArray(),
      db.collection("vaccinations").find().toArray(),
    ]);

    const stateWiseFarmCount = {};
    farms.forEach(f => { stateWiseFarmCount[f.state] = (stateWiseFarmCount[f.state] || 0) + 1; });

    const districtWiseDiseaseCount = {};
    diseases.forEach(d => { districtWiseDiseaseCount[d.district] = (districtWiseDiseaseCount[d.district] || 0) + 1; });

    const riskStats = { High: 0, Moderate: 0, Low: 0 };
    biosecurity.forEach(b => { riskStats[b.riskLevel] = (riskStats[b.riskLevel] || 0) + 1; });

    const monthlyVac = {};
    vaccinations.forEach(v => {
      const m = v.vaccinationDate?.slice(0, 7);
      if (m) monthlyVac[m] = (monthlyVac[m] || 0) + 1;
    });

    res.json({
      stateWiseFarmCount:       Object.entries(stateWiseFarmCount).map(([state, count]) => ({ state, count })),
      districtWiseDiseaseCount: Object.entries(districtWiseDiseaseCount).map(([district, count]) => ({ district, count })),
      riskClassificationStats:  Object.entries(riskStats).map(([riskLevel, count]) => ({ riskLevel, count })),
      monthlyVaccinationTrends: Object.entries(monthlyVac).sort().map(([month, count]) => ({ month, count })),
      totalFarms:       farms.length,
      totalDiseases:    diseases.length,
      totalVaccinations:vaccinations.length,
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

app.get("/api/health", (req, res) => res.json({ status: "ok", db: DB_NAME }));

// ═══════════════════════════════════════════════════════════════════════════
// BIOSECURITY ASSESSMENT MODULE
// ═══════════════════════════════════════════════════════════════════════════

const ASSESSMENT_PARAMS = [
  "hygieneScore","housingCleanlinessScore","waterQualityScore","feedManagementScore",
  "wasteDisposalScore","visitorControlScore","disinfectionScore","pestControlScore",
  "quarantineScore","vaccinationScore","animalIntroductionScore","deadAnimalDisposalScore"
];

function calcBiosecurityScore(body) {
  const maxPerParam = 4;
  const total = ASSESSMENT_PARAMS.reduce((s, k) => s + (Number(body[k]) || 0), 0);
  const max   = ASSESSMENT_PARAMS.length * maxPerParam;
  return Math.round((total / max) * 100);
}

function getRiskLevel(score) {
  if (score <= 50) return "HIGH";
  if (score <= 80) return "MODERATE";
  return "LOW";
}

function getRecommendations(body) {
  const recs = [];
  if ((body.hygieneScore || 0) < 2)              recs.push("Improve farm sanitation and hygiene practices");
  if ((body.housingCleanlinessScore || 0) < 2)   recs.push("Clean and disinfect animal housing regularly");
  if ((body.waterQualityScore || 0) < 2)         recs.push("Test and treat water supply for contamination");
  if ((body.feedManagementScore || 0) < 2)       recs.push("Improve feed storage and management practices");
  if ((body.wasteDisposalScore || 0) < 2)        recs.push("Improve waste disposal and manure management");
  if ((body.visitorControlScore || 0) < 2)       recs.push("Restrict unnecessary visitors and enforce entry protocols");
  if ((body.disinfectionScore || 0) < 2)         recs.push("Implement vehicle and equipment disinfection procedures");
  if ((body.pestControlScore || 0) < 2)          recs.push("Strengthen pest and rodent control measures");
  if ((body.quarantineScore || 0) < 2)           recs.push("Establish proper animal isolation and quarantine facilities");
  if ((body.vaccinationScore || 0) < 2)          recs.push("Verify and update vaccination schedule for all animals");
  if ((body.animalIntroductionScore || 0) < 2)   recs.push("Quarantine newly introduced animals for at least 21 days");
  if ((body.deadAnimalDisposalScore || 0) < 2)   recs.push("Improve dead animal disposal procedures");
  return recs.length ? recs : ["Maintain current biosecurity standards"];
}

// POST /api/biosecurity/assessment
app.post("/api/biosecurity/assessment", async (req, res) => {
  try {
    const body = req.body;
    if (!body.farmId || !body.farmerId) return res.status(400).json({ error: "farmId and farmerId required" });
    const overallScore = calcBiosecurityScore(body);
    const riskLevel    = getRiskLevel(overallScore);
    const recommendations = getRecommendations(body);
    const strengths    = ASSESSMENT_PARAMS.filter(k => (body[k] || 0) >= 3).map(k => k.replace("Score",""));
    const weakAreas    = ASSESSMENT_PARAMS.filter(k => (body[k] || 0) < 2).map(k => k.replace("Score",""));
    const assessmentId = "BA-" + Date.now();
    const doc = {
      assessmentId, farmId: body.farmId, farmerId: body.farmerId,
      assessmentDate: new Date().toISOString(), farmType: body.farmType || "Mixed",
      ...ASSESSMENT_PARAMS.reduce((o,k) => ({ ...o, [k]: Number(body[k]) || 0 }), {}),
      overallScore, riskLevel, recommendations, strengths, weakAreas,
      createdAt: new Date(), updatedAt: new Date()
    };
    await db.collection("biosecurity_assessments").insertOne(doc);
    // If HIGH RISK, create notifications for vet and government
    if (riskLevel === "HIGH") {
      const notifBase = {
        type: "BIOSECURITY_ALERT", farmId: body.farmId, farmerId: body.farmerId,
        title: "High-Risk Biosecurity Assessment",
        message: `Farm ${body.farmId} scored ${overallScore}/100 (HIGH RISK). Immediate attention required.`,
        isRead: false, createdAt: new Date()
      };
      await db.collection("notifications").insertMany([
        { ...notifBase, notificationId: "N-" + Date.now() + "-vet",  targetRole: "Veterinarian" },
        { ...notifBase, notificationId: "N-" + Date.now() + "-gov",  targetRole: "Government Officer" },
      ]);
    }
    res.status(201).json({ success: true, assessmentId, overallScore, riskLevel, recommendations, strengths, weakAreas });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/biosecurity/farm/:farmId
app.get("/api/biosecurity/farm/:farmId", async (req, res) => {
  try {
    const doc = await db.collection("biosecurity_assessments")
      .findOne({ farmId: req.params.farmId }, { sort: { createdAt: -1 } });
    if (!doc) return res.status(404).json({ error: "No assessment found" });
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/biosecurity/history/:farmId
app.get("/api/biosecurity/history/:farmId", async (req, res) => {
  try {
    const docs = await db.collection("biosecurity_assessments")
      .find({ farmId: req.params.farmId }).sort({ createdAt: -1 }).limit(20).toArray();
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════
// DISEASE REPORTING MODULE
// ═══════════════════════════════════════════════════════════════════════════

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2)**2 + Math.cos(lat1*Math.PI/180)*Math.cos(lat2*Math.PI/180)*Math.sin(dLon/2)**2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
}

function calcDiseaseRisk(body) {
  const sev = (body.severity || "").toUpperCase();
  if (sev === "CRITICAL" || (body.deaths > 10)) return "HIGH";
  if (sev === "HIGH"     || (body.deaths > 0))  return "MODERATE";
  return "LOW";
}

// POST /api/disease/report
app.post("/api/disease/report", async (req, res) => {
  try {
    const body = req.body;
    if (!body.farmId || !body.farmerId) return res.status(400).json({ error: "farmId and farmerId required" });
    const reportId  = "DR-" + Date.now();
    const riskLevel = calcDiseaseRisk(body);
    // Get farm coordinates from farms collection
    const farm = await db.collection("farms").findOne({ farmId: body.farmId });
    const latitude  = body.latitude  || farm?.latitude  || 0;
    const longitude = body.longitude || farm?.longitude || 0;
    const doc = {
      reportId, farmId: body.farmId, farmerId: body.farmerId,
      animalType: body.animalType, suspectedDisease: body.suspectedDisease,
      symptoms: body.symptoms || [], affectedAnimals: Number(body.affectedAnimals) || 0,
      deaths: Number(body.deaths) || 0, symptomStartDate: body.symptomStartDate,
      severity: body.severity, remarks: body.remarks || "",
      imageUrl: body.imageUrl || null, latitude, longitude,
      status: "REPORTED", riskLevel,
      reportedDate: new Date().toISOString(),
      veterinarianId: null, inspectionStatus: "PENDING",
      diagnosis: null, createdAt: new Date(), updatedAt: new Date()
    };
    await db.collection("disease_reports").insertOne(doc);
    // Find nearby farms within configurable radius
    const config = await db.collection("system_config").findOne({ key: "risk_radius_km" });
    const radiusKm = config?.value || 5;
    const allFarms = await db.collection("farms").find({ latitude: { $exists: true } }).toArray();
    const nearbyFarms = allFarms.filter(f =>
      f.farmId !== body.farmId && f.latitude && f.longitude &&
      haversineKm(latitude, longitude, f.latitude, f.longitude) <= radiusKm
    ).map(f => ({ farmId: f.farmId, farmName: f.farmName, distance: haversineKm(latitude, longitude, f.latitude, f.longitude).toFixed(2) }));
    // Store nearby farms in the report
    await db.collection("disease_reports").updateOne({ reportId }, { $set: { nearbyFarms, updatedAt: new Date() } });
    // Generate notifications
    const farmName = farm?.farmName || body.farmId;
    const notifMsg = `A suspected ${body.suspectedDisease} report has been submitted from ${farmName}. Risk level: ${riskLevel}. Veterinary inspection required.`;
    const notifs = [
      { notificationId: "N-" + Date.now() + "-farmer", targetRole: "Farmer",           targetUserId: body.farmerId, type: "DISEASE_REPORT", title: "Disease Report Submitted",       message: `Your report for suspected ${body.suspectedDisease} has been received. Report ID: ${reportId}`, reportId, isRead: false, createdAt: new Date() },
      { notificationId: "N-" + Date.now() + "-vet",    targetRole: "Veterinarian",      type: riskLevel === "HIGH" ? "HIGH_RISK_ALERT" : "DISEASE_REPORT", title: riskLevel === "HIGH" ? "High-Risk Disease Alert" : "New Disease Report", message: notifMsg, reportId, isRead: false, createdAt: new Date() },
      { notificationId: "N-" + Date.now() + "-gov",    targetRole: "Government Officer", type: riskLevel === "HIGH" ? "HIGH_RISK_ALERT" : "DISEASE_REPORT", title: riskLevel === "HIGH" ? "High-Risk Disease Alert" : "New Disease Report", message: notifMsg, reportId, isRead: false, createdAt: new Date() },
    ];
    if (nearbyFarms.length > 0) {
      notifs.push({ notificationId: "N-" + Date.now() + "-nearby", targetRole: "Farmer", type: "NEARBY_OUTBREAK", title: "Nearby Outbreak Alert", message: `A suspected ${body.suspectedDisease} outbreak has been reported near your farm. ${nearbyFarms.length} farm(s) within ${radiusKm}km radius.`, reportId, isRead: false, createdAt: new Date() });
    }
    await db.collection("notifications").insertMany(notifs);
    res.status(201).json({ success: true, reportId, riskLevel, nearbyFarms, notificationsSent: notifs.length });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/disease/reports
app.get("/api/disease/reports", async (req, res) => {
  try {
    const filter = {};
    if (req.query.farmId)   filter.farmId   = req.query.farmId;
    if (req.query.farmerId) filter.farmerId = req.query.farmerId;
    if (req.query.status)   filter.status   = req.query.status;
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    const docs = await db.collection("disease_reports").find(filter).sort({ createdAt: -1 }).toArray();
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/disease/:reportId
app.get("/api/disease/:reportId", async (req, res) => {
  try {
    const doc = await db.collection("disease_reports").findOne({ reportId: req.params.reportId });
    if (!doc) return res.status(404).json({ error: "Report not found" });
    res.json(doc);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/disease/:reportId/status
app.put("/api/disease/:reportId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ["REPORTED","UNDER_REVIEW","VETERINARY_INSPECTION","CONFIRMED","RULED_OUT","RESOLVED"];
    if (!validStatuses.includes(status)) return res.status(400).json({ error: "Invalid status" });
    await db.collection("disease_reports").updateOne(
      { reportId: req.params.reportId },
      { $set: { status, updatedAt: new Date() } }
    );
    res.json({ success: true, reportId: req.params.reportId, status });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/disease/:reportId/inspection
app.put("/api/disease/:reportId/inspection", async (req, res) => {
  try {
    const update = {
      veterinarianId: req.body.veterinarianId,
      inspectionDate: req.body.inspectionDate,
      symptomsObserved: req.body.symptomsObserved,
      clinicalFindings: req.body.clinicalFindings,
      samplesCollected: req.body.samplesCollected,
      preliminaryDiagnosis: req.body.preliminaryDiagnosis,
      recommendedActions: req.body.recommendedActions,
      followUpDate: req.body.followUpDate,
      inspectionStatus: req.body.inspectionStatus || "INSPECTED",
      status: "VETERINARY_INSPECTION",
      updatedAt: new Date()
    };
    await db.collection("disease_reports").updateOne({ reportId: req.params.reportId }, { $set: update });
    res.json({ success: true, reportId: req.params.reportId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════
// GIS OUTBREAK MAPPING
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/gis/farms
app.get("/api/gis/farms", async (req, res) => {
  try {
    const farms = await db.collection("farms").find({ latitude: { $exists: true } }).toArray();
    // Enrich with latest biosecurity risk
    const bioMap = {};
    const bios = await db.collection("biosecurity_assessments").find().sort({ createdAt: -1 }).toArray();
    bios.forEach(b => { if (!bioMap[b.farmId]) bioMap[b.farmId] = b.riskLevel; });
    const result = farms.map(f => ({
      farmId: f.farmId, farmName: f.farmName, latitude: f.latitude, longitude: f.longitude,
      farmType: f.farmType, district: f.district, state: f.state,
      riskLevel: bioMap[f.farmId] || "LOW",
      markerColor: bioMap[f.farmId] === "HIGH" ? "red" : bioMap[f.farmId] === "MODERATE" ? "yellow" : "green"
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/gis/outbreaks
app.get("/api/gis/outbreaks", async (req, res) => {
  try {
    const reports = await db.collection("disease_reports")
      .find({ status: { $nin: ["RESOLVED", "RULED_OUT"] } })
      .sort({ createdAt: -1 }).toArray();
    const farms = await db.collection("farms").find().toArray();
    const farmMap = {};
    farms.forEach(f => { farmMap[f.farmId] = f; });
    const result = reports.map(r => ({
      reportId: r.reportId, farmId: r.farmId,
      farmName: farmMap[r.farmId]?.farmName || r.farmId,
      suspectedDisease: r.suspectedDisease, latitude: r.latitude, longitude: r.longitude,
      affectedAnimals: r.affectedAnimals, deaths: r.deaths, riskLevel: r.riskLevel,
      status: r.status, reportedDate: r.reportedDate, nearbyFarms: r.nearbyFarms || []
    }));
    res.json(result);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/gis/nearby-farms/:reportId
app.get("/api/gis/nearby-farms/:reportId", async (req, res) => {
  try {
    const report = await db.collection("disease_reports").findOne({ reportId: req.params.reportId });
    if (!report) return res.status(404).json({ error: "Report not found" });
    const config = await db.collection("system_config").findOne({ key: "risk_radius_km" });
    const radiusKm = config?.value || 5;
    const allFarms = await db.collection("farms").find({ latitude: { $exists: true } }).toArray();
    const nearby = allFarms
      .filter(f => f.farmId !== report.farmId && f.latitude && f.longitude)
      .map(f => ({ ...f, distanceKm: haversineKm(report.latitude, report.longitude, f.latitude, f.longitude) }))
      .filter(f => f.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    res.json({ outbreakFarm: report, radiusKm, nearbyFarms: nearby });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/notifications (override generic with role-aware)
app.get("/api/notifications", async (req, res) => {
  try {
    const filter = {};
    if (req.query.userId)     filter.targetUserId = req.query.userId;
    if (req.query.targetRole) filter.targetRole   = req.query.targetRole;
    if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === "true";
    const docs = await db.collection("notifications").find(filter).sort({ createdAt: -1 }).limit(50).toArray();
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// PUT /api/notifications/:id/read
app.put("/api/notifications/:id/read", async (req, res) => {
  try {
    await db.collection("notifications").updateOne(
      { notificationId: req.params.id },
      { $set: { isRead: true, readAt: new Date() } }
    );
    res.json({ success: true });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/notifications/send
app.post("/api/notifications/send", async (req, res) => {
  try {
    const { targetRole, targetUserId, title, message, type } = req.body;
    const notif = {
      notificationId: "N-" + Date.now(),
      targetRole, targetUserId: targetUserId || null,
      type: type || "GENERAL", title, message,
      isRead: false, createdAt: new Date()
    };
    await db.collection("notifications").insertOne(notif);
    res.status(201).json({ success: true, notificationId: notif.notificationId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// ═══════════════════════════════════════════════════════════════════════════
// GOVERNMENT DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════

// GET /api/government/dashboard
app.get("/api/government/dashboard", async (req, res) => {
  try {
    const [farms, reports, assessments] = await Promise.all([
      db.collection("farms").find().toArray(),
      db.collection("disease_reports").find().toArray(),
      db.collection("biosecurity_assessments").find().sort({ createdAt: -1 }).toArray(),
    ]);
    const latestBio = {};
    assessments.forEach(a => { if (!latestBio[a.farmId]) latestBio[a.farmId] = a; });
    const riskCounts = { HIGH: 0, MODERATE: 0, LOW: 0 };
    Object.values(latestBio).forEach(a => { riskCounts[a.riskLevel] = (riskCounts[a.riskLevel] || 0) + 1; });
    const activeOutbreaks = reports.filter(r => !["RESOLVED","RULED_OUT"].includes(r.status));
    const districtMap = {};
    activeOutbreaks.forEach(r => { districtMap[r.farmId] = (districtMap[r.farmId] || 0) + 1; });
    const totalAffected = activeOutbreaks.reduce((s, r) => s + (r.affectedAnimals || 0), 0);
    res.json({
      totalFarms: farms.length,
      totalSuspectedOutbreaks: reports.length,
      activeOutbreaks: activeOutbreaks.length,
      highRiskFarms: riskCounts.HIGH,
      moderateRiskFarms: riskCounts.MODERATE,
      lowRiskFarms: riskCounts.LOW,
      affectedAnimals: totalAffected,
      recentReports: activeOutbreaks.slice(0, 10)
    });
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// GET /api/government/outbreaks
app.get("/api/government/outbreaks", async (req, res) => {
  try {
    const filter = {};
    if (req.query.riskLevel) filter.riskLevel = req.query.riskLevel;
    if (req.query.status)    filter.status    = req.query.status;
    if (req.query.animalType) filter.animalType = req.query.animalType;
    const docs = await db.collection("disease_reports").find(filter).sort({ createdAt: -1 }).toArray();
    res.json(docs);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

// POST /api/government/advisory
app.post("/api/government/advisory", async (req, res) => {
  try {
    const { title, message, district, priority, issuedBy } = req.body;
    const advisory = {
      advisoryId: "ADV-" + Date.now(), title, message,
      district: district || "All Districts", priority: priority || "Medium",
      issuedBy: issuedBy || "Government Officer",
      status: "Active", issuedDate: new Date().toISOString(), createdAt: new Date()
    };
    await db.collection("government_alerts").insertOne(advisory);
    // Notify all farmers
    await db.collection("notifications").insertOne({
      notificationId: "N-" + Date.now() + "-adv",
      targetRole: "Farmer", type: "GOVERNMENT_ADVISORY",
      title: `Government Advisory: ${title}`,
      message, isRead: false, createdAt: new Date()
    });
    res.status(201).json({ success: true, advisoryId: advisory.advisoryId });
  } catch (e) { res.status(500).json({ error: e.message }); }
});
