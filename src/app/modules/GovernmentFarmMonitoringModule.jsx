import { useState, useMemo } from "react";
import {
  Eye, Search, Filter, Shield, AlertTriangle, AlertCircle, CheckCircle, Clock,
  MapPin, User, Phone, Calendar, ArrowLeft, Download, Maximize2, ZoomIn, ZoomOut,
  X, ChevronLeft, ChevronRight, Plus, Trash2, Edit3, Camera, Upload, Check,
  BarChart2, FileText, RefreshCw, AlertOctagon, CheckSquare, Layers, Award,
  Sparkles, ExternalLink, Info
} from "lucide-react";
import { formatDate } from "../../utils/dateTime";

// ── Color Palette ──────────────────────────────────────────────────────────
const P = {
  navy: "#0d1a2d",
  navyLight: "#1e293b",
  blue: "#2563eb",
  blueLight: "#eff6ff",
  blueBorder: "#bfdbfe",
  green: "#16a34a",
  greenLight: "#f0fdf4",
  greenBorder: "#bbf7d0",
  yellow: "#d97706",
  yellowLight: "#fffbeb",
  yellowBorder: "#fde68a",
  red: "#dc2626",
  redLight: "#fef2f2",
  redBorder: "#fecaca",
  orange: "#ea580c",
  orangeLight: "#fff7ed",
  grayDark: "#1f2937",
  grayMid: "#4b5563",
  grayLight: "#9ca3af",
  bgLight: "#f8fafc",
  cardBg: "#ffffff",
  border: "#e2e8f0",
  olive: "#808034",
  ivoryDark: "#f0f0d8"
};

// ── Helper SVG Data URLs for Evidence Images ──────────────────────────────
const SVG_PHOTOS = {
  entrance: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23e2e8f0"/><rect x="0" y="280" width="600" height="120" fill="%2364748b"/><rect x="80" y="100" width="20" height="180" fill="%23334155"/><rect x="500" y="100" width="20" height="180" fill="%23334155"/><path d="M 80 120 Q 300 60 500 120" stroke="%230284c7" stroke-width="12" fill="none"/><rect x="180" y="140" width="240" height="80" rx="8" fill="%231e293b"/><text x="300" y="185" fill="%23ffffff" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">BIOSECURITY GATE 01</text><text x="300" y="205" fill="%2338bdf8" font-family="sans-serif" font-size="13" text-anchor="middle">Vehicle Spray Arch Active</text><circle cx="120" cy="220" r="15" fill="%2322c55e"/><circle cx="480" cy="220" r="15" fill="%2322c55e"/></svg>`,
  disinfection: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><rect x="50" y="220" width="500" height="130" rx="10" fill="%2394a3b8"/><rect x="80" y="240" width="440" height="90" rx="6" fill="%230284c7" opacity="0.8"/><text x="300" y="290" fill="%23ffffff" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">AUTOMATED WHEEL WASH BASIN</text><rect x="120" y="100" width="360" height="40" fill="%23475569"/><line x1="200" y1="140" x2="200" y2="240" stroke="%2338bdf8" stroke-width="4" stroke-dasharray="8 4"/><line x1="400" y1="140" x2="400" y2="240" stroke="%2338bdf8" stroke-width="4" stroke-dasharray="8 4"/><text x="300" y="370" fill="%23475569" font-family="sans-serif" font-size="14" text-anchor="middle">Disinfectant Concentration: 1.2% Virkon S</text></svg>`,
  footbath: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc"/><rect x="100" y="120" width="400" height="200" rx="16" fill="%23cbd5e1" stroke="%23475569" stroke-width="8"/><rect x="120" y="140" width="360" height="160" rx="10" fill="%230369a1"/><text x="300" y="210" fill="%23ffffff" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">ENTRY FOOTBATH</text><text x="300" y="240" fill="%23bae6fd" font-family="sans-serif" font-size="15" text-anchor="middle">Fresh Iodine Solution - Refilled Daily</text><path d="M 220 70 L 260 70 L 260 110 L 220 110 Z" fill="%23dc2626"/><text x="240" y="97" fill="%23fff" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">+</text><text x="300" y="95" fill="%231e293b" font-family="sans-serif" font-size="16" font-weight="bold">Step Boots Here for 30 Seconds</text></svg>`,
  housing: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><polygon points="50,150 300,50 550,150" fill="%23475569"/><rect x="80" y="150" width="440" height="200" fill="%23e2e8f0" stroke="%23334155" stroke-width="4"/><rect x="120" y="180" width="80" height="120" fill="%2338bdf8" opacity="0.6"/><rect x="260" y="180" width="80" height="120" fill="%2338bdf8" opacity="0.6"/><rect x="400" y="180" width="80" height="120" fill="%2338bdf8" opacity="0.6"/><text x="300" y="320" fill="%231e293b" font-family="sans-serif" font-size="18" font-weight="bold" text-anchor="middle">VENTILATED POULTRY SHED #02</text><text x="300" y="340" fill="%2316a34a" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Automated Climate & Litter Dryness Normal</text></svg>`,
  feed: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23fffbeb"/><rect x="150" y="80" width="300" height="260" rx="12" fill="%23d97706" opacity="0.8"/><rect x="170" y="100" width="260" height="220" rx="8" fill="%23b45309"/><text x="300" y="180" fill="%23ffffff" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">SEALED FEED STORAGE</text><text x="300" y="210" fill="%23fef3c7" font-family="sans-serif" font-size="14" text-anchor="middle">Elevated Pallets & Rodent Guards Installed</text><rect x="220" y="240" width="160" height="50" rx="6" fill="%23ffffff"/><text x="300" y="270" fill="%2378350f" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">BATCH #2026-09A</text></svg>`,
  water: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f0f9ff"/><circle cx="300" cy="180" r="90" fill="%230284c7" opacity="0.2"/><path d="M 300 90 Q 370 200 300 240 Q 230 200 300 90 Z" fill="%230284c7"/><text x="300" y="310" fill="%230369a1" font-family="sans-serif" font-size="20" font-weight="bold" text-anchor="middle">UV & CHLORINE WATER PURIFIER</text><text x="300" y="340" fill="%230c4a6e" font-family="sans-serif" font-size="14" text-anchor="middle">Water Testing Passed: 0.2 ppm Chlorine</text></svg>`,
  quarantine: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23fef2f2"/><rect x="100" y="100" width="400" height="220" rx="12" fill="%23dc2626" opacity="0.15" stroke="%23dc2626" stroke-width="4"/><text x="300" y="180" fill="%23991b1b" font-family="sans-serif" font-size="24" font-weight="bold" text-anchor="middle">ISOLATION & QUARANTINE SHED</text><rect x="180" y="210" width="240" height="40" rx="6" fill="%23dc2626"/><text x="300" y="235" fill="%23ffffff" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">RESTRICTED ACCESS ONLY</text><text x="300" y="290" fill="%237f1d1d" font-family="sans-serif" font-size="13" text-anchor="middle">100m Perimeter Buffer Maintained</text></svg>`,
  waste: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc"/><rect x="120" y="140" width="360" height="180" rx="10" fill="%23475569"/><rect x="140" y="160" width="320" height="140" rx="6" fill="%2316a34a" opacity="0.8"/><text x="300" y="220" fill="%23ffffff" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">BIOGAS & COMPOSTING PIT</text><text x="300" y="250" fill="%23dcfce7" font-family="sans-serif" font-size="14" text-anchor="middle">Deep Concrete Encased - Zero Runoff</text></svg>`,
  clothing: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f1f5f9"/><rect x="150" y="60" width="300" height="280" rx="12" fill="%230284c7" opacity="0.1" stroke="%230284c7" stroke-width="3"/><text x="300" y="140" fill="%230369a1" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">PPE STATION & PPE RACK</text><text x="300" y="180" fill="%23334155" font-family="sans-serif" font-size="15" text-anchor="middle">• Clean Disposable Coveralls Available</text><text x="300" y="210" fill="%23334155" font-family="sans-serif" font-size="15" text-anchor="middle">• Sanitized Rubber Boots Stacked</text><text x="300" y="240" fill="%23334155" font-family="sans-serif" font-size="15" text-anchor="middle">• Nitrile Gloves & Respirators Sealed</text></svg>`,
  cleaning: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="%23f8fafc"/><rect x="120" y="100" width="360" height="220" rx="14" fill="%233b82f6" opacity="0.2" stroke="%232563eb" stroke-width="4"/><text x="300" y="180" fill="%231d4ed8" font-family="sans-serif" font-size="22" font-weight="bold" text-anchor="middle">HIGH PRESSURE WASHER UNIT</text><text x="300" y="220" fill="%231e293b" font-family="sans-serif" font-size="15" text-anchor="middle">Hot Water Power Spray (150 Bar)</text><text x="300" y="250" fill="%2316a34a" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">Daily Disinfection Logged</text></svg>`
};

// ── 10 Standard Biosecurity Categories ────────────────────────────────────
const BIOSECURITY_CATEGORIES = [
  { key: "accessControl", label: "Farm access control", maxScore: 5, question: "Are farm perimeter fences, gates, and warning signs fully secured?" },
  { key: "visitorManagement", label: "Visitor management", maxScore: 5, question: "Is there a mandatory visitor logbook, health declaration, and downtime rule?" },
  { key: "hygieneFootwear", label: "Footwear and clothing hygiene", maxScore: 5, question: "Are dedicated boots/coveralls provided with active footbaths at each shed?" },
  { key: "cleaningDisinfection", label: "Cleaning and disinfection", maxScore: 5, question: "Are power washers and approved virucidal disinfectants used regularly?" },
  { key: "quarantine", label: "Animal quarantine", maxScore: 5, question: "Is a dedicated isolation unit maintained for sick or new incoming stock?" },
  { key: "feedWater", label: "Feed and water hygiene", maxScore: 5, question: "Is feed stored in sealed rodent-proof bins and water chlorinated/tested?" },
  { key: "deadAnimalDisposal", label: "Dead animal disposal", maxScore: 5, question: "Is safe carcass disposal (incineration/deep burial pit) implemented?" },
  { key: "pestControl", label: "Pest and rodent control", maxScore: 5, question: "Are bait stations, insect traps, and bird netting installed and inspected?" },
  { key: "vaccinationHealth", label: "Vaccination and health records", maxScore: 5, question: "Are updated animal health cards and mandatory vaccination logs maintained?" },
  { key: "diseaseReporting", label: "Disease reporting practices", maxScore: 5, question: "Does the farmer know and use immediate notification to local veterinary officer?" }
];

