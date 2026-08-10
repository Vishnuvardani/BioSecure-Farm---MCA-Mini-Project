/**
 * BioSecure Farm - MongoDB Seeder
 * Seeds all 10 collections into biosecure_db at mongodb://localhost:27017
 * Run: node seed.js
 */
const { MongoClient } = require("../node_modules/mongodb");
const fs = require("fs");
const path = require("path");

const MONGO_URI = "mongodb://127.0.0.1:27017";
const DB_NAME   = "biosecure_db";

const COLLECTIONS = [
  { name: "users",                file: "users.json" },
  { name: "farms",                file: "farms.json" },
  { name: "livestock",            file: "livestock.json" },
  { name: "vaccinations",         file: "vaccinations.json" },
  { name: "diseases",             file: "diseases.json" },
  { name: "biosecurity",          file: "biosecurity.json" },
  { name: "veterinarian_reports", file: "veterinarian_reports.json" },
  { name: "government_alerts",    file: "government_alerts.json" },
  { name: "gis_locations",        file: "gis_locations.json" },
  { name: "notifications",        file: "notifications.json" },
  { name: "analytics",            file: "analytics.json" },
];

async function seed() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    console.log("[OK] Connected to MongoDB at", MONGO_URI);
    const db = client.db(DB_NAME);

    for (const col of COLLECTIONS) {
      const filePath = path.join(__dirname, col.file);
      if (!fs.existsSync(filePath)) {
        console.log(`[SKIP] ${col.file} not found`);
        continue;
      }
      const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));
      const collection = db.collection(col.name);
      await collection.deleteMany({});
      if (data.length > 0) {
        await collection.insertMany(data);
      }
      console.log(`[OK] ${col.name}: ${data.length} documents inserted`);
    }

    // Create indexes for fast queries
    await db.collection("users").createIndex({ userId: 1 }, { unique: true });
    await db.collection("users").createIndex({ role: 1 });
    await db.collection("users").createIndex({ email: 1 }, { unique: true });
    await db.collection("farms").createIndex({ farmId: 1 }, { unique: true });
    await db.collection("farms").createIndex({ ownerId: 1 });
    await db.collection("farms").createIndex({ district: 1 });
    await db.collection("farms").createIndex({ state: 1 });
    await db.collection("livestock").createIndex({ livestockId: 1 }, { unique: true });
    await db.collection("livestock").createIndex({ farmId: 1 });
    await db.collection("vaccinations").createIndex({ vaccinationId: 1 }, { unique: true });
    await db.collection("vaccinations").createIndex({ farmId: 1 });
    await db.collection("diseases").createIndex({ outbreakId: 1 }, { unique: true });
    await db.collection("diseases").createIndex({ district: 1 });
    await db.collection("biosecurity").createIndex({ assessmentId: 1 }, { unique: true });
    await db.collection("biosecurity").createIndex({ farmId: 1 });
    await db.collection("gis_locations").createIndex({ farmId: 1 });
    await db.collection("notifications").createIndex({ userId: 1 });
    console.log("[OK] Indexes created");

    console.log("\n[DONE] biosecure_db seeded successfully!");
    console.log(`       Database: ${DB_NAME}`);
    console.log(`       URI:      ${MONGO_URI}`);
  } catch (err) {
    console.error("[ERROR]", err.message);
  } finally {
    await client.close();
  }
}

seed();
