# 🛡️ BioSecure Farm
## AI & GIS-Based Digital Farm Management Portal for Biosecurity in Pig and Poultry Farms

---

## 📋 Table of Contents
- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the App](#running-the-app)
- [Docker Deployment](#docker-deployment)
- [API Documentation](#api-documentation)
- [Test Accounts](#test-accounts)
- [AI Module](#ai-module)
- [GIS Module](#gis-module)
- [Power BI Integration](#power-bi-integration)

---

## 🌟 Overview

BioSecure Farm is a production-ready full-stack mobile and web application that helps farmers, veterinarians, and government officers manage biosecurity in pig and poultry farms using AI-powered disease prediction and GIS-based outbreak monitoring.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React Native (Expo) |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Authentication | JWT + bcrypt |
| Analytics | Power BI Embedded |
| GIS | React Native Maps + Google Maps API |
| Notifications | Firebase Cloud Messaging + Nodemailer |
| Deployment | Docker + Docker Compose |
| State Management | Context API |

---

## ✨ Features

### 👨🌾 Farmer
- Dashboard with biosecurity score, farm stats, disease alerts
- Add/manage farms with GIS location
- Livestock management with health tracking
- Vaccination scheduling and records
- AI biosecurity assessment (0–100 score)
- Disease risk prediction (Bird Flu, ASF, FMD)
- GIS farm mapping with outbreak detection

### 👨⚕️ Veterinarian
- Assigned farms overview
- Inspection reports management
- Disease diagnosis and treatment recommendations
- Outbreak reporting with government notification

### 🏛️ Government Officer
- District-level disease dashboard
- Outbreak monitoring and alerts
- Compliance monitoring for all farms
- GIS hotspot mapping and heatmaps
- Government alert broadcasting

### ⚙️ Admin
- User management (activate/deactivate)
- Farm management overview
- System logs monitoring
- Analytics dashboard

---

## 📁 Project Structure

```
BioSecureFarm/
├── frontend/
│   ├── src/
│   │   ├── screens/
│   │   │   ├── auth/         # Login, Register, OTP, ForgotPassword
│   │   │   ├── farmer/       # Dashboard, Farms, Livestock, Biosecurity, AI
│   │   │   ├── veterinarian/ # VetDashboard, Diagnosis, Outbreak
│   │   │   ├── government/   # GovDashboard, OutbreakMonitor, Compliance
│   │   │   ├── admin/        # AdminDashboard, ManageUsers, ManageFarms
│   │   │   └── shared/       # GISMap, Notifications, Analytics, Profile
│   │   ├── navigation/       # RootNavigator, role-based navigators
│   │   ├── components/       # UIComponents, DrawerContent
│   │   ├── context/          # AuthContext, ThemeContext
│   │   ├── services/         # API service (axios)
│   │   └── theme/            # Colors, Spacing, Typography
│   ├── App.js
│   └── Dockerfile
├── backend/
│   ├── controllers/          # authController, farmController, etc.
│   ├── routes/               # auth, farms, livestock, diseases, etc.
│   ├── models/               # User, Farm, Livestock, Disease, etc.
│   ├── middleware/           # auth.js, errorHandler.js
│   ├── services/             # emailService, notificationService
│   ├── config/               # firebase.js
│   ├── utils/                # logger.js
│   ├── server.js
│   └── Dockerfile
├── database/
│   └── seeder.js
├── docker-compose.yml
└── README.md
```

---

## 🚀 Installation

### Prerequisites
- Node.js >= 18
- npm >= 9
- MongoDB Atlas account
- Expo CLI: `npm install -g expo-cli`
- Docker (optional)

### Backend Setup

```bash
cd BioSecureFarm/backend
npm install
# Edit .env with your credentials
npm run dev
```

### Frontend Setup

```bash
cd BioSecureFarm/frontend
npm install
npx expo start
```

### Database Seeding

```bash
cd BioSecureFarm/backend
npm run seed
```

---

## ⚙️ Configuration

### Backend `.env`

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/biosecurefarm
JWT_SECRET=your_super_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@email.com
EMAIL_PASS=your_app_password
GOOGLE_MAPS_API_KEY=your_google_maps_key
FIREBASE_PROJECT_ID=your_firebase_project
FIREBASE_PRIVATE_KEY=your_firebase_key
FIREBASE_CLIENT_EMAIL=your_firebase_email
```

### Frontend `app.json`

Update `extra.apiUrl` and `extra.googleMapsApiKey` in `app.json`.

---

## ▶️ Running the App

```bash
# Backend
cd backend && npm run dev

# Frontend Android
cd frontend && npx expo start --android

# Frontend Web
cd frontend && npx expo start --web
```

---

## 🐳 Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Services:
- Frontend: http://localhost:80
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

---

## 📡 API Documentation

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/verify-otp` | Verify OTP |
| POST | `/api/auth/forgot-password` | Request password reset |
| POST | `/api/auth/reset-password` | Reset password |
| GET | `/api/auth/me` | Get current user |

### Farms
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/farms` | Get all farms |
| POST | `/api/farms` | Create farm |
| GET | `/api/farms/:id` | Get farm by ID |
| PUT | `/api/farms/:id` | Update farm |
| GET | `/api/farms/stats` | Farm statistics |

### Livestock
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/livestock` | Get all livestock |
| POST | `/api/livestock` | Add livestock |
| PUT | `/api/livestock/:id` | Update livestock |
| GET | `/api/livestock/stats` | Livestock statistics |

### Biosecurity & AI
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/biosecurity` | Submit assessment |
| GET | `/api/biosecurity` | Get assessments |
| POST | `/api/biosecurity/predict` | AI disease prediction |

### Analytics (Power BI)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/analytics/disease` | Disease statistics |
| GET | `/api/analytics/vaccination` | Vaccination statistics |
| GET | `/api/analytics/biosecurity` | Biosecurity scores |
| GET | `/api/analytics/dashboard` | Dashboard stats |
| GET | `/api/analytics/district` | District distribution |

### GIS
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/gis` | All GIS locations |
| GET | `/api/gis/nearby` | Nearby outbreaks |
| GET | `/api/gis/heatmap` | Heatmap data |
| GET | `/api/gis/buffer` | Buffer analysis |

---

## 🔑 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@biosecure.com | Password@123 |
| Veterinarian | vet@biosecure.com | Password@123 |
| Gov. Officer | gov@biosecure.com | Password@123 |
| Farmer | farmer@biosecure.com | Password@123 |

---

## 🤖 AI Module

### Biosecurity Score Algorithm
| Parameter | Max Score |
|-----------|-----------|
| Farm Hygiene | 20 |
| Water Quality | 15 |
| Feed Management | 15 |
| Visitor Control | 15 |
| Waste Disposal | 15 |
| Vaccination Compliance | 20 |
| **Total** | **100** |

Risk Levels: `0–50` = High Risk 🔴 | `51–80` = Moderate Risk 🟡 | `81–100` = Low Risk 🟢

### Disease Prediction (Random Forest / Decision Tree)
- **Bird Flu**: Symptoms + biosecurity score + season + nearby outbreaks
- **African Swine Fever**: Symptoms + vaccination rate + nearby outbreaks
- **Foot and Mouth Disease**: Symptoms + biosecurity + vaccination compliance

---

## 🗺️ GIS Module

- Farm Markers — color-coded by risk level
- Outbreak Markers — red markers with buffer circles
- Heatmaps — disease density visualization
- Buffer Analysis — farms/outbreaks within radius
- Nearby Outbreak Detection — MongoDB 2dsphere geospatial queries

---

## 📊 Power BI Integration

Configure in `AnalyticsScreen.js`:

```javascript
const POWER_BI_EMBED_URL =
  'https://app.powerbi.com/reportEmbed?reportId=<REPORT_ID>&autoAuth=true&ctid=<TENANT_ID>';
```

Data APIs:
- `GET /api/analytics/disease`
- `GET /api/analytics/vaccination`
- `GET /api/analytics/biosecurity`

---

## 🎨 UI/UX

- Primary: `#0D6EFD` | Secondary: `#28A745` | Background: `#F8F9FA`
- Glassmorphism cards, gradient headers
- Dark / Light mode toggle
- Animated splash screen (3s)
- Bottom + Drawer + Stack navigation

---

## 📄 License

MIT License — BioSecure Farm © 2024