// ── Sample Initial Farms Data with Rich Assessment Records ───────────────
const INITIAL_FARMS_DATA = [
  {
    id: "FARM-001",
    name: "Green Valley Farm",
    owner: "K. Wickramasinghe",
    phone: "+94 77 123 4567",
    district: "Anuradhapura",
    village: "Mihintale West",
    gps: "8.3114° N, 80.4037° E",
    livestockType: "Both",
    animals: 600,
    regDate: "2024-03-15",
    currentRisk: "Low",
    farmerScore: 36,
    govScore: 38,
    lastAssessmentDate: "2026-09-28",
    nextAssessmentDue: "2026-10-28",
    status: "Healthy",
    assessmentFrequency: "Once per Month",
    farmerAssessment: {
      date: "2026-09-28",
      totalScore: 36,
      maxScore: 50,
      percentage: 72,
      riskLevel: "Moderate",
      answers: {
        accessControl: 4, visitorManagement: 3, hygieneFootwear: 4,
        cleaningDisinfection: 4, quarantine: 3, feedWater: 4,
        deadAnimalDisposal: 3, pestControl: 3, vaccinationHealth: 4, diseaseReporting: 4
      }
    },
    latestGovAssessment: {
      id: "GOV-ASS-901",
      date: "2026-09-28",
      assessedBy: "Dr. S. Rathnayake",
      totalScore: 38,
      maxScore: 50,
      percentage: 76,
      riskLevel: "Low",
      remarks: "Farm maintains excellent gate protocols and footbath cleanliness. Feed storage is well secured.",
      scores: {
        accessControl: 4, visitorManagement: 4, hygieneFootwear: 4,
        cleaningDisinfection: 4, quarantine: 3, feedWater: 4,
        deadAnimalDisposal: 3, pestControl: 4, vaccinationHealth: 4, diseaseReporting: 4
      },
      itemRemarks: {
        accessControl: "Sturdy gate with prominent biosecurity warning signs.",
        visitorManagement: "Digital logbook active. Hand sanitizer available.",
        hygieneFootwear: "Fresh Iodine footbath verified.",
        cleaningDisinfection: "Pressure washer functioning with Virkon S."
      },
      inspectionImages: [
        { id: "IMG-GOV-01", category: "Farm access control", url: SVG_PHOTOS.entrance, date: "2026-09-28", desc: "Officer verified vehicle spray gate." }
      ]
    },
    farmerImages: [
      { id: "IMG-F-101", category: "Farm access control", url: SVG_PHOTOS.entrance, date: "2026-09-28", desc: "Main entrance fence and gate.", assessmentId: "FARMER-ASS-088" },
      { id: "IMG-F-102", category: "Footwear and clothing hygiene", url: SVG_PHOTOS.footbath, date: "2026-09-28", desc: "Shed 1 entrance footbath.", assessmentId: "FARMER-ASS-088" },
      { id: "IMG-F-103", category: "Cleaning and disinfection", url: SVG_PHOTOS.disinfection, date: "2026-09-28", desc: "Wheel washing basin.", assessmentId: "FARMER-ASS-088" },
      { id: "IMG-F-104", category: "Animal quarantine", url: SVG_PHOTOS.quarantine, date: "2026-09-28", desc: "Quarantine isolation shed.", assessmentId: "FARMER-ASS-088" },
      { id: "IMG-F-105", category: "Feed and water hygiene", url: SVG_PHOTOS.feed, date: "2026-09-28", desc: "Elevated feed storage pallets.", assessmentId: "FARMER-ASS-088" }
    ],
    history: [
      { id: "ASS-HIST-01", date: "2026-09-28", type: "Government", assessedBy: "Dr. S. Rathnayake", score: "38/50", risk: "Low", evidenceCount: 1 },
      { id: "ASS-HIST-02", date: "2026-09-20", type: "Farmer", assessedBy: "K. Wickramasinghe", score: "36/50", risk: "Moderate", evidenceCount: 5 },
      { id: "ASS-HIST-03", date: "2026-08-25", type: "Government", assessedBy: "Officer B. Jayawardena", score: "34/50", risk: "Moderate", evidenceCount: 4 }
    ],
    correctiveActions: [
      { id: "CA-101", action: "Improve animal quarantine", priority: "Medium", dueDate: "2026-10-15", status: "In Progress" },
      { id: "CA-102", action: "Update vaccination records", priority: "Low", dueDate: "2026-10-20", status: "Pending" }
    ]
  },
  {
    id: "FARM-002",
    name: "Sunburst Poultry Farm",
    owner: "A. Perera",
    phone: "+94 71 987 6543",
    district: "Polonnaruwa",
    village: "Kaduruwela South",
    gps: "7.9403° N, 81.0188° E",
    livestockType: "Poultry",
    animals: 1200,
    regDate: "2023-11-10",
    currentRisk: "High",
    farmerScore: 32,
    govScore: 24,
    lastAssessmentDate: "2026-09-15",
    nextAssessmentDue: "2026-10-01",
    status: "Assessment Overdue",
    assessmentFrequency: "Twice per Month",
    farmerAssessment: {
      date: "2026-09-15",
      totalScore: 32,
      maxScore: 50,
      percentage: 64,
      riskLevel: "Moderate",
      answers: {
        accessControl: 4, visitorManagement: 3, hygieneFootwear: 3,
        cleaningDisinfection: 3, quarantine: 2, feedWater: 4,
        deadAnimalDisposal: 3, pestControl: 3, vaccinationHealth: 4, diseaseReporting: 3
      }
    },
    latestGovAssessment: {
      id: "GOV-ASS-882",
      date: "2026-09-15",
      assessedBy: "Officer T. Mendis",
      totalScore: 24,
      maxScore: 50,
      percentage: 48,
      riskLevel: "High",
      remarks: "Footbath water dry. Wild bird netting has torn sections near coop 2. Immediate remediation required.",
      scores: {
        accessControl: 3, visitorManagement: 2, hygieneFootwear: 1,
        cleaningDisinfection: 2, quarantine: 2, feedWater: 3,
        deadAnimalDisposal: 2, pestControl: 2, vaccinationHealth: 4, diseaseReporting: 3
      },
      itemRemarks: {
        hygieneFootwear: "Footbath was completely dry during officer visit.",
        pestControl: "Torn netting observed allowing wild bird entry."
      },
      inspectionImages: [
        { id: "IMG-GOV-02", category: "Footwear and clothing hygiene", url: SVG_PHOTOS.footbath, date: "2026-09-15", desc: "Dry footbath at main gate." }
      ]
    },
    farmerImages: [
      { id: "IMG-F-201", category: "Farm access control", url: SVG_PHOTOS.entrance, date: "2026-09-15", desc: "Poultry farm gate.", assessmentId: "FARMER-ASS-077" },
      { id: "IMG-F-202", category: "Animal housing", url: SVG_PHOTOS.housing, date: "2026-09-15", desc: "Broiler shed 2.", assessmentId: "FARMER-ASS-077" },
      { id: "IMG-F-203", category: "Feed and water hygiene", url: SVG_PHOTOS.feed, date: "2026-09-15", desc: "Grain silo.", assessmentId: "FARMER-ASS-077" }
    ],
    history: [
      { id: "ASS-HIST-11", date: "2026-09-15", type: "Government", assessedBy: "Officer T. Mendis", score: "24/50", risk: "High", evidenceCount: 1 },
      { id: "ASS-HIST-12", date: "2026-09-15", type: "Farmer", assessedBy: "A. Perera", score: "32/50", risk: "Moderate", evidenceCount: 3 },
      { id: "ASS-HIST-13", date: "2026-08-30", type: "Government", assessedBy: "Officer T. Mendis", score: "28/50", risk: "Moderate", evidenceCount: 2 }
    ],
    correctiveActions: [
      { id: "CA-201", action: "Maintain proper footbath", priority: "High", dueDate: "2026-10-08", status: "Pending" },
      { id: "CA-202", action: "Improve pest and rodent control", priority: "High", dueDate: "2026-10-10", status: "In Progress" },
      { id: "CA-203", action: "Improve dead animal disposal", priority: "Medium", dueDate: "2026-10-15", status: "Pending" }
    ]
  },
  {
    id: "FARM-003",
    name: "Apex Swine & Pig Farm",
    owner: "M. Bandara",
    phone: "+94 75 444 3322",
    district: "Kurunegala",
    village: "Pannala East",
    gps: "7.3331° N, 79.9882° E",
    livestockType: "Pig",
    animals: 350,
    regDate: "2022-06-01",
    currentRisk: "Moderate",
    farmerScore: 35,
    govScore: 33,
    lastAssessmentDate: "2026-09-22",
    nextAssessmentDue: "2026-10-22",
    status: "Assessment Scheduled",
    assessmentFrequency: "Once per Month",
    farmerAssessment: {
      date: "2026-09-22",
      totalScore: 35,
      maxScore: 50,
      percentage: 70,
      riskLevel: "Moderate",
      answers: {
        accessControl: 4, visitorManagement: 3, hygieneFootwear: 3,
        cleaningDisinfection: 4, quarantine: 3, feedWater: 4,
        deadAnimalDisposal: 3, pestControl: 3, vaccinationHealth: 4, diseaseReporting: 4
      }
    },
    latestGovAssessment: {
      id: "GOV-ASS-850",
      date: "2026-09-22",
      assessedBy: "Dr. S. Rathnayake",
      totalScore: 33,
      maxScore: 50,
      percentage: 66,
      riskLevel: "Moderate",
      remarks: "Piggery waste channel requires bio-digester maintenance. Feed storage clean.",
      scores: {
        accessControl: 4, visitorManagement: 3, hygieneFootwear: 3,
        cleaningDisinfection: 3, quarantine: 3, feedWater: 4,
        deadAnimalDisposal: 3, pestControl: 3, vaccinationHealth: 4, diseaseReporting: 3
      },
      itemRemarks: {},
      inspectionImages: [
        { id: "IMG-GOV-03", category: "Waste disposal area", url: SVG_PHOTOS.waste, date: "2026-09-22", desc: "Waste pit inspection." }
      ]
    },
    farmerImages: [
      { id: "IMG-F-301", category: "Disinfection area", url: SVG_PHOTOS.disinfection, date: "2026-09-22", desc: "Piggery disinfection gate.", assessmentId: "FARMER-ASS-065" },
      { id: "IMG-F-302", category: "Waste disposal area", url: SVG_PHOTOS.waste, date: "2026-09-22", desc: "Composting pit.", assessmentId: "FARMER-ASS-065" },
      { id: "IMG-F-303", category: "Protective clothing", url: SVG_PHOTOS.clothing, date: "2026-09-22", desc: "Rubber boots and gowns.", assessmentId: "FARMER-ASS-065" }
    ],
    history: [
      { id: "ASS-HIST-21", date: "2026-09-22", type: "Government", assessedBy: "Dr. S. Rathnayake", score: "33/50", risk: "Moderate", evidenceCount: 1 },
      { id: "ASS-HIST-22", date: "2026-09-22", type: "Farmer", assessedBy: "M. Bandara", score: "35/50", risk: "Moderate", evidenceCount: 3 }
    ],
    correctiveActions: [
      { id: "CA-301", action: "Improve waste disposal", priority: "Medium", dueDate: "2026-10-18", status: "In Progress" }
    ]
  },
  {
    id: "FARM-004",
    name: "Royal Agri Layers",
    owner: "R. Fernando",
    phone: "+94 70 888 9911",
    district: "Gampaha",
    village: "Minuwangoda North",
    gps: "7.1691° N, 79.9536° E",
    livestockType: "Poultry",
    animals: 2400,
    regDate: "2021-02-14",
    currentRisk: "Low",
    farmerScore: 46,
    govScore: 45,
    lastAssessmentDate: "2026-09-30",
    nextAssessmentDue: "2026-10-30",
    status: "Healthy",
    assessmentFrequency: "Once per Month",
    farmerAssessment: {
      date: "2026-09-30",
      totalScore: 46,
      maxScore: 50,
      percentage: 92,
      riskLevel: "Low",
      answers: {
        accessControl: 5, visitorManagement: 5, hygieneFootwear: 4,
        cleaningDisinfection: 5, quarantine: 4, feedWater: 5,
        deadAnimalDisposal: 4, pestControl: 4, vaccinationHealth: 5, diseaseReporting: 5
      }
    },
    latestGovAssessment: {
      id: "GOV-ASS-910",
      date: "2026-09-30",
      assessedBy: "Officer B. Jayawardena",
      totalScore: 45,
      maxScore: 50,
      percentage: 90,
      riskLevel: "Low",
      remarks: "Exemplary biosecurity management. Fully compliant with national poultry standards.",
      scores: {
        accessControl: 5, visitorManagement: 4, hygieneFootwear: 4,
        cleaningDisinfection: 5, quarantine: 4, feedWater: 5,
        deadAnimalDisposal: 4, pestControl: 4, vaccinationHealth: 5, diseaseReporting: 5
      },
      itemRemarks: {},
      inspectionImages: [
        { id: "IMG-GOV-04", category: "Cleaning equipment", url: SVG_PHOTOS.cleaning, date: "2026-09-30", desc: "High pressure washer unit." }
      ]
    },
    farmerImages: [
      { id: "IMG-F-401", category: "Water facility", url: SVG_PHOTOS.water, date: "2026-09-30", desc: "UV water treatment unit.", assessmentId: "FARMER-ASS-091" },
      { id: "IMG-F-402", category: "Cleaning equipment", url: SVG_PHOTOS.cleaning, date: "2026-09-30", desc: "Power wash equipment.", assessmentId: "FARMER-ASS-091" },
      { id: "IMG-F-403", category: "Protective clothing", url: SVG_PHOTOS.clothing, date: "2026-09-30", desc: "Staff PPE lockers.", assessmentId: "FARMER-ASS-091" },
      { id: "IMG-F-404", category: "Pest and rodent control", url: SVG_PHOTOS.feed, date: "2026-09-30", desc: "Sealed feed silo.", assessmentId: "FARMER-ASS-091" }
    ],
    history: [
      { id: "ASS-HIST-31", date: "2026-09-30", type: "Government", assessedBy: "Officer B. Jayawardena", score: "45/50", risk: "Low", evidenceCount: 1 },
      { id: "ASS-HIST-32", date: "2026-09-30", type: "Farmer", assessedBy: "R. Fernando", score: "46/50", risk: "Low", evidenceCount: 4 }
    ],
    correctiveActions: []
  },
  {
    id: "FARM-005",
    name: "Silverline Swine Complex",
    owner: "D. Gunasekara",
    phone: "+94 78 555 1212",
    district: "Ampara",
    village: "Uhana Central",
    gps: "7.3489° N, 81.6022° E",
    livestockType: "Pig",
    animals: 420,
    regDate: "2024-01-20",
    currentRisk: "High",
    farmerScore: 28,
    govScore: 22,
    lastAssessmentDate: "2026-09-10",
    nextAssessmentDue: "2026-09-25",
    status: "Assessment Overdue",
    assessmentFrequency: "Twice per Month",
    farmerAssessment: {
      date: "2026-09-10",
      totalScore: 28,
      maxScore: 50,
      percentage: 56,
      riskLevel: "High",
      answers: {
        accessControl: 3, visitorManagement: 2, hygieneFootwear: 3,
        cleaningDisinfection: 3, quarantine: 2, feedWater: 3,
        deadAnimalDisposal: 3, pestControl: 2, vaccinationHealth: 4, diseaseReporting: 3
      }
    },
    latestGovAssessment: {
      id: "GOV-ASS-840",
      date: "2026-09-10",
      assessedBy: "Dr. S. Rathnayake",
      totalScore: 22,
      maxScore: 50,
      percentage: 44,
      riskLevel: "High",
      remarks: "High biosecurity risk due to proximity to ASF surveillance buffer. Perimeter fence damaged.",
      scores: {
        accessControl: 2, visitorManagement: 2, hygieneFootwear: 2,
        cleaningDisinfection: 2, quarantine: 1, feedWater: 3,
        deadAnimalDisposal: 2, pestControl: 2, vaccinationHealth: 3, diseaseReporting: 3
      },
      itemRemarks: {
        accessControl: "East section of perimeter wire mesh fence broken.",
        quarantine: "No separate pen for sick pigs."
      },
      inspectionImages: [
        { id: "IMG-GOV-05", category: "Farm access control", url: SVG_PHOTOS.entrance, date: "2026-09-10", desc: "Damaged perimeter fencing." }
      ]
    },
    farmerImages: [
      { id: "IMG-F-501", category: "Dead animal disposal", url: SVG_PHOTOS.waste, date: "2026-09-10", desc: "Carcass burial site.", assessmentId: "FARMER-ASS-050" }
    ],
    history: [
      { id: "ASS-HIST-41", date: "2026-09-10", type: "Government", assessedBy: "Dr. S. Rathnayake", score: "22/50", risk: "High", evidenceCount: 1 },
      { id: "ASS-HIST-42", date: "2026-09-10", type: "Farmer", assessedBy: "D. Gunasekara", score: "28/50", risk: "High", evidenceCount: 1 }
    ],
    correctiveActions: [
      { id: "CA-501", action: "Improve farm access control", priority: "High", dueDate: "2026-10-05", status: "Pending" },
      { id: "CA-502", action: "Separate sick animals", priority: "High", dueDate: "2026-10-05", status: "Pending" },
      { id: "CA-503", action: "Improve quarantine facilities", priority: "High", dueDate: "2026-10-12", status: "Pending" }
    ]
  }
];

