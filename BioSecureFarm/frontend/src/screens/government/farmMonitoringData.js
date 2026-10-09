// ─── Realistic sample data for Farm Monitoring module ───────────────────────

export const BIOSECURITY_CRITERIA = [
  { id: 'access_control',    label: 'Farm Access Control',          maxScore: 5, description: 'Controlled entry/exit points with signage and barriers' },
  { id: 'visitor_mgmt',      label: 'Visitor Management',           maxScore: 5, description: 'Visitor log, PPE provision, and restricted access zones' },
  { id: 'footwear_hygiene',  label: 'Footwear & Clothing Hygiene',  maxScore: 4, description: 'Footbath, dedicated farm clothing, and changing facilities' },
  { id: 'cleaning_disinfect',label: 'Cleaning & Disinfection',      maxScore: 5, description: 'Regular cleaning schedule and disinfection of all areas' },
  { id: 'animal_quarantine', label: 'Animal Quarantine',            maxScore: 5, description: 'Isolation facility for new/sick animals' },
  { id: 'feed_water',        label: 'Feed & Water Hygiene',         maxScore: 4, description: 'Secure feed storage and clean water supply' },
  { id: 'dead_disposal',     label: 'Dead Animal Disposal',         maxScore: 4, description: 'Proper carcass disposal method and records' },
  { id: 'pest_control',      label: 'Pest & Rodent Control',        maxScore: 3, description: 'Active pest control program with records' },
  { id: 'vaccination',       label: 'Vaccination & Health Records', maxScore: 3, description: 'Up-to-date vaccination schedule and health records' },
  { id: 'disease_reporting', label: 'Disease Reporting Practices',  maxScore: 2, description: 'Awareness of reporting obligations and procedures' },
];

export const TOTAL_MAX_SCORE = BIOSECURITY_CRITERIA.reduce((s, c) => s + c.maxScore, 0); // 40

export const getRiskLevel = (score, max = TOTAL_MAX_SCORE) => {
  const pct = (score / max) * 100;
  if (pct >= 80) return { level: 'low',      label: 'Low Risk',      color: '#28A745', bg: '#d4edda' };
  if (pct >= 60) return { level: 'moderate', label: 'Moderate Risk', color: '#FFC107', bg: '#fff3cd' };
  return              { level: 'high',     label: 'High Risk',     color: '#DC3545', bg: '#f8d7da' };
};

// ─── Evidence image placeholders (using picsum for realistic previews) ───────
const img = (id, w = 400, h = 300) => `https://picsum.photos/seed/${id}/${w}/${h}`;

const makeEvidence = (assessmentId, farmSeed) => [
  { id: `${assessmentId}-1`, category: 'Farm Entrance',       date: '2026-09-05', description: 'Main gate with biosecurity signage', url: img(`${farmSeed}a`) },
  { id: `${assessmentId}-2`, category: 'Disinfection Area',   date: '2026-09-05', description: 'Vehicle disinfection bay at entrance', url: img(`${farmSeed}b`) },
  { id: `${assessmentId}-3`, category: 'Footbath',            date: '2026-09-05', description: 'Footbath with disinfectant solution', url: img(`${farmSeed}c`) },
  { id: `${assessmentId}-4`, category: 'Animal Housing',      date: '2026-09-05', description: 'Poultry shed interior', url: img(`${farmSeed}d`) },
  { id: `${assessmentId}-5`, category: 'Feed Storage',        date: '2026-09-05', description: 'Covered feed storage area', url: img(`${farmSeed}e`) },
  { id: `${assessmentId}-6`, category: 'Water Facility',      date: '2026-09-05', description: 'Automatic drinker system', url: img(`${farmSeed}f`) },
  { id: `${assessmentId}-7`, category: 'Quarantine Area',     date: '2026-09-05', description: 'Isolation pen for new arrivals', url: img(`${farmSeed}g`) },
  { id: `${assessmentId}-8`, category: 'Waste Disposal',      date: '2026-09-05', description: 'Composting unit for farm waste', url: img(`${farmSeed}h`) },
];

const makeGovEvidence = (assessmentId, farmSeed) => [
  { id: `${assessmentId}-g1`, category: 'Inspection – Entrance',    date: '2026-10-05', description: 'Officer inspection of entry point', url: img(`${farmSeed}g1`) },
  { id: `${assessmentId}-g2`, category: 'Inspection – Disinfection',date: '2026-10-05', description: 'Disinfection bay condition', url: img(`${farmSeed}g2`) },
  { id: `${assessmentId}-g3`, category: 'Inspection – Housing',     date: '2026-10-05', description: 'Animal housing cleanliness', url: img(`${farmSeed}g3`) },
  { id: `${assessmentId}-g4`, category: 'Inspection – Records',     date: '2026-10-05', description: 'Health and vaccination records', url: img(`${farmSeed}g4`) },
];

