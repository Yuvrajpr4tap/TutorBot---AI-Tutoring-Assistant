@echo off
REM Tutor AI - Windows Startup Script

echo ========================================
echo   Tutor AI - Startup Script
echo ========================================
echo.

REM Check if Ollama is already running
echo Checking Ollama connection...
curl -s http://localhost:11434/api/tags >nul 2>&1
if errorlevel 1 (
    echo.
    echo ERROR: Ollama is not running!
    echo Please start Ollama first:
    echo.
    echo   ollama serve
    echo.
    pause
    exit /b 1
)

echo ✓ Ollama is running

REM Start Backend
echo.
echo Starting Backend (Flask)...
cd /d "%~dp0backend"
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)
call venv\Scripts\activate.bat
pip install -q -r requirements.txt >nul 2>&1
start "Tutor AI Backend" cmd /k "python app.py"
echo ✓ Backend started (http://localhost:5000)

REM Start Frontend
echo.
echo Starting Frontend (React)...
cd /d "%~dp0frontend"
if not exist "node_modules" (
    echo Installing npm packages...
    npm install >nul 2>&1
)
start "Tutor AI Frontend" cmd /k "npm start"
echo ✓ Frontend will open at http://localhost:3000

echo.
echo ========================================
echo All services started!
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:5000
echo Ollama:   http://localhost:11434
echo.
echo Close these windows to stop the services
echo ========================================

pause