// ── Calculate Risk Info from Score ────────────────────────────────────────
function calculateRisk(score, maxScore = 50) {
  const percentage = Math.round((score / maxScore) * 100);
  if (percentage >= 80) {
    return { level: "Low Risk", color: P.green, bg: P.greenLight, border: P.greenBorder, pct: percentage };
  } else if (percentage >= 60) {
    return { level: "Moderate Risk", color: P.yellow, bg: P.yellowLight, border: P.yellowBorder, pct: percentage };
  } else {
    return { level: "High Risk", color: P.red, bg: P.redLight, border: P.redBorder, pct: percentage };
  }
}

// ── Badge Renderer Helper ──────────────────────────────────────────────────
function RiskBadge({ riskLevel }) {
  let color = P.green;
  let bg = P.greenLight;
  let border = P.greenBorder;
  let label = riskLevel || "Low Risk";

  if (label.toLowerCase().includes("high")) {
    color = P.red; bg = P.redLight; border = P.redBorder;
  } else if (label.toLowerCase().includes("mod")) {
    color = P.yellow; bg = P.yellowLight; border = P.yellowBorder;
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
      color, background: bg, border: `1px solid ${border}`
    }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color }} />
      {label}
    </span>
  );
}

function StatusBadge({ status }) {
  let color = P.green;
  let bg = P.greenLight;
  let label = status || "Healthy";

  if (status === "Assessment Overdue") {
    color = P.red; bg = P.redLight;
  } else if (status === "Assessment Due") {
    color = P.orange; bg = P.orangeLight;
  } else if (status === "Assessment Scheduled") {
    color = P.blue; bg = P.blueLight;
  }

  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "4px 10px", borderRadius: 20, fontSize: 11, fontWeight: 600,
      color, background: bg
    }}>
      {label}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT: GovernmentFarmMonitoringModule
