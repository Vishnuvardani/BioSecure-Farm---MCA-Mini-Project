/**
 * seed-modules.js
 * Seeds disease_reports and biosecurity_assessments collections
 * Run: node data/seed-modules.js
 */
const { MongoClient } = require("mongodb");

async function seed() {
  const client = await MongoClient.connect("mongodb://127.0.0.1:27017");
  const db = client.db("biosecure_db");

  // Get real farms with coordinates
  const farms = await db.collection("farms").find({ latitude: { $exists: true } }).limit(10).toArray();
  if (!farms.length) {
    console.error("No farms with coordinates found. Run seed.js first.");
    await client.close();
    return;
  }
  console.log(`Found ${farms.length} farms with coordinates`);

  // ── Disease Reports ──────────────────────────────────────────────────────
  await db.collection("disease_reports").deleteMany({});
  const reports = [
    {
      reportId: "DR-001", farmId: farms[0].farmId, farmerId: farms[0].ownerId,
      animalType: "Pig", suspectedDisease: "African Swine Fever (ASF)",
      symptoms: ["Fever", "Skin lesions / blotches", "Sudden death"],
      affectedAnimals: 45, deaths: 8, symptomStartDate: "2025-07-08",
      severity: "CRITICAL", remarks: "Multiple pigs found dead overnight",
      latitude: farms[0].latitude, longitude: farms[0].longitude,
      status: "UNDER_REVIEW", riskLevel: "HIGH",
      reportedDate: new Date().toISOString(),
      veterinarianId: null, inspectionStatus: "PENDING", diagnosis: null,
      nearbyFarms: [], createdAt: new Date(), updatedAt: new Date()
    },
    {
      reportId: "DR-002", farmId: farms[1].farmId, farmerId: farms[1].ownerId,
      animalType: "Poultry", suspectedDisease: "Avian Influenza / Bird Flu (HPAI)",
      symptoms: ["Sudden high mortality", "Respiratory distress", "Drop in egg production"],
      affectedAnimals: 1200, deaths: 340, symptomStartDate: "2025-07-10",
      severity: "HIGH", remarks: "Broiler house 2 severely affected",
      latitude: farms[1].latitude, longitude: farms[1].longitude,
      status: "VETERINARY_INSPECTION", riskLevel: "HIGH",
      reportedDate: new Date().toISOString(),
      veterinarianId: "VET-001", inspectionStatus: "INSPECTED",
      preliminaryDiagnosis: "Suspected HPAI H5N1 — samples sent to lab",
      diagnosis: null, nearbyFarms: [], createdAt: new Date(), updatedAt: new Date()
    },
    {
      reportId: "DR-003", farmId: farms[2].farmId, farmerId: farms[2].ownerId,
      animalType: "Pig", suspectedDisease: "Classical Swine Fever (CSF)",
      symptoms: ["Fever", "Loss of appetite", "Vomiting / diarrhea"],
      affectedAnimals: 20, deaths: 2, symptomStartDate: "2025-07-12",
      severity: "MODERATE", remarks: "Gradual onset over 3 days",
      latitude: farms[2].latitude, longitude: farms[2].longitude,
      status: "REPORTED", riskLevel: "MODERATE",
      reportedDate: new Date().toISOString(),
      veterinarianId: null, inspectionStatus: "PENDING", diagnosis: null,
      nearbyFarms: [], createdAt: new Date(), updatedAt: new Date()
    },
    {
      reportId: "DR-004", farmId: farms[3].farmId, farmerId: farms[3].ownerId,
      animalType: "Poultry", suspectedDisease: "Newcastle Disease",
      symptoms: ["Respiratory distress", "Nervous signs / tremors", "Drop in egg production"],
      affectedAnimals: 800, deaths: 45, symptomStartDate: "2025-07-11",
      severity: "HIGH", remarks: "Rapid spread within flock",
      latitude: farms[3].latitude, longitude: farms[3].longitude,
      status: "REPORTED", riskLevel: "HIGH",
      reportedDate: new Date().toISOString(),
      veterinarianId: null, inspectionStatus: "PENDING", diagnosis: null,
      nearbyFarms: [], createdAt: new Date(), updatedAt: new Date()
    },
  ];
  const drResult = await db.collection("disease_reports").insertMany(reports);
  console.log(`Disease reports inserted: ${drResult.insertedCount}`);

  // ── Biosecurity Assessments ──────────────────────────────────────────────
  await db.collection("biosecurity_assessments").deleteMany({});
  const assessments = [
    {
      assessmentId: "BA-001", farmId: farms[0].farmId, farmerId: farms[0].ownerId,
      assessmentDate: new Date().toISOString(), farmType: "Pig",
      hygieneScore: 2, housingCleanlinessScore: 2, waterQualityScore: 3,
      feedManagementScore: 2, wasteDisposalScore: 1, visitorControlScore: 1,
      disinfectionScore: 2, pestControlScore: 2, quarantineScore: 1,
      vaccinationScore: 3, animalIntroductionScore: 1, deadAnimalDisposalScore: 1,
      overallScore: 44, riskLevel: "HIGH",
      recommendations: ["Improve waste disposal", "Restrict unnecessary visitors", "Improve quarantine facilities", "Verify vaccination schedule"],
      strengths: ["waterQuality", "vaccination"],
      weakAreas: ["wasteDisposal", "visitorControl", "quarantine", "animalIntroduction", "deadAnimalDisposal"],
      createdAt: new Date(), updatedAt: new Date()
    },
    {
      assessmentId: "BA-002", farmId: farms[2].farmId, farmerId: farms[2].ownerId,
      assessmentDate: new Date(Date.now() - 7 * 86400000).toISOString(), farmType: "Mixed",
      hygieneScore: 4, housingCleanlinessScore: 4, waterQualityScore: 4,
      feedManagementScore: 3, wasteDisposalScore: 3, visitorControlScore: 4,
      disinfectionScore: 4, pestControlScore: 3, quarantineScore: 3,
      vaccinationScore: 4, animalIntroductionScore: 3, deadAnimalDisposalScore: 3,
      overallScore: 88, riskLevel: "LOW",
      recommendations: ["Maintain current biosecurity standards"],
      strengths: ["hygiene", "housingCleanliness", "waterQuality", "visitorControl", "disinfection", "vaccination"],
      weakAreas: [],
      createdAt: new Date(Date.now() - 7 * 86400000), updatedAt: new Date(Date.now() - 7 * 86400000)
    },
    {
      assessmentId: "BA-003", farmId: farms[3].farmId, farmerId: farms[3].ownerId,
      assessmentDate: new Date(Date.now() - 3 * 86400000).toISOString(), farmType: "Poultry",
      hygieneScore: 3, housingCleanlinessScore: 2, waterQualityScore: 3,
      feedManagementScore: 3, wasteDisposalScore: 2, visitorControlScore: 2,
      disinfectionScore: 3, pestControlScore: 2, quarantineScore: 2,
      vaccinationScore: 3, animalIntroductionScore: 2, deadAnimalDisposalScore: 2,
      overallScore: 65, riskLevel: "MODERATE",
      recommendations: ["Improve housing cleanliness", "Strengthen pest and rodent control", "Improve visitor control protocols"],
      strengths: ["hygiene", "waterQuality", "feedManagement", "vaccination"],
      weakAreas: ["housingCleanliness", "pestControl", "visitorControl"],
      createdAt: new Date(Date.now() - 3 * 86400000), updatedAt: new Date(Date.now() - 3 * 86400000)
    },
    {
      assessmentId: "BA-004", farmId: farms[0].farmId, farmerId: farms[0].ownerId,
      assessmentDate: new Date(Date.now() - 30 * 86400000).toISOString(), farmType: "Pig",
      hygieneScore: 1, housingCleanlinessScore: 1, waterQualityScore: 2,
      feedManagementScore: 1, wasteDisposalScore: 0, visitorControlScore: 0,
      disinfectionScore: 1, pestControlScore: 1, quarantineScore: 0,
      vaccinationScore: 2, animalIntroductionScore: 0, deadAnimalDisposalScore: 0,
      overallScore: 19, riskLevel: "HIGH",
      recommendations: ["Immediate biosecurity overhaul required", "Implement waste disposal system", "Restrict all non-essential visitors", "Establish quarantine area"],
      strengths: ["waterQuality", "vaccination"],
      weakAreas: ["hygiene", "housingCleanliness", "feedManagement", "wasteDisposal", "visitorControl", "disinfection", "pestControl", "quarantine", "animalIntroduction", "deadAnimalDisposal"],
      createdAt: new Date(Date.now() - 30 * 86400000), updatedAt: new Date(Date.now() - 30 * 86400000)
    },
  ];
  const baResult = await db.collection("biosecurity_assessments").insertMany(assessments);
  console.log(`Biosecurity assessments inserted: ${baResult.insertedCount}`);

  // ── Notifications for new modules ────────────────────────────────────────
  const notifCount = await db.collection("notifications").countDocuments({ type: "HIGH_RISK_ALERT" });
  if (notifCount === 0) {
    await db.collection("notifications").insertMany([
      { notificationId: "N-MODULE-001", targetRole: "Farmer", targetUserId: farms[0].ownerId, type: "HIGH_RISK_ALERT", title: "High-Risk Disease Alert", message: "A suspected African Swine Fever report has been submitted from your farm. Veterinary inspection is required immediately.", reportId: "DR-001", isRead: false, createdAt: new Date() },
      { notificationId: "N-MODULE-002", targetRole: "Veterinarian", type: "HIGH_RISK_ALERT", title: "High-Risk Disease Alert", message: "A suspected African Swine Fever report has been submitted. Risk level: HIGH. Veterinary inspection required.", reportId: "DR-001", isRead: false, createdAt: new Date() },
      { notificationId: "N-MODULE-003", targetRole: "Government Officer", type: "HIGH_RISK_ALERT", title: "High-Risk Disease Alert", message: "A suspected HPAI (Bird Flu) report has been submitted. Risk level: HIGH. District-level response may be required.", reportId: "DR-002", isRead: false, createdAt: new Date() },
      { notificationId: "N-MODULE-004", targetRole: "Farmer", type: "BIOSECURITY_ALERT", title: "High-Risk Biosecurity Assessment", message: "Your farm scored 44/100 (HIGH RISK) on the latest biosecurity assessment. Immediate action required.", isRead: false, createdAt: new Date() },
      { notificationId: "N-MODULE-005", targetRole: "Farmer", type: "NEARBY_OUTBREAK", title: "Nearby Outbreak Alert", message: "A suspected African Swine Fever outbreak has been reported near your farm. Take precautionary biosecurity measures.", reportId: "DR-001", isRead: false, createdAt: new Date() },
      { notificationId: "N-MODULE-006", targetRole: "Farmer", type: "GOVERNMENT_ADVISORY", title: "Government Advisory: ASF Movement Restriction", message: "Movement of pigs is restricted in Anuradhapura district due to ASF outbreak. Do not move animals off-farm.", isRead: true, createdAt: new Date(Date.now() - 86400000) },
      { notificationId: "N-MODULE-007", targetRole: "Veterinarian", type: "INSPECTION_UPDATE", title: "Inspection Report Submitted", message: "Inspection report for Farm DR-002 has been submitted. Preliminary diagnosis: Suspected HPAI H5N1.", reportId: "DR-002", isRead: true, createdAt: new Date(Date.now() - 3600000) },
    ]);
    console.log("Module notifications seeded: 7");
  } else {
    console.log(`Module notifications already exist: ${notifCount}`);
  }

  // Final summary
  console.log("\n=== Seed Complete ===");
  console.log("disease_reports:", await db.collection("disease_reports").countDocuments());
  console.log("biosecurity_assessments:", await db.collection("biosecurity_assessments").countDocuments());
  console.log("notifications:", await db.collection("notifications").countDocuments());
  console.log("farms_with_coords:", await db.collection("farms").countDocuments({ latitude: { $exists: true } }));

  await client.close();
}

seed().catch(e => { console.error("Seed failed:", e.message); process.exit(1); });
