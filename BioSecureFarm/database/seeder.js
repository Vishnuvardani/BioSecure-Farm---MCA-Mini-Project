const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Farm = require('../models/Farm');
const Livestock = require('../models/Livestock');
const Vaccination = require('../models/Vaccination');
const Disease = require('../models/Disease');
const Biosecurity = require('../models/Biosecurity');
const GISLocation = require('../models/GISLocation');
const Notification = require('../models/Notification');

const DISTRICTS = ['Coimbatore', 'Salem', 'Erode', 'Tiruppur', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Vellore', 'Madurai', 'Trichy'];
const CITIES = ['Coimbatore', 'Salem', 'Erode', 'Tiruppur', 'Namakkal', 'Dharmapuri', 'Krishnagiri', 'Vellore', 'Madurai', 'Trichy'];
const STATES = ['Tamil Nadu'];
const FARM_TYPES = ['pig', 'poultry', 'mixed'];
const SPECIES = ['pig', 'chicken', 'duck', 'turkey'];
const DISEASES = ['Bird Flu', 'African Swine Fever', 'Foot and Mouth Disease', 'Newcastle Disease', 'Swine Flu'];
const DISEASE_TYPES = ['bird_flu', 'african_swine_fever', 'foot_and_mouth', 'newcastle', 'other'];
const VACCINES = ['Newcastle Vaccine', 'Marek Disease Vaccine', 'Infectious Bronchitis Vaccine', 'ASF Vaccine', 'FMD Vaccine', 'Swine Flu Vaccine'];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randFloat = (min, max) => (Math.random() * (max - min) + min).toFixed(6);

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}), Farm.deleteMany({}), Livestock.deleteMany({}),
    Vaccination.deleteMany({}), Disease.deleteMany({}), Biosecurity.deleteMany({}),
    GISLocation.deleteMany({}), Notification.deleteMany({})
  ]);
  console.log('Cleared existing data');

  // Create Users (100)
  const hashedPass = await bcrypt.hash('Password@123', 12);
  const roles = ['farmer', 'farmer', 'farmer', 'farmer', 'farmer', 'veterinarian', 'veterinarian', 'government_officer', 'admin'];
  const users = [];

  // Fixed accounts for testing
  const fixedUsers = [
    { fullName: 'Admin User', email: 'admin@biosecure.com', role: 'admin' },
    { fullName: 'Dr. Rajesh Kumar', email: 'vet@biosecure.com', role: 'veterinarian' },
    { fullName: 'Officer Priya', email: 'gov@biosecure.com', role: 'government_officer' },
    { fullName: 'Farmer Murugan', email: 'farmer@biosecure.com', role: 'farmer' }
  ];

  for (const fu of fixedUsers) {
    users.push({
      fullName: fu.fullName, email: fu.email, password: hashedPass,
      mobile: `+91${randInt(7000000000, 9999999999)}`,
      role: fu.role, isVerified: true, isActive: true,
      district: rand(DISTRICTS)
    });
  }

  for (let i = 5; i <= 100; i++) {
    users.push({
      fullName: `User ${i} ${rand(['Kumar', 'Raj', 'Devi', 'Murugan', 'Priya', 'Rajan', 'Selvi'])}`,
      email: `user${i}@biosecure.com`,
      password: hashedPass,
      mobile: `+91${randInt(7000000000, 9999999999)}`,
      role: rand(roles),
      isVerified: true,
      isActive: Math.random() > 0.1,
      district: rand(DISTRICTS)
    });
  }

  const createdUsers = await User.insertMany(users);
  console.log(`Created ${createdUsers.length} users`);

  const farmers = createdUsers.filter(u => u.role === 'farmer');
  const vets = createdUsers.filter(u => u.role === 'veterinarian');

  // Create Farms (100)
  const farms = [];
  for (let i = 1; i <= 100; i++) {
    const farmer = rand(farmers);
    const vet = rand(vets);
    const district = rand(DISTRICTS);
    const lat = parseFloat(randFloat(8.5, 13.5));
    const lng = parseFloat(randFloat(76.5, 80.5));
    const bioScore = randInt(20, 100);

    farms.push({
      farmName: `${rand(['Green', 'Golden', 'Royal', 'Nature', 'Fresh', 'Pure', 'Happy'])} ${rand(['Valley', 'Hills', 'Farm', 'Acres', 'Fields', 'Ranch'])} Farm`,
      farmType: rand(FARM_TYPES),
      owner: farmer._id,
      registrationNumber: `FARM-TN-${String(i).padStart(4, '0')}`,
      address: { street: `${randInt(1, 999)} Main Road`, city: rand(CITIES), district, state: 'Tamil Nadu', pincode: `${randInt(600000, 643000)}` },
      location: { type: 'Point', coordinates: [lng, lat] },
      totalArea: randInt(1, 50),
      capacity: randInt(50, 1000),
      currentCount: randInt(10, 500),
      assignedVet: vet._id,
      biosecurityScore: bioScore,
      riskLevel: bioScore >= 81 ? 'low' : bioScore >= 51 ? 'moderate' : 'high',
      isActive: true,
      lastInspection: new Date(Date.now() - randInt(1, 90) * 24 * 60 * 60 * 1000)
    });
  }

  const createdFarms = await Farm.insertMany(farms);
  console.log(`Created ${createdFarms.length} farms`);

  // Create GIS Locations for farms
  const gisLocations = createdFarms.map(f => ({
    farm: f._id,
    locationType: 'farm',
    name: f.farmName,
    location: f.location,
    riskLevel: f.riskLevel,
    isActive: true
  }));
  await GISLocation.insertMany(gisLocations);
  console.log(`Created ${gisLocations.length} GIS locations`);

  // Create Livestock (1000)
  const livestock = [];
  for (let i = 1; i <= 1000; i++) {
    const farm = rand(createdFarms);
    const species = farm.farmType === 'pig' ? 'pig' : farm.farmType === 'poultry' ? rand(['chicken', 'duck', 'turkey']) : rand(SPECIES);
    livestock.push({
      farm: farm._id,
      owner: farm.owner,
      tagId: `TAG-TN-${String(i).padStart(5, '0')}`,
      species,
      breed: species === 'pig' ? rand(['Landrace', 'Yorkshire', 'Duroc', 'Hampshire']) : rand(['Broiler', 'Layer', 'Desi', 'Kadaknath']),
      gender: rand(['male', 'female']),
      dateOfBirth: new Date(Date.now() - randInt(30, 730) * 24 * 60 * 60 * 1000),
      weight: randInt(1, 100),
      healthStatus: rand(['healthy', 'healthy', 'healthy', 'sick', 'quarantine']),
      vaccinationStatus: rand(['up_to_date', 'up_to_date', 'due', 'overdue']),
      lastVaccination: new Date(Date.now() - randInt(1, 180) * 24 * 60 * 60 * 1000),
      isActive: true
    });
  }

  const createdLivestock = await Livestock.insertMany(livestock);
  console.log(`Created ${createdLivestock.length} livestock records`);

  // Create Vaccinations (500)
  const vaccinations = [];
  for (let i = 0; i < 500; i++) {
    const farm = rand(createdFarms);
    const animal = rand(createdLivestock);
    const vet = rand(vets);
    const adminDate = new Date(Date.now() - randInt(1, 365) * 24 * 60 * 60 * 1000);
    vaccinations.push({
      livestock: animal._id,
      farm: farm._id,
      vaccineName: rand(VACCINES),
      disease: rand(DISEASES),
      administeredBy: vet._id,
      administeredDate: adminDate,
      nextDueDate: new Date(adminDate.getTime() + 90 * 24 * 60 * 60 * 1000),
      batchNumber: `BATCH-${randInt(1000, 9999)}`,
      manufacturer: rand(['Zoetis', 'Merck Animal Health', 'Elanco', 'Boehringer Ingelheim']),
      dosage: `${randInt(1, 5)}ml`,
      status: rand(['completed', 'completed', 'completed', 'scheduled', 'missed'])
    });
  }

  await Vaccination.insertMany(vaccinations);
  console.log(`Created ${vaccinations.length} vaccination records`);

  // Create Disease Records (100)
  const diseases = [];
  for (let i = 0; i < 100; i++) {
    const farm = rand(createdFarms);
    const reporter = rand(vets);
    const lat = farm.location.coordinates[1];
    const lng = farm.location.coordinates[0];
    const typeIdx = randInt(0, DISEASE_TYPES.length - 1);
    diseases.push({
      farm: farm._id,
      reportedBy: reporter._id,
      diseaseName: DISEASES[typeIdx] || rand(DISEASES),
      diseaseType: DISEASE_TYPES[typeIdx],
      affectedSpecies: [rand(SPECIES)],
      affectedCount: randInt(1, 100),
      symptoms: rand([['high_fever', 'loss_of_appetite'], ['respiratory_distress', 'sudden_death'], ['blisters_mouth', 'lameness'], ['skin_hemorrhage', 'vomiting']]),
      severity: rand(['low', 'moderate', 'high', 'critical']),
      status: rand(['suspected', 'confirmed', 'under_treatment', 'resolved']),
      outbreakDate: new Date(Date.now() - randInt(1, 180) * 24 * 60 * 60 * 1000),
      location: { type: 'Point', coordinates: [lng + (Math.random() - 0.5) * 0.1, lat + (Math.random() - 0.5) * 0.1] },
      isOutbreak: Math.random() > 0.7,
      notifiedAuthorities: Math.random() > 0.5
    });
  }

  await Disease.insertMany(diseases);
  console.log(`Created ${diseases.length} disease records`);

  // Create Biosecurity Assessments
  const biosecurityRecords = [];
  for (const farm of createdFarms.slice(0, 80)) {
    const assessor = rand(vets);
    const params = {
      farmHygiene: { score: randInt(5, 20) },
      waterQuality: { score: randInt(3, 15) },
      feedManagement: { score: randInt(3, 15) },
      visitorControl: { score: randInt(3, 15) },
      wasteDisposal: { score: randInt(3, 15) },
      vaccinationCompliance: { score: randInt(5, 20) }
    };
    const total = Object.values(params).reduce((a, b) => a + b.score, 0);
    biosecurityRecords.push({
      farm: farm._id,
      assessedBy: assessor._id,
      assessmentDate: new Date(Date.now() - randInt(1, 60) * 24 * 60 * 60 * 1000),
      parameters: params,
      totalScore: total,
      riskLevel: total >= 81 ? 'low' : total >= 51 ? 'moderate' : 'high',
      recommendations: ['Improve hygiene protocols', 'Regular water testing', 'Strict visitor log'],
      nextAssessmentDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  }

  await Biosecurity.insertMany(biosecurityRecords);
  console.log(`Created ${biosecurityRecords.length} biosecurity assessments`);

  console.log('\n✅ Seeding complete!');
  console.log('\n📋 Test Accounts:');
  console.log('Admin:    admin@biosecure.com / Password@123');
  console.log('Vet:      vet@biosecure.com / Password@123');
  console.log('Gov:      gov@biosecure.com / Password@123');
  console.log('Farmer:   farmer@biosecure.com / Password@123');

  await mongoose.disconnect();
}

seed().catch(err => { console.error('Seeding failed:', err); process.exit(1); });
