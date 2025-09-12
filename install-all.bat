@echo off
echo Installing frontend dependencies...
cd frontend
npm install
cd ..

echo Installing backend dependencies...
cd backend
npm install
cd ..

echo All dependencies installed!
echo.
echo To start the application:
echo 1. Run start-frontend.bat (will open on http://localhost:4200)
echo 2. Run start-backend.bat (will start API on http://localhost:3000)
