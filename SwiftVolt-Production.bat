@echo off
echo ========================================================
echo       SWIFT VOLT ERP - PRODUCTION SERVER STARTUP
echo ========================================================
echo.
echo Starting Backend API...
cd backend
start cmd /k "npm start"
cd ..

echo Starting Frontend Next.js Server...
cd frontend
start cmd /k "npm start"
cd ..

echo.
echo ========================================================
echo All systems are booting up!
echo Backend is running on http://localhost:3001
echo Frontend is running on http://localhost:3000
echo You can now open http://localhost:3000 in your browser.
echo ========================================================
pause
