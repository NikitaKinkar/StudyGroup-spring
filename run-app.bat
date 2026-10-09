@echo off
title Study Group Finder Launcher
echo ========================================================
echo   Starting Study Group Finder: Backend and Frontend
echo ========================================================
echo.

:: 1. Launch Spring Boot Backend in a new CMD window
echo [1/2] Launching Backend on http://localhost:8080 ...
start "Backend (Spring Boot - Port 8080)" cmd /k "cd /d "%~dp0study-group-finder-backend" && java -jar target\study-group-finder-backend-1.0.0.jar"

:: 2. Launch Vite React Frontend in a new CMD window
echo [2/2] Launching Frontend on http://localhost:5173 ...
start "Frontend (React Vite - Port 5173)" cmd /k "cd /d "%~dp0study-group-finder" && npm.cmd run dev"

echo.
echo ========================================================
echo   Both services are starting!
echo   - Backend:  http://localhost:8080
echo   - Frontend: http://localhost:5173
echo ========================================================
pause
