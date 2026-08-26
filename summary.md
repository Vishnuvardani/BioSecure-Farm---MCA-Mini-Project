# BioSecure Farm - Work Summary

Date: 2026-08-26

## Authentication

- Added email/password registration and login using MongoDB.
- Added bcrypt password hashing with `bcryptjs`.
- Added Google Sign-In integration through Firebase.
- Removed OTP login from the active web login screen.
- Added validation for required registration fields and password length.
- Added a registration success notification that disappears after 5 seconds.
- Added Admin as a registration role.

## MongoDB Persistence

- Registration stores user details in the `users` collection.
- Farmer registration creates a linked farm in the `farms` collection.
- Farm records are linked through `ownerId`.
- Google-created farmer accounts can add farm details from the Profile page.
- Profile saves update the `users` document.
- Farmer profile saves create or update the linked `farms` document.
- Stored farm fields include farm name, type, registration number, district, state, village/address, animal count, latitude, and longitude.
- Added `PUT /api/users/:id` for profile updates.

## Profiles and User Data

- Added live signed-in user details to the dashboard sidebar and profile page.
- Added editable name, phone, role details, and location fields.
- Added role-specific profile fields for Farmer, Veterinarian, Government Officer, and Admin.
- Preserved existing profile features including Member ID, Member since, Security, Notification Settings, and Save Changes.
- Removed the extra "Signed in as" banner from the top of dashboard pages.
- Preserved existing dashboard navigation and module features.

## Location

- Added latitude and longitude fields that support keyboard input.
- Added a map-pin button to detect the current location.
- Location detection uses the browser Geolocation API with `enableHighAccuracy: true`.
- The browser may combine GPS, Wi-Fi, cellular, and network positioning.
- Browser location permission is required.

## Farmer Dashboard

Removed from the Farmer dashboard:

- Small map
- Vaccination coverage panel
- AI recommendation panel

Farmer dashboard headline values now use available MongoDB data for animal totals, alerts, vaccination records, farms, and biosecurity score.

## Branding

- Added PNG logo asset at `public/picsvg_download.png`.
- Added the PNG as the browser favicon and Apple touch icon.
- Added the PNG to splash, login, registration, and dashboard branding.
- The logo is a 512 x 512 PNG and can be replaced with another image using the same filename.

## Veterinarian Booking and Farm Assignment

- Added `Find Veterinarian` to the Farmer Dashboard.
- Farmers can select one of their farms, view suitable available veterinarians, choose a date, time, visit type, and consultation reason, then send a booking request.
- Added `Appointment Requests` to the Veterinarian Dashboard.
- Veterinarians can accept or reject pending requests.
- Accepting a request confirms the appointment and writes `assignedVeterinarianId`, `assignedVeterinarianName`, and `assignedAt` to the farm record.
- Confirmed farms appear in the accepting veterinarian's `Assigned Farms` map and list.
- Added farmer and veterinarian appointment notifications for new requests and accepted or rejected outcomes.
- Added live appointment API routes: `GET /api/veterinarians/available`, `POST /api/appointments`, `GET /api/appointments`, and `PUT /api/appointments/:id/status`.
- Appointment records are stored in the MongoDB `appointments` collection.

## Assigned Farms and Outbreak Map

- Replaced the static veterinarian Assigned Farms page with a live, veterinarian-scoped view.
- The map shows only the current doctor's assigned farms, with disease outbreak markers for context.
- The assigned-farms list supports search and shows each farm's risk level.
- The Visit action focuses the selected farm and opens its GPS coordinates in Google Maps.
- Inspection submissions now save the signed-in veterinarian ID instead of a placeholder, preserving the doctor-to-farm relationship.
- The Assigned Farms module refreshes farm data when opened so newly accepted appointments appear without a new login.

## Nearby Veterinarian Matching

- Available veterinarians are filtered by animal type/specialization and availability/workload.
- Results are ranked by proximity: same district first, then same state, then other available service areas.
- Legacy profiles without specialization or service-area data remain usable and are ranked after local options.
- Normalized veterinarian specialization data so both text and list formats render safely on the Find Veterinarian page.

## Documentation and Setup

- Expanded `README.md` with frontend and backend startup instructions.
- Documented MongoDB prerequisites and service URLs.
- Documented Firebase `.env.local` configuration for Google Sign-In.
- `.env.local` is ignored by Git.

## Verification

- Frontend production build passed with Vite.
- Source diagnostics passed for the modified frontend and backend files.
- Backend health endpoint returned HTTP 200 and confirmed MongoDB connection.
- Tested registration, valid login, invalid password rejection, and cleanup.
- Tested Google-style account creation, first profile save, farm creation, and later farm edits.
- Tested synchronization of farm name, district, animal count, and coordinates.
- Parsed the updated Express server and veterinary JSX modules successfully.
- Verified the live nearby-veterinarian API returns ranked available veterinarians from MongoDB.
- Restarted the local API server after the veterinary appointment and matching updates.

## Run Commands

Backend:

```powershell
node server\index.js
```

Frontend:

```powershell
node node_modules\vite\bin\vite.js --host 127.0.0.1 --port 5173
```

Frontend URL: `http://127.0.0.1:5173/`

Backend URL: `http://localhost:5000/api`

MongoDB: `mongodb://127.0.0.1:27017/biosecure_db`

## External Requirements

- MongoDB must be running on port 27017.
- Browser location permission is needed to detect live coordinates.
- Firebase project configuration and Google Authentication must be enabled for Google Sign-In.
- Firebase values belong in the root `.env.local` file and must not be committed.

