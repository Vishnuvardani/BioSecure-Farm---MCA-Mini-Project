# BioSecure Farm

BioSecure Farm is a pig and poultry farm intelligence platform for animal health, biosecurity, disease alerts, farm locations, veterinary services, and compliance.

## Run locally

Requirements: Node.js 20 or newer. Docker Desktop is used to start MongoDB when no local MongoDB service is already running.

After cloning or pulling the repository, install dependencies once:

```powershell
npm ci
```

Then start the local stack:

```powershell
npm start
```

On Windows, `start.bat` runs the same command. The launcher starts MongoDB through Docker Compose only when port 27017 is not already in use, then starts the Express API and Vite. It does not seed, reset, or overwrite database data.

Open the app at http://localhost:5173/. The API health check is http://localhost:5000/api/health. Press Ctrl+C in the startup terminal to stop the API and Vite processes it started. The MongoDB Docker container and its data volume remain available for the next run.

To open the app from another device on the same Wi-Fi, use the host computer's LAN IP, for example `http://192.168.1.20:5173/`. Allow inbound TCP ports 5173 and 5000 through the host computer's private-network firewall. The frontend automatically uses that same LAN hostname for the API.

GitHub push/pull only synchronizes source files; it does not run the app. After pulling, run `npm start` (after the one-time `npm ci`) on the computer that should host the local app. No cloud deployment or GitHub Actions are configured.

## Local configuration

Copy `.env.example` to `.env.local` and add your OpenWeather API key. Leave `VITE_API_BASE_URL` unset for same-host and LAN access. The API accepts `MONGO_URI`, `DB_NAME`, and `PORT`; defaults are `mongodb://127.0.0.1:27017`, `biosecure_db`, and `5000`.

## Build

```powershell
npm run build
```