// ─── Farmer assessment scores per criterion ──────────────────────────────────
const farmerScores1 = { access_control:4, visitor_mgmt:4, footwear_hygiene:3, cleaning_disinfect:4, animal_quarantine:4, feed_water:3, dead_disposal:3, pest_control:2, vaccination:3, disease_reporting:2 };
const govScores1    = { access_control:3, visitor_mgmt:3, footwear_hygiene:3, cleaning_disinfect:3, animal_quarantine:4, feed_water:3, dead_disposal:2, pest_control:2, vaccination:3, disease_reporting:2 };

const farmerScores2 = { access_control:2, visitor_mgmt:2, footwear_hygiene:2, cleaning_disinfect:2, animal_quarantine:2, feed_water:2, dead_disposal:2, pest_control:1, vaccination:2, disease_reporting:1 };
const govScores2    = { access_control:2, visitor_mgmt:1, footwear_hygiene:1, cleaning_disinfect:2, animal_quarantine:2, feed_water:2, dead_disposal:1, pest_control:1, vaccination:1, disease_reporting:1 };

const farmerScores3 = { access_control:5, visitor_mgmt:5, footwear_hygiene:4, cleaning_disinfect:5, animal_quarantine:5, feed_water:4, dead_disposal:4, pest_control:3, vaccination:3, disease_reporting:2 };
const govScores3    = { access_control:5, visitor_mgmt:4, footwear_hygiene:4, cleaning_disinfect:5, animal_quarantine:5, feed_water:4, dead_disposal:4, pest_control:3, vaccination:3, disease_reporting:2 };

const farmerScores4 = { access_control:3, visitor_mgmt:3, footwear_hygiene:2, cleaning_disinfect:3, animal_quarantine:3, feed_water:3, dead_disposal:2, pest_control:2, vaccination:2, disease_reporting:1 };
const govScores4    = { access_control:3, visitor_mgmt:2, footwear_hygiene:2, cleaning_disinfect:3, animal_quarantine:3, feed_water:2, dead_disposal:2, pest_control:1, vaccination:2, disease_reporting:1 };

const sumScores = (s) => Object.values(s).reduce((a, b) => a + b, 0);

// ─── Assessment history builder ───────────────────────────────────────────────
const makeHistory = (farmId, fScores, gScores, farmSeed) => [
  {
    id: `${farmId}-gov-oct`,
    type: 'government',
    assessedBy: 'Officer Priya Sharma',
    date: '2026-10-05',
    scores: gScores,
    totalScore: sumScores(gScores),
    remarks: 'Farm shows adequate biosecurity practices. Footbath needs fresh solution more frequently. Visitor log is incomplete.',
    correctiveActions: [
      { action: 'Maintain proper footbath', priority: 'medium', dueDate: '2026-10-20', status: 'pending' },
      { action: 'Complete visitor log entries', priority: 'low', dueDate: '2026-10-15', status: 'pending' },
    ],
    evidence: makeGovEvidence(`${farmId}-gov-oct`, farmSeed + '10'),
    nextDueDate: '2026-11-05',
    frequency: 'once',
    assessmentType: 'routine',
  },
  {
    id: `${farmId}-farmer-sep20`,
    type: 'farmer',
    assessedBy: 'Farmer (Self-Assessment)',
    date: '2026-09-20',
    scores: fScores,
    totalScore: sumScores(fScores),
    remarks: '',
    correctiveActions: [],
    evidence: makeEvidence(`${farmId}-farmer-sep20`, farmSeed + '20'),
    nextDueDate: null,
    frequency: null,
    assessmentType: 'self',
  },
  {
    id: `${farmId}-gov-sep05`,
    type: 'government',
    assessedBy: 'Officer Rajan Pillai',
    date: '2026-09-05',
    scores: { ...gScores, cleaning_disinfect: Math.max(1, gScores.cleaning_disinfect - 1) },
    totalScore: sumScores(gScores) - 1,
    remarks: 'Cleaning schedule not consistently followed. Quarantine area adequate.',
    correctiveActions: [
      { action: 'Improve cleaning and disinfection', priority: 'high', dueDate: '2026-09-20', status: 'completed' },
    ],
    evidence: makeGovEvidence(`${farmId}-gov-sep05`, farmSeed + '30'),
    nextDueDate: '2026-10-05',
    frequency: 'once',
    assessmentType: 'routine',
  },
];

