@echo off
echo ============================================
echo  BioSecure Farm - Full Stack Startup
echo ============================================
echo.

echo [1/3] Seeding MongoDB with synthetic data...
node data\seed.js
if %errorlevel% neq 0 (
  echo [ERROR] Seeding failed. Make sure MongoDB is running on localhost:27017
  echo         Start MongoDB: mongod --dbpath C:\data\db
  pause
  exit /b 1
)

echo.
echo [2/3] Starting API Server on port 5000...
start "BioSecure API Server" cmd /k "node server\index.js"

echo.
echo [3/3] Starting Vite Dev Server on port 5173...
start "BioSecure Vite" cmd /k "npx vite"

echo.
echo ============================================
echo  All services started!
echo  API Server : http://localhost:5000/api
echo  App        : http://localhost:5173
echo  MongoDB    : mongodb://localhost:27017/biosecure_db
echo ============================================
pause