// ═══════════════════════════════════════════════════════════════════════════
export default function GovernmentFarmMonitoringModule({ farms: propsFarms, user }) {
  // State for all farms in memory
  const [farmsList, setFarmsList] = useState(INITIAL_FARMS_DATA);
  const [selectedFarmId, setSelectedFarmId] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [riskFilter, setRiskFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [districtFilter, setDistrictFilter] = useState("All");

  // Officer Assessment Form State (when assessing a farm)
  const [isAssessing, setIsAssessing] = useState(false);
  const [assessmentScores, setAssessmentScores] = useState({});
  const [assessmentRemarks, setAssessmentRemarks] = useState({});
  const [generalOfficerRemarks, setGeneralOfficerRemarks] = useState("");
  const [assessmentImages, setAssessmentImages] = useState({});
  const [correctiveActionItems, setCorrectiveActionItems] = useState([]);
  const [newActionText, setNewActionText] = useState("");
  const [newActionPriority, setNewActionPriority] = useState("Medium");
  const [newActionDueDate, setNewActionDueDate] = useState("2026-10-30");

  // Scheduling State inside Assessment / Farm View
  const [scheduleFrequency, setScheduleFrequency] = useState("Once per Month");
  const [scheduleDate, setScheduleDate] = useState("2026-10-28");
  const [scheduleType, setScheduleType] = useState("Routine Inspection");
  const [scheduleOfficer, setScheduleOfficer] = useState(user?.name || "Dr. S. Rathnayake");
  const [scheduleNotes, setScheduleNotes] = useState("");
  const [scheduleError, setScheduleError] = useState("");

  // Confirmation & Toast Modals
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Lightbox Modal State
  const [lightboxImage, setLightboxImage] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [lightboxGallery, setLightboxGallery] = useState([]);
  const [zoomLevel, setZoomLevel] = useState(1);

  // Historical Assessment Drawer / Detail Modal
  const [viewHistoryRecord, setViewHistoryRecord] = useState(null);

  // Active Tab inside Farm Details view
  const [detailTab, setDetailTab] = useState("overview"); // "overview" | "evidence" | "history" | "comparison"

  // ── Selected Farm Object ────────────────────────────────────────────────
  const activeFarm = useMemo(() => {
    return farmsList.find(f => f.id === selectedFarmId) || null;
  }, [farmsList, selectedFarmId]);

  // ── Filtered Farms List ─────────────────────────────────────────────────
  const filteredFarms = useMemo(() => {
    return farmsList.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        f.id.toLowerCase().includes(q) ||
        f.name.toLowerCase().includes(q) ||
        f.owner.toLowerCase().includes(q) ||
        f.village.toLowerCase().includes(q) ||
        f.district.toLowerCase().includes(q);

      const matchesRisk = riskFilter === "All" || f.currentRisk.toLowerCase() === riskFilter.toLowerCase();
      const matchesStatus = statusFilter === "All" || f.status === statusFilter;
      const matchesDistrict = districtFilter === "All" || f.district === districtFilter;

      return matchesQuery && matchesRisk && matchesStatus && matchesDistrict;
    });
  }, [farmsList, searchQuery, riskFilter, statusFilter, districtFilter]);

  // ── Dashboard Metrics Summary ───────────────────────────────────────────
  const metrics = useMemo(() => {
    const total = farmsList.length;
    const low = farmsList.filter(f => f.currentRisk === "Low").length;
    const mod = farmsList.filter(f => f.currentRisk === "Moderate").length;
    const high = farmsList.filter(f => f.currentRisk === "High").length;
    const overdue = farmsList.filter(f => f.status === "Assessment Overdue").length;
    const scheduled = farmsList.filter(f => f.status === "Assessment Scheduled" || f.status === "Assessment Due").length;
    return { total, low, mod, high, overdue, scheduled };
  }, [farmsList]);

  // ── Unique Districts list ───────────────────────────────────────────────
  const districtsList = useMemo(() => {
    return Array.from(new Set(farmsList.map(f => f.district)));
  }, [farmsList]);

  // ── Start Conducting Government Assessment ─────────────────────────────
  const startGovernmentAssessment = (farm) => {
    setSelectedFarmId(farm.id);
    setIsAssessing(true);
    setGeneralOfficerRemarks("");
    setScheduleFrequency(farm.assessmentFrequency || "Once per Month");
    setScheduleDate(farm.nextAssessmentDue || "2026-10-28");
    setScheduleType("Routine Inspection");
    setScheduleOfficer(user?.name || "Dr. S. Rathnayake");
    setScheduleNotes("");
    setScheduleError("");

    // Initialize scores with farmer scores or default 4
    const initScores = {};
    const initRemarks = {};
    const initImages = {};

    BIOSECURITY_CATEGORIES.forEach(cat => {
      const fVal = farm.farmerAssessment?.answers?.[cat.key];
      initScores[cat.key] = fVal !== undefined ? fVal : 4;
      initRemarks[cat.key] = "";
      initImages[cat.key] = null;
    });

    setAssessmentScores(initScores);
    setAssessmentRemarks(initRemarks);
    setAssessmentImages(initImages);
    setCorrectiveActionItems(farm.correctiveActions ? [...farm.correctiveActions] : []);
  };

  // ── Score Change Handler in Officer Form ────────────────────────────────
  const handleScoreChange = (catKey, score) => {
    setAssessmentScores(prev => ({ ...prev, [catKey]: score }));
  };

  // ── Remark Change Handler ───────────────────────────────────────────────
  const handleRemarkChange = (catKey, text) => {
    setAssessmentRemarks(prev => ({ ...prev, [catKey]: text }));
  };

  // ── Image Upload Handler ────────────────────────────────────────────────
  const handleImageUpload = (catKey, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setAssessmentImages(prev => ({
        ...prev,
        [catKey]: {
          url: e.target.result,
          name: file.name,
          date: formatDate(new Date(), { month: "short", day: "numeric", year: "numeric" })
        }
      }));
    };
    reader.readAsDataURL(file);
  };

  // ── Add Corrective Action Item ──────────────────────────────────────────
  const addCorrectiveAction = () => {
    if (!newActionText.trim()) return;
    const newAction = {
      id: `CA-${Date.now().toString().slice(-4)}`,
      action: newActionText.trim(),
      priority: newActionPriority,
      dueDate: newActionDueDate,
      status: "Pending"
    };
    setCorrectiveActionItems(prev => [...prev, newAction]);
    setNewActionText("");
  };

  const removeCorrectiveAction = (actionId) => {
    setCorrectiveActionItems(prev => prev.filter(a => a.id !== actionId));
  };

  // ── Open Lightbox ──────────────────────────────────────────────────────
  const openLightbox = (img, galleryList = [], index = 0) => {
    setLightboxImage(img);
    setLightboxGallery(galleryList.length ? galleryList : [img]);
    setLightboxIndex(index);
    setZoomLevel(1);
  };

  const nextLightboxImage = () => {
    if (!lightboxGallery.length) return;
    const nextIdx = (lightboxIndex + 1) % lightboxGallery.length;
    setLightboxIndex(nextIdx);
    setLightboxImage(lightboxGallery[nextIdx]);
    setZoomLevel(1);
  };

  const prevLightboxImage = () => {
    if (!lightboxGallery.length) return;
    const prevIdx = (lightboxIndex - 1 + lightboxGallery.length) % lightboxGallery.length;
    setLightboxIndex(prevIdx);
    setLightboxImage(lightboxGallery[prevIdx]);
    setZoomLevel(1);
  };

  // ── Calculate Live Govt Score & Risk ───────────────────────────────────
  const currentGovScoreSum = useMemo(() => {
    return Object.values(assessmentScores).reduce((acc, val) => acc + (Number(val) || 0), 0);
  }, [assessmentScores]);

  const currentGovRisk = useMemo(() => {
    return calculateRisk(currentGovScoreSum, 50);
  }, [currentGovScoreSum]);

  // ── Submit Assessment Logic ─────────────────────────────────────────────
  const confirmAndSubmitAssessment = () => {
    if (!activeFarm) return;

    // Check scheduling duplication validation
    if (scheduleDate === activeFarm.lastAssessmentDate) {
      setScheduleError("Assessment already exists on this scheduled date. Please choose a different date.");
      return;
    }

    const todayStr = formatDate(new Date(), { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-");
    const formattedToday = formatDate(new Date(), { day: "2-digit", month: "short", year: "numeric" });

    // Build inspection images list from uploaded images
    const uploadedGovImgs = [];
    Object.keys(assessmentImages).forEach(catKey => {
      const img = assessmentImages[catKey];
      if (img) {
        uploadedGovImgs.push({
          id: `IMG-GOV-${Date.now()}-${catKey}`,
          category: BIOSECURITY_CATEGORIES.find(c => c.key === catKey)?.label || catKey,
          url: img.url,
          date: formattedToday,
          desc: assessmentRemarks[catKey] || "Government inspection evidence photo."
        });
      }
    });

    const newGovAssessment = {
      id: `GOV-ASS-${Math.floor(100 + Math.random() * 900)}`,
      date: formattedToday,
      assessedBy: user?.name || "Dr. S. Rathnayake",
      totalScore: currentGovScoreSum,
      maxScore: 50,
      percentage: currentGovRisk.pct,
      riskLevel: currentGovRisk.level.split(" ")[0],
      remarks: generalOfficerRemarks || "Official monthly government inspection completed.",
      scores: { ...assessmentScores },
      itemRemarks: { ...assessmentRemarks },
      inspectionImages: uploadedGovImgs
    };

    // New history record entry
    const newHistEntry = {
      id: `ASS-HIST-${Date.now().toString().slice(-4)}`,
      date: formattedToday,
      type: "Government",
      assessedBy: user?.name || "Dr. S. Rathnayake",
      score: `${currentGovScoreSum}/50`,
      risk: currentGovRisk.level.split(" ")[0],
      evidenceCount: uploadedGovImgs.length
    };

    // Calculate next assessment due date based on frequency
    let nextDueDate = scheduleDate;
    if (!nextDueDate) {
      const d = new Date();
      if (scheduleFrequency === "Twice per Month") {
        d.setDate(d.getDate() + 15);
      } else {
        d.setMonth(d.getMonth() + 1);
      }
      nextDueDate = formatDate(d, { year: "numeric", month: "2-digit", day: "2-digit" }).split("/").reverse().join("-");
    }

    // Update farm in list
    setFarmsList(prev => prev.map(f => {
      if (f.id === activeFarm.id) {
        return {
          ...f,
          currentRisk: currentGovRisk.level.split(" ")[0],
          govScore: currentGovScoreSum,
          lastAssessmentDate: formattedToday,
          nextAssessmentDue: nextDueDate,
          status: currentGovRisk.level.split(" ")[0] === "High" ? "Assessment Overdue" : "Healthy",
          assessmentFrequency: scheduleFrequency,
          latestGovAssessment: newGovAssessment,
          history: [newHistEntry, ...(f.history || [])],
          correctiveActions: [...correctiveActionItems]
        };
      }
      return f;
    }));

    setIsAssessing(false);
    setShowSubmitConfirm(false);

    // Toast Alert
    setToastMessage(`Government Assessment submitted successfully for ${activeFarm.name}. Verified Risk: ${currentGovRisk.level.toUpperCase()}`);
    setTimeout(() => setToastMessage(""), 5000);
  };

  // ═════════════════════════════════════════════════════════════════════════
  // RENDER VIEW SWITCHER
  // ═════════════════════════════════════════════════════════════════════════

  return (
    <div style={{ fontFamily: "Inter, sans-serif", color: P.grayDark, background: P.bgLight, minHeight: "100vh", padding: 20 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          background: P.navy, color: "#fff", padding: "14px 20px", borderRadius: 12,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)", display: "flex", alignItems: "center", gap: 12,
          border: `1.5px solid ${P.blue}`
        }}>
          <CheckCircle size={20} color={P.green} />
          <span style={{ fontSize: 13, fontWeight: 600 }}>{toastMessage}</span>
          <button onClick={() => setToastMessage("")} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer", marginLeft: 8 }}>
            <X size={16} />
          </button>
        </div>
      )}

      {/* Lightbox Image Preview Modal */}
      {lightboxImage && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
          background: "rgba(13, 26, 45, 0.95)", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)"
        }}>
          {/* Header controls */}
          <div style={{
            position: "absolute", top: 20, left: 24, right: 24, display: "flex",
            alignItems: "center", justifyContent: "space-between", color: "#fff"
          }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{lightboxImage.category}</p>
              <p style={{ fontSize: 12, color: P.grayLight, margin: "2px 0 0" }}>
                Upload Date: {lightboxImage.date} {lightboxImage.assessmentId ? `• Assessment: ${lightboxImage.assessmentId}` : ""}
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <button onClick={() => setZoomLevel(z => Math.min(z + 0.25, 2.5))} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: 8, borderRadius: 8, cursor: "pointer" }} title="Zoom In">
                <ZoomIn size={18} />
              </button>
              <button onClick={() => setZoomLevel(z => Math.max(z - 0.25, 0.75))} style={{ background: "rgba(255,255,255,0.15)", border: "none", color: "#fff", padding: 8, borderRadius: 8, cursor: "pointer" }} title="Zoom Out">
                <ZoomOut size={18} />
              </button>
              <a href={lightboxImage.url} download={`Evidence-${lightboxImage.category}.png`} target="_blank" rel="noreferrer" style={{ background: "rgba(255,255,255,0.15)", color: "#fff", padding: 8, borderRadius: 8, display: "inline-flex", textDecoration: "none" }} title="Download Image">
                <Download size={18} />
              </a>
              <button onClick={() => setLightboxImage(null)} style={{ background: P.red, border: "none", color: "#fff", padding: "8px 12px", borderRadius: 8, cursor: "pointer", fontWeight: 700 }} title="Close">
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Image Navigation */}
          {lightboxGallery.length > 1 && (
            <>
              <button onClick={prevLightboxImage} style={{ position: "absolute", left: 30, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: 12, borderRadius: "50%", cursor: "pointer" }}>
                <ChevronLeft size={24} />
              </button>
              <button onClick={nextLightboxImage} style={{ position: "absolute", right: 30, background: "rgba(255,255,255,0.2)", border: "none", color: "#fff", padding: 12, borderRadius: "50%", cursor: "pointer" }}>
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Main Displayed Image */}
          <div style={{ maxW: "85vw", maxHeight: "75vh", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <img
              src={lightboxImage.url}
              alt={lightboxImage.category}
              style={{
                maxWidth: "80vw", maxHeight: "70vh", objectFit: "contain", borderRadius: 8,
                transform: `scale(${zoomLevel})`, transition: "transform 0.2s ease"
              }}
            />
          </div>

          {/* Description */}
          {lightboxImage.desc && (
            <div style={{ marginTop: 20, background: "rgba(255,255,255,0.1)", padding: "10px 20px", borderRadius: 10, color: "#fff", fontSize: 13, maxWidth: 600, textAlign: "center" }}>
              {lightboxImage.desc}
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal Before Submission */}
      {showSubmitConfirm && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{ background: "#fff", borderRadius: 16, width: 480, maxWidth: "90%", padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: P.blueLight, color: P.blue, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Shield size={24} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.navy }}>Confirm Government Assessment</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: P.grayMid }}>Official Biosecurity Inspection Submission</p>
              </div>
            </div>

            <p style={{ fontSize: 13, color: P.grayDark, lineHeight: 1.5, marginBottom: 20, background: P.bgLight, padding: 14, borderRadius: 10, border: `1px solid ${P.border}` }}>
              Are you sure you want to submit this government assessment? After submission, the assessment will be added to the farm's official assessment history and become the official verified biosecurity risk level.
            </p>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
              <button onClick={() => setShowSubmitConfirm(false)} style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${P.border}`, background: "#fff", color: P.grayDark, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                Cancel
              </button>
              <button onClick={confirmAndSubmitAssessment} style={{ padding: "10px 22px", borderRadius: 10, border: "none", background: P.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Historical Record Details Modal */}
      {viewHistoryRecord && (
        <div style={{
          position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 10000,
          background: "rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
          backdropFilter: "blur(4px)"
        }}>
          <div style={{ background: "#fff", borderRadius: 16, width: 600, maxWidth: "95%", maxHeight: "90vh", overflowY: "auto", padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottom: `1px solid ${P.border}`, paddingBottom: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.navy }}>Assessment Details</h3>
                <p style={{ margin: "2px 0 0", fontSize: 12, color: P.grayMid }}>ID: {viewHistoryRecord.id} • Date: {viewHistoryRecord.date}</p>
              </div>
              <button onClick={() => setViewHistoryRecord(null)} style={{ background: "none", border: "none", cursor: "pointer" }}>
                <X size={20} color={P.grayMid} />
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
              <div style={{ background: P.bgLight, padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: P.grayMid, display: "block" }}>Type</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{viewHistoryRecord.type} Assessment</span>
              </div>
              <div style={{ background: P.bgLight, padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: P.grayMid, display: "block" }}>Assessed By</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{viewHistoryRecord.assessedBy}</span>
              </div>
              <div style={{ background: P.bgLight, padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: P.grayMid, display: "block" }}>Score Obtained</span>
                <span style={{ fontSize: 13, fontWeight: 700, color: P.blue }}>{viewHistoryRecord.score}</span>
              </div>
              <div style={{ background: P.bgLight, padding: 12, borderRadius: 10 }}>
                <span style={{ fontSize: 11, color: P.grayMid, display: "block" }}>Risk Status</span>
                <RiskBadge riskLevel={viewHistoryRecord.risk} />
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700, color: P.navy, marginBottom: 8 }}>Inspection Evidence Photos ({viewHistoryRecord.evidenceCount})</h4>
              <p style={{ fontSize: 12, color: P.grayMid }}>
                {viewHistoryRecord.evidenceCount > 0 ? "Attached verification evidence available in primary evidence section." : "No photo attachments linked to this historical record."}
              </p>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setViewHistoryRecord(null)} style={{ padding: "8px 18px", borderRadius: 8, background: P.navy, color: "#fff", fontSize: 12, fontWeight: 600, border: "none", cursor: "pointer" }}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          HEADER BAR
      ═════════════════════════════════════════════════════════════════════════ */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {selectedFarmId ? (
            <button
              onClick={() => { setSelectedFarmId(null); setIsAssessing(false); }}
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "8px 14px", background: "#fff", border: `1px solid ${P.border}`,
                borderRadius: 10, color: P.navy, fontSize: 13, fontWeight: 600, cursor: "pointer"
              }}
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          ) : (
            <div style={{ width: 40, height: 40, borderRadius: 12, background: P.navy, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Eye size={22} />
            </div>
          )}

          <div>
            <h1 style={{ fontSize: 20, fontWeight: 800, color: P.navy, margin: 0, fontFamily: "Poppins, sans-serif" }}>
              {selectedFarmId ? activeFarm?.name : "Government Officer — Farm Monitoring"}
            </h1>
            <p style={{ fontSize: 12, color: P.grayMid, margin: "2px 0 0" }}>
              {selectedFarmId
                ? `Farm ID: ${activeFarm?.id} • ${activeFarm?.village}, ${activeFarm?.district}`
                : "National Biosecurity Surveillance & Monthly Verification Dashboard"}
            </p>
          </div>
        </div>

        {selectedFarmId && !isAssessing && (
          <button
            onClick={() => startGovernmentAssessment(activeFarm)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 20px", background: P.blue, color: "#fff",
              border: "none", borderRadius: 12, fontSize: 13, fontWeight: 700,
              cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.25)"
            }}
          >
            <Shield size={16} /> Conduct Government Assessment
          </button>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          MODE 1: MAIN DASHBOARD VIEW (WHEN NO FARM IS SELECTED)
      ═════════════════════════════════════════════════════════════════════════ */}
      {!selectedFarmId && (
        <>
          {/* KPI Summary Row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 20 }}>
            <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 14, border: `1px solid ${P.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.grayMid }}>Total Monitored</span>
                <Eye size={18} color={P.blue} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: P.navy }}>{metrics.total}</div>
              <span style={{ fontSize: 11, color: P.grayLight }}>Registered Farms</span>
            </div>

            <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 14, border: `1px solid ${P.greenBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.green }}>Low Risk Farms</span>
                <CheckCircle size={18} color={P.green} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: P.green }}>{metrics.low}</div>
              <span style={{ fontSize: 11, color: P.grayLight }}>Compliant (80-100%)</span>
            </div>

            <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 14, border: `1px solid ${P.yellowBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.yellow }}>Moderate Risk</span>
                <AlertCircle size={18} color={P.yellow} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: P.yellow }}>{metrics.mod}</div>
              <span style={{ fontSize: 11, color: P.grayLight }}>Monitor Closely (60-79%)</span>
            </div>

            <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 14, border: `1px solid ${P.redBorder}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.red }}>High Risk Farms</span>
                <AlertTriangle size={18} color={P.red} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: P.red }}>{metrics.high}</div>
              <span style={{ fontSize: 11, color: P.grayLight }}>Immediate Action (&lt;60%)</span>
            </div>

            <div style={{ background: "#fff", padding: "16px 20px", borderRadius: 14, border: `1px solid ${P.orangeLight}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.orange }}>Overdue Inspection</span>
                <Clock size={18} color={P.orange} />
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: P.orange }}>{metrics.overdue}</div>
              <span style={{ fontSize: 11, color: P.grayLight }}>Requires Officer Visit</span>
            </div>
          </div>

          {/* Search and Filters Bar */}
          <div style={{ background: "#fff", padding: 16, borderRadius: 14, border: `1px solid ${P.border}`, marginBottom: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
              {/* Search Box */}
              <div style={{ flex: 1, minWidth: 240, display: "flex", alignItems: "center", gap: 8, padding: "8px 14px", background: P.bgLight, borderRadius: 10, border: `1px solid ${P.border}` }}>
                <Search size={16} color={P.grayMid} />
                <input
                  type="text"
                  placeholder="Search farm by Farm ID, Farmer Name, Village, District..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ border: "none", background: "transparent", outline: "none", width: "100%", fontSize: 13, color: P.navy }}
                />
              </div>

              {/* Risk Level Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.grayMid }}>Risk Level:</span>
                <select
                  value={riskFilter}
                  onChange={e => setRiskFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12, background: "#fff", color: P.navy, outline: "none" }}
                >
                  <option value="All">All Risks</option>
                  <option value="Low">Low Risk</option>
                  <option value="Moderate">Moderate Risk</option>
                  <option value="High">High Risk</option>
                </select>
              </div>

              {/* Assessment Status Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.grayMid }}>Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12, background: "#fff", color: P.navy, outline: "none" }}
                >
                  <option value="All">All Statuses</option>
                  <option value="Healthy">Healthy</option>
                  <option value="Assessment Due">Assessment Due</option>
                  <option value="Assessment Overdue">Assessment Overdue</option>
                  <option value="Assessment Scheduled">Assessment Scheduled</option>
                </select>
              </div>

              {/* District Filter */}
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: P.grayMid }}>District:</span>
                <select
                  value={districtFilter}
                  onChange={e => setDistrictFilter(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12, background: "#fff", color: P.navy, outline: "none" }}
                >
                  <option value="All">All Districts</option>
                  {districtsList.map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Farms Monitoring Table Card */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: P.navy }}>Monitored Farm Directory ({filteredFarms.length})</h3>
              <span style={{ fontSize: 12, color: P.grayMid }}>Showing active biosecurity status</span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: P.bgLight, borderBottom: `1px solid ${P.border}`, color: P.grayMid, fontSize: 11, textTransform: "uppercase" }}>
                    <th style={{ padding: "12px 16px" }}>Farm ID</th>
                    <th style={{ padding: "12px 16px" }}>Farm & Owner</th>
                    <th style={{ padding: "12px 16px" }}>Location</th>
                    <th style={{ padding: "12px 16px" }}>Animals & Type</th>
                    <th style={{ padding: "12px 16px" }}>Farmer Score</th>
                    <th style={{ padding: "12px 16px" }}>Gov Score</th>
                    <th style={{ padding: "12px 16px" }}>Current Risk</th>
                    <th style={{ padding: "12px 16px" }}>Last Assessed</th>
                    <th style={{ padding: "12px 16px" }}>Next Due</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredFarms.length === 0 ? (
                    <tr>
                      <td colSpan="11" style={{ padding: 30, textAlign: "center", color: P.grayMid }}>
                        No farms match your search/filter criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredFarms.map(f => (
                      <tr
                        key={f.id}
                        onClick={() => setSelectedFarmId(f.id)}
                        style={{ borderBottom: `1px solid ${P.border}`, cursor: "pointer", transition: "background 0.15s" }}
                        onMouseEnter={e => e.currentTarget.style.background = "#f1f5f9"}
                        onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                      >
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: P.blue, fontFamily: "monospace" }}>{f.id}</td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 700, color: P.navy }}>{f.name}</div>
                          <div style={{ fontSize: 11, color: P.grayMid }}>{f.owner}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ color: P.navy }}>{f.village}</div>
                          <div style={{ fontSize: 11, color: P.grayMid }}>{f.district}</div>
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <div style={{ fontWeight: 600, color: P.navy }}>{f.animals} animals</div>
                          <div style={{ fontSize: 11, color: P.grayMid }}>{f.livestockType}</div>
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 600 }}>
                          {f.farmerScore} / 50
                        </td>
                        <td style={{ padding: "14px 16px", fontWeight: 700, color: P.blue }}>
                          {f.govScore ? `${f.govScore} / 50` : "Pending"}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <RiskBadge riskLevel={f.currentRisk} />
                        </td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: P.grayMid }}>{f.lastAssessmentDate}</td>
                        <td style={{ padding: "14px 16px", fontSize: 12, color: f.status === "Assessment Overdue" ? P.red : P.navy, fontWeight: f.status === "Assessment Overdue" ? 700 : 500 }}>
                          {f.nextAssessmentDue}
                        </td>
                        <td style={{ padding: "14px 16px" }}>
                          <StatusBadge status={f.status} />
                        </td>
                        <td style={{ padding: "14px 16px", textAlign: "right" }}>
                          <button
                            onClick={e => { e.stopPropagation(); setSelectedFarmId(f.id); }}
                            style={{
                              padding: "6px 14px", background: P.blueLight, color: P.blue,
                              border: `1px solid ${P.blueBorder}`, borderRadius: 8, fontSize: 12,
                              fontWeight: 700, cursor: "pointer"
                            }}
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MODE 2: DETAILED FARM MONITORING VIEW
      ═════════════════════════════════════════════════════════════════════════ */}
      {selectedFarmId && activeFarm && !isAssessing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

          {/* Farm Information Banner */}
          <div style={{ background: "#fff", borderRadius: 16, border: `1px solid ${P.border}`, padding: 20 }}>
            <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: P.navy, margin: 0 }}>{activeFarm.name}</h2>
                  <RiskBadge riskLevel={activeFarm.currentRisk} />
                  <StatusBadge status={activeFarm.status} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 16, fontSize: 12, color: P.grayMid }}>
                  <span><User size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Owner: <strong>{activeFarm.owner}</strong> ({activeFarm.phone})</span>
                  <span><MapPin size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Location: <strong>{activeFarm.village}, {activeFarm.district}</strong></span>
                  <span><Layers size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> GPS: <strong>{activeFarm.gps}</strong></span>
                  <span><Award size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Animals: <strong>{activeFarm.animals} ({activeFarm.livestockType})</strong></span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={() => startGovernmentAssessment(activeFarm)}
                  style={{
                    padding: "10px 20px", background: P.blue, color: "#fff",
                    border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer",
                    display: "inline-flex", alignItems: "center", gap: 8
                  }}
                >
                  <Shield size={16} /> Conduct Government Assessment
                </button>
              </div>
            </div>
          </div>

          {/* Current Verified Risk Banner */}
          <div style={{
            background: activeFarm.currentRisk === "Low" ? P.greenLight : activeFarm.currentRisk === "Moderate" ? P.yellowLight : P.redLight,
            border: `1.5px solid ${activeFarm.currentRisk === "Low" ? P.greenBorder : activeFarm.currentRisk === "Moderate" ? P.yellowBorder : P.redBorder}`,
            borderRadius: 14, padding: "16px 20px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 16
          }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: P.grayMid, letterSpacing: 0.5 }}>Official Biosecurity Status</span>
              <h3 style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800, color: activeFarm.currentRisk === "Low" ? P.green : activeFarm.currentRisk === "Moderate" ? P.yellow : P.red }}>
                CURRENT VERIFIED RISK: {activeFarm.currentRisk.toUpperCase()}
              </h3>
              <p style={{ margin: "4px 0 0", fontSize: 12, color: P.grayDark }}>
                Verified Score: <strong>{activeFarm.govScore} / 50 ({Math.round((activeFarm.govScore / 50) * 100)}%)</strong> • Last Assessed by: <strong>{activeFarm.latestGovAssessment?.assessedBy || "Senior Vet Officer"}</strong> on {activeFarm.lastAssessmentDate}
              </p>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: 11, color: P.grayMid, display: "block" }}>Next Monthly Assessment</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: activeFarm.status === "Assessment Overdue" ? P.red : P.navy }}>
                Due Date: {activeFarm.nextAssessmentDue}
              </span>
              {activeFarm.status === "Assessment Overdue" && (
                <span style={{ display: "inline-block", background: P.red, color: "#fff", padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, marginLeft: 8 }}>
                  Assessment Overdue
                </span>
              )}
            </div>
          </div>

          {/* Detail View Navigation Tabs */}
          <div style={{ display: "flex", gap: 8, borderBottom: `2px solid ${P.border}`, paddingBottom: 4 }}>
            {[
              { id: "overview", label: "Farmer Assessment & Scores" },
              { id: "evidence", label: `Uploaded Evidence Images (${activeFarm.farmerImages?.length || 0})` },
              { id: "comparison", label: "Farmer vs Government Comparison" },
              { id: "history", label: `Assessment History (${activeFarm.history?.length || 0})` }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setDetailTab(tab.id)}
                style={{
                  padding: "10px 18px", border: "none", background: detailTab === tab.id ? P.navy : "transparent",
                  color: detailTab === tab.id ? "#fff" : P.grayMid, borderRadius: "8px 8px 0 0",
                  fontSize: 13, fontWeight: 700, cursor: "pointer", transition: "all 0.15s"
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* TAB 1: FARMER SUBMITTED ASSESSMENT OVERVIEW */}
          {detailTab === "overview" && (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.navy }}>Latest Farmer Assessment</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: P.grayMid }}>Submitted on {activeFarm.farmerAssessment?.date}</p>
                </div>
                <div style={{ background: P.bgLight, padding: "8px 16px", borderRadius: 10, border: `1px solid ${P.border}`, textAlign: "right" }}>
                  <span style={{ fontSize: 11, color: P.grayMid }}>Farmer Score: </span>
                  <span style={{ fontSize: 16, fontWeight: 800, color: P.blue }}>{activeFarm.farmerAssessment?.totalScore} / 50</span>
                  <span style={{ fontSize: 12, color: P.grayMid, marginLeft: 6 }}>({activeFarm.farmerAssessment?.percentage}%)</span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 12 }}>
                {BIOSECURITY_CATEGORIES.map(cat => {
                  const score = activeFarm.farmerAssessment?.answers?.[cat.key] || 0;
                  const pct = Math.round((score / cat.maxScore) * 100);
                  const catRisk = calculateRisk(score, cat.maxScore);

                  return (
                    <div key={cat.key} style={{ background: P.bgLight, padding: 14, borderRadius: 10, border: `1px solid ${P.border}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                      <div style={{ flex: 1, minWidth: 260 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{cat.label}</div>
                        <div style={{ fontSize: 11, color: P.grayMid, marginTop: 2 }}>{cat.question}</div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                        <div style={{ textAlign: "center" }}>
                          <span style={{ fontSize: 14, fontWeight: 800, color: P.navy }}>{score} / {cat.maxScore}</span>
                          <span style={{ fontSize: 10, color: P.grayMid, display: "block" }}>{pct}%</span>
                        </div>
                        <RiskBadge riskLevel={catRisk.level} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: EVIDENCE & IMAGES UPLOADED BY FARMER */}
          {detailTab === "evidence" && (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.navy }}>Farmer Assessment Verification Evidence</h3>
                  <p style={{ margin: "2px 0 0", fontSize: 12, color: P.grayMid }}>Photos uploaded by farmer during assessment submission for officer verification.</p>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: 16 }}>
                {activeFarm.farmerImages?.map((img, idx) => (
                  <div
                    key={img.id}
                    onClick={() => openLightbox(img, activeFarm.farmerImages, idx)}
                    style={{
                      background: P.bgLight, borderRadius: 12, border: `1px solid ${P.border}`, overflow: "hidden",
                      cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s"
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = "none"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    <div style={{ height: 160, background: "#e2e8f0", position: "relative" }}>
                      <img src={img.url} alt={img.category} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <div style={{ position: "absolute", top: 8, right: 8, background: "rgba(0,0,0,0.6)", color: "#fff", padding: "4px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700 }}>
                        <Maximize2 size={12} style={{ verticalAlign: "middle", marginRight: 4 }} /> View
                      </div>
                    </div>

                    <div style={{ padding: 12 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: P.blue, display: "block" }}>{img.category}</span>
                      <p style={{ fontSize: 12, color: P.navy, fontWeight: 600, margin: "4px 0 2px" }}>{img.desc || "Submitted Evidence Photo"}</p>
                      <span style={{ fontSize: 10, color: P.grayMid }}>Upload Date: {img.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FARMER VS GOVERNMENT COMPARISON */}
          {detailTab === "comparison" && (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.navy, marginBottom: 16 }}>Farmer Self-Assessment vs Government Inspection Comparison</h3>

              {/* Top Side-by-Side Cards */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>
                <div style={{ background: P.blueLight, border: `1.5px solid ${P.blueBorder}`, borderRadius: 12, padding: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.blue, textTransform: "uppercase" }}>Farmer Assessment</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: P.navy, marginTop: 4 }}>
                    {activeFarm.farmerScore} / 50 ({Math.round((activeFarm.farmerScore / 50) * 100)}%)
                  </div>
                  <RiskBadge riskLevel={activeFarm.farmerAssessment?.riskLevel} />
                </div>

                <div style={{ background: P.greenLight, border: `1.5px solid ${P.greenBorder}`, borderRadius: 12, padding: 16 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: P.green, textTransform: "uppercase" }}>Government Inspection</span>
                  <div style={{ fontSize: 24, fontWeight: 800, color: P.navy, marginTop: 4 }}>
                    {activeFarm.govScore} / 50 ({Math.round((activeFarm.govScore / 50) * 100)}%)
                  </div>
                  <RiskBadge riskLevel={activeFarm.latestGovAssessment?.riskLevel} />
                </div>
              </div>

              {/* Variance Alert */}
              {Math.abs(activeFarm.farmerScore - activeFarm.govScore) >= 5 && (
                <div style={{ background: P.yellowLight, border: `1px solid ${P.yellowBorder}`, padding: 14, borderRadius: 10, marginBottom: 20, display: "flex", alignItems: "center", gap: 10 }}>
                  <AlertTriangle size={20} color={P.yellow} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: P.yellow }}>
                    Significant assessment variation detected ({activeFarm.farmerScore - activeFarm.govScore > 0 ? `+${activeFarm.farmerScore - activeFarm.govScore}` : activeFarm.farmerScore - activeFarm.govScore} points variance). Review recommended.
                  </span>
                </div>
              )}

              {/* Detailed Category Comparison List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {BIOSECURITY_CATEGORIES.map(cat => {
                  const fScore = activeFarm.farmerAssessment?.answers?.[cat.key] || 0;
                  const gScore = activeFarm.latestGovAssessment?.scores?.[cat.key] || 0;
                  const diff = gScore - fScore;

                  return (
                    <div key={cat.key} style={{ background: P.bgLight, padding: 12, borderRadius: 10, border: `1px solid ${P.border}`, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{cat.label}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 20, fontSize: 12 }}>
                        <span>Farmer: <strong>{fScore} / 5</strong></span>
                        <span>Gov Officer: <strong>{gScore} / 5</strong></span>
                        <span style={{ fontWeight: 700, color: diff < 0 ? P.red : diff > 0 ? P.green : P.grayMid }}>
                          Diff: {diff > 0 ? `+${diff}` : diff}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: ASSESSMENT HISTORY */}
          {detailTab === "history" && (
            <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 20 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: P.navy, marginBottom: 16 }}>Chronological Assessment History</h3>

              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 13 }}>
                <thead>
                  <tr style={{ background: P.bgLight, borderBottom: `1px solid ${P.border}`, color: P.grayMid, fontSize: 11, textTransform: "uppercase" }}>
                    <th style={{ padding: "10px 14px" }}>Date</th>
                    <th style={{ padding: "10px 14px" }}>Type</th>
                    <th style={{ padding: "10px 14px" }}>Assessed By</th>
                    <th style={{ padding: "10px 14px" }}>Score</th>
                    <th style={{ padding: "10px 14px" }}>Risk</th>
                    <th style={{ padding: "10px 14px" }}>Evidence</th>
                    <th style={{ padding: "10px 14px", textAlign: "right" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {activeFarm.history?.map(hist => (
                    <tr key={hist.id} style={{ borderBottom: `1px solid ${P.border}` }}>
                      <td style={{ padding: "12px 14px", fontWeight: 600, color: P.navy }}>{hist.date}</td>
                      <td style={{ padding: "12px 14px" }}>
                        <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, background: hist.type === "Government" ? P.blueLight : P.bgLight, color: hist.type === "Government" ? P.blue : P.grayDark }}>
                          {hist.type}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", color: P.navy }}>{hist.assessedBy}</td>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: P.blue }}>{hist.score}</td>
                      <td style={{ padding: "12px 14px" }}><RiskBadge riskLevel={hist.risk} /></td>
                      <td style={{ padding: "12px 14px", color: P.grayMid }}>{hist.evidenceCount} Photos</td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <button onClick={() => setViewHistoryRecord(hist)} style={{ padding: "4px 10px", background: P.bgLight, border: `1px solid ${P.border}`, borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          MODE 3: CONDUCT GOVERNMENT OFFICER ASSESSMENT FORM
      ═════════════════════════════════════════════════════════════════════════ */}
      {selectedFarmId && activeFarm && isAssessing && (
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Header Action Bar */}
          <div style={{ background: P.navy, color: "#fff", borderRadius: 16, padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <span style={{ fontSize: 11, fontWeight: 700, color: P.blueBorder, textTransform: "uppercase" }}>Government Biosecurity Audit</span>
              <h2 style={{ margin: "2px 0 0", fontSize: 18, fontWeight: 800 }}>Conducting Assessment: {activeFarm.name}</h2>
              <p style={{ margin: "2px 0 0", fontSize: 12, color: P.grayLight }}>Farm ID: {activeFarm.id} • Assessor: {user?.name || "Dr. S. Rathnayake"}</p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 10, textAlign: "right" }}>
                <span style={{ fontSize: 11, color: P.grayLight, display: "block" }}>Calculated Govt Score</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: "#fff" }}>{currentGovScoreSum} / 50 ({currentGovRisk.pct}%)</span>
              </div>

              <RiskBadge riskLevel={currentGovRisk.level} />
            </div>
          </div>

          {/* Biosecurity Categories Rating Form */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 20 }}>
            <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 700, color: P.navy }}>Category Criteria Audit & Evidence</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {BIOSECURITY_CATEGORIES.map((cat, idx) => {
                const farmerVal = activeFarm.farmerAssessment?.answers?.[cat.key] || 0;
                const currentVal = assessmentScores[cat.key] || 0;
                const uploadedImg = assessmentImages[cat.key];

                return (
                  <div key={cat.key} style={{ background: P.bgLight, borderRadius: 12, border: `1px solid ${P.border}`, padding: 16 }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 700, color: P.navy }}>{idx + 1}. {cat.label}</span>
                        <p style={{ margin: "2px 0 0", fontSize: 12, color: P.grayMid }}>{cat.question}</p>
                        <span style={{ fontSize: 11, color: P.blue, fontWeight: 600, marginTop: 4, display: "inline-block" }}>
                          Reference Farmer Score: {farmerVal} / {cat.maxScore}
                        </span>
                      </div>

                      {/* Score Selector Buttons */}
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: P.grayMid, marginRight: 4 }}>Officer Score:</span>
                        {[0, 1, 2, 3, 4, 5].map(val => (
                          <button
                            key={val}
                            onClick={() => handleScoreChange(cat.key, val)}
                            style={{
                              width: 32, height: 32, borderRadius: 8, border: `1px solid ${currentVal === val ? P.blue : P.border}`,
                              background: currentVal === val ? P.blue : "#fff", color: currentVal === val ? "#fff" : P.navy,
                              fontWeight: 700, fontSize: 13, cursor: "pointer"
                            }}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Remarks Input and Image Upload Row */}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 240px", gap: 12, marginTop: 10 }}>
                      <input
                        type="text"
                        placeholder="Officer remarks / inspection findings for this item..."
                        value={assessmentRemarks[cat.key] || ""}
                        onChange={e => handleRemarkChange(cat.key, e.target.value)}
                        style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12, outline: "none" }}
                      />

                      <label style={{
                        display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                        padding: "8px 12px", background: "#fff", border: `1px stroke ${P.blueBorder}`,
                        borderRadius: 8, fontSize: 12, fontWeight: 600, color: P.blue, cursor: "pointer"
                      }}>
                        <Camera size={14} />
                        {uploadedImg ? "Change Photo" : "Upload Evidence"}
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={e => handleImageUpload(cat.key, e.target.files[0])}
                        />
                      </label>
                    </div>

                    {/* Uploaded Image Preview thumbnail */}
                    {uploadedImg && (
                      <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, background: "#fff", padding: 8, borderRadius: 8, width: "fit-content" }}>
                        <img src={uploadedImg.url} alt="Evidence" style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6 }} />
                        <span style={{ fontSize: 11, color: P.navy, fontWeight: 600 }}>{uploadedImg.name}</span>
                        <button onClick={() => setAssessmentImages(prev => ({ ...prev, [cat.key]: null }))} style={{ border: "none", background: "none", color: P.red, cursor: "pointer" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Monthly Assessment Scheduling Section */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 20 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 700, color: P.navy }}>Monthly Assessment Scheduling</h3>

            {scheduleError && (
              <div style={{ background: P.redLight, border: `1px solid ${P.redBorder}`, color: P.red, padding: 10, borderRadius: 8, fontSize: 12, marginBottom: 12, fontWeight: 600 }}>
                {scheduleError}
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.grayMid, marginBottom: 4 }}>Assessment Frequency</label>
                <div style={{ display: "flex", gap: 12, marginTop: 6 }}>
                  {["Once per Month", "Twice per Month"].map(freq => (
                    <label key={freq} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: P.navy, cursor: "pointer" }}>
                      <input
                        type="radio"
                        name="freq"
                        checked={scheduleFrequency === freq}
                        onChange={() => setScheduleFrequency(freq)}
                      />
                      {freq}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.grayMid, marginBottom: 4 }}>Next Assessment Date</label>
                <input
                  type="date"
                  value={scheduleDate}
                  onChange={e => { setScheduleDate(e.target.value); setScheduleError(""); }}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12 }}
                />
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.grayMid, marginBottom: 4 }}>Assessment Type</label>
                <select
                  value={scheduleType}
                  onChange={e => setScheduleType(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12 }}
                >
                  <option value="Routine Inspection">Routine Inspection</option>
                  <option value="Follow-up Inspection">Follow-up Inspection</option>
                  <option value="Risk-based Inspection">Risk-based Inspection</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.grayMid, marginBottom: 4 }}>Assigned Officer</label>
                <input
                  type="text"
                  value={scheduleOfficer}
                  onChange={e => setScheduleOfficer(e.target.value)}
                  style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12 }}
                />
              </div>
            </div>
          </div>

          {/* Officer Remarks & Corrective Actions Section */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 20 }}>
            <h3 style={{ margin: "0 0 12px", fontSize: 16, fontWeight: 700, color: P.navy }}>General Inspection Remarks & Required Corrective Actions</h3>

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.grayMid, marginBottom: 4 }}>Overall Government Officer Inspection Remarks</label>
              <textarea
                rows="3"
                placeholder="Enter detailed summary findings, observations, and instructions for the farmer..."
                value={generalOfficerRemarks}
                onChange={e => setGeneralOfficerRemarks(e.target.value)}
                style={{ width: "100%", padding: 12, borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 13, outline: "none" }}
              />
            </div>

            {/* Corrective Actions Multi-Selector */}
            <div>
              <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: P.grayMid, marginBottom: 8 }}>Select / Add Required Corrective Actions</label>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
                {[
                  "Improve farm access control", "Maintain proper footbath", "Improve cleaning and disinfection",
                  "Separate sick animals", "Improve quarantine facilities", "Improve feed storage",
                  "Improve waste disposal", "Update vaccination records"
                ].map(actionName => (
                  <button
                    key={actionName}
                    type="button"
                    onClick={() => {
                      if (!correctiveActionItems.some(a => a.action === actionName)) {
                        setCorrectiveActionItems(prev => [...prev, {
                          id: `CA-${Date.now().toString().slice(-4)}`,
                          action: actionName,
                          priority: "Medium",
                          dueDate: "2026-10-30",
                          status: "Pending"
                        }]);
                      }
                    }}
                    style={{
                      padding: "6px 12px", borderRadius: 20, border: `1px solid ${P.blueBorder}`,
                      background: P.blueLight, color: P.blue, fontSize: 11, fontWeight: 600, cursor: "pointer"
                    }}
                  >
                    + {actionName}
                  </button>
                ))}
              </div>

              {/* Add Custom Action Row */}
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <input
                  type="text"
                  placeholder="Custom corrective action..."
                  value={newActionText}
                  onChange={e => setNewActionText(e.target.value)}
                  style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12 }}
                />
                <select value={newActionPriority} onChange={e => setNewActionPriority(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12 }}>
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority</option>
                </select>
                <input type="date" value={newActionDueDate} onChange={e => setNewActionDueDate(e.target.value)} style={{ padding: "8px 12px", borderRadius: 8, border: `1px solid ${P.border}`, fontSize: 12 }} />
                <button onClick={addCorrectiveAction} style={{ padding: "8px 16px", background: P.navy, color: "#fff", border: "none", borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Add Action
                </button>
              </div>

              {/* Active Actions Table */}
              {correctiveActionItems.length > 0 && (
                <div style={{ background: P.bgLight, borderRadius: 10, border: `1px solid ${P.border}`, overflow: "hidden" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, textAlign: "left" }}>
                    <thead>
                      <tr style={{ borderBottom: `1px solid ${P.border}`, color: P.grayMid }}>
                        <th style={{ padding: 10 }}>Action Required</th>
                        <th style={{ padding: 10 }}>Priority</th>
                        <th style={{ padding: 10 }}>Due Date</th>
                        <th style={{ padding: 10 }}>Status</th>
                        <th style={{ padding: 10, textAlign: "right" }}>Remove</th>
                      </tr>
                    </thead>
                    <tbody>
                      {correctiveActionItems.map(item => (
                        <tr key={item.id} style={{ borderBottom: `1px solid ${P.border}` }}>
                          <td style={{ padding: 10, fontWeight: 600, color: P.navy }}>{item.action}</td>
                          <td style={{ padding: 10 }}>
                            <span style={{ padding: "2px 8px", borderRadius: 6, fontSize: 10, fontWeight: 700, background: item.priority === "High" ? P.redLight : P.yellowLight, color: item.priority === "High" ? P.red : P.yellow }}>
                              {item.priority}
                            </span>
                          </td>
                          <td style={{ padding: 10 }}>{item.dueDate}</td>
                          <td style={{ padding: 10 }}>
                            <select
                              value={item.status}
                              onChange={e => {
                                const newStatus = e.target.value;
                                setCorrectiveActionItems(prev => prev.map(a => a.id === item.id ? { ...a, status: newStatus } : a));
                              }}
                              style={{ padding: "4px 8px", borderRadius: 6, border: `1px solid ${P.border}`, fontSize: 11 }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="In Progress">In Progress</option>
                              <option value="Completed">Completed</option>
                            </select>
                          </td>
                          <td style={{ padding: 10, textAlign: "right" }}>
                            <button onClick={() => removeCorrectiveAction(item.id)} style={{ border: "none", background: "none", color: P.red, cursor: "pointer" }}>
                              <Trash2 size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Submission Bar */}
          <div style={{ background: "#fff", borderRadius: 14, border: `1px solid ${P.border}`, padding: 16, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => setIsAssessing(false)}
              style={{ padding: "10px 18px", borderRadius: 10, border: `1px solid ${P.border}`, background: "#fff", color: P.grayDark, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
            >
              Cancel / Save Draft
            </button>

            <button
              onClick={() => setShowSubmitConfirm(true)}
              style={{ padding: "10px 24px", borderRadius: 10, border: "none", background: P.blue, color: "#fff", fontSize: 13, fontWeight: 700, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 8 }}
            >
              <CheckCircle size={16} /> Submit Assessment
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