// ─── SAMPLE FARMS ─────────────────────────────────────────────────────────────
export const SAMPLE_FARMS = [
  {
    id: 'FARM-001',
    farmName: 'Green Valley Poultry Farm',
    farmerName: 'Ramesh Kumar',
    contact: '+91 98765 43210',
    email: 'ramesh.kumar@email.com',
    village: 'Pallikaranai',
    district: 'Chennai',
    state: 'Tamil Nadu',
    address: 'Survey No. 45, Pallikaranai Village, Chennai – 600100',
    gps: { lat: 12.9279, lng: 80.2075 },
    livestockType: 'poultry',
    totalAnimals: 4800,
    registrationDate: '2021-03-15',
    farmArea: 3.5,
    numberOfSheds: 4,
    capacity: 6000,
    numberOfWorkers: 8,
    farmerAssessmentScore: sumScores(farmerScores1),
    govAssessmentScore: sumScores(govScores1),
    lastAssessmentDate: '2026-10-05',
    nextAssessmentDue: '2026-11-05',
    assessmentStatus: 'assessed',
    history: makeHistory('FARM-001', farmerScores1, govScores1, 'gv'),
    farmerScores: farmerScores1,
    govScores: govScores1,
  },
  {
    id: 'FARM-002',
    farmName: 'Sunrise Pig Farm',
    farmerName: 'Anitha Devi',
    contact: '+91 87654 32109',
    email: 'anitha.devi@email.com',
    village: 'Tambaram',
    district: 'Chengalpattu',
    state: 'Tamil Nadu',
    address: 'Plot 12, Tambaram East, Chengalpattu – 603103',
    gps: { lat: 12.9249, lng: 80.1000 },
    livestockType: 'pig',
    totalAnimals: 320,
    registrationDate: '2020-07-22',
    farmArea: 2.0,
    numberOfSheds: 3,
    capacity: 500,
    numberOfWorkers: 5,
    farmerAssessmentScore: sumScores(farmerScores2),
    govAssessmentScore: sumScores(govScores2),
    lastAssessmentDate: '2026-10-05',
    nextAssessmentDue: '2026-10-20',
    assessmentStatus: 'overdue',
    history: makeHistory('FARM-002', farmerScores2, govScores2, 'sr'),
    farmerScores: farmerScores2,
    govScores: govScores2,
  },
  {
    id: 'FARM-003',
    farmName: 'Kaveri Mixed Farm',
    farmerName: 'Suresh Babu',
    contact: '+91 76543 21098',
    email: 'suresh.babu@email.com',
    village: 'Kancheepuram',
    district: 'Kancheepuram',
    state: 'Tamil Nadu',
    address: 'No. 7, Kancheepuram Rural, Kancheepuram – 631501',
    gps: { lat: 12.8342, lng: 79.7036 },
    livestockType: 'mixed',
    totalAnimals: 1250,
    registrationDate: '2019-11-10',
    farmArea: 5.2,
    numberOfSheds: 6,
    capacity: 2000,
    numberOfWorkers: 12,
    farmerAssessmentScore: sumScores(farmerScores3),
    govAssessmentScore: sumScores(govScores3),
    lastAssessmentDate: '2026-10-05',
    nextAssessmentDue: '2026-11-05',
    assessmentStatus: 'assessed',
    history: makeHistory('FARM-003', farmerScores3, govScores3, 'km'),
    farmerScores: farmerScores3,
    govScores: govScores3,
  },
  {
    id: 'FARM-004',
    farmName: 'Vellore Poultry Unit',
    farmerName: 'Meena Krishnan',
    contact: '+91 65432 10987',
    email: 'meena.k@email.com',
    village: 'Katpadi',
    district: 'Vellore',
    state: 'Tamil Nadu',
    address: 'Survey 88, Katpadi, Vellore – 632007',
    gps: { lat: 12.9675, lng: 79.1478 },
    livestockType: 'poultry',
    totalAnimals: 2200,
    registrationDate: '2022-01-05',
    farmArea: 2.8,
    numberOfSheds: 3,
    capacity: 3000,
    numberOfWorkers: 6,
    farmerAssessmentScore: sumScores(farmerScores4),
    govAssessmentScore: sumScores(govScores4),
    lastAssessmentDate: '2026-09-05',
    nextAssessmentDue: '2026-10-05',
    assessmentStatus: 'due',
    history: makeHistory('FARM-004', farmerScores4, govScores4, 'vp'),
    farmerScores: farmerScores4,
    govScores: govScores4,
  },
  {
    id: 'FARM-005',
    farmName: 'Salem Broiler Farm',
    farmerName: 'Vijay Anand',
    contact: '+91 54321 09876',
    email: 'vijay.anand@email.com',
    village: 'Attur',
    district: 'Salem',
    state: 'Tamil Nadu',
    address: 'NH-44, Attur, Salem – 636102',
    gps: { lat: 11.5985, lng: 78.5996 },
    livestockType: 'poultry',
    totalAnimals: 6500,
    registrationDate: '2018-06-30',
    farmArea: 7.0,
    numberOfSheds: 8,
    capacity: 8000,
    numberOfWorkers: 15,
    farmerAssessmentScore: sumScores(farmerScores1) + 2,
    govAssessmentScore: sumScores(govScores1) + 1,
    lastAssessmentDate: '2026-10-01',
    nextAssessmentDue: '2026-11-01',
    assessmentStatus: 'assessed',
    history: makeHistory('FARM-005', farmerScores1, govScores1, 'sb'),
    farmerScores: farmerScores1,
    govScores: govScores1,
  },
];

export const DISTRICTS = [...new Set(SAMPLE_FARMS.map(f => f.district))];
