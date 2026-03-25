#!/bin/bash
# Tutor AI - Unix/Mac Startup Script

echo "========================================"
echo "  Tutor AI - Startup Script"
echo "========================================"
echo ""

# Check if Ollama is running
echo "Checking Ollama connection..."
if ! curl -s http://localhost:11434/api/tags > /dev/null 2>&1; then
    echo ""
    echo "ERROR: Ollama is not running!"
    echo "Please start Ollama first:"
    echo ""
    echo "  ollama serve"
    echo ""
    exit 1
fi

echo "✓ Ollama is running"

# Start Backend
echo ""
echo "Starting Backend (Flask)..."
cd "$(dirname "$0")/backend"
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -q -r requirements.txt > /dev/null 2>&1
python app.py &
echo "✓ Backend started (http://localhost:5000)"

# Start Frontend
echo ""
echo "Starting Frontend (React)..."
cd "$(dirname "$0")/frontend"
if [ ! -d "node_modules" ]; then
    echo "Installing npm packages..."
    npm install > /dev/null 2>&1
fi
npm start &
echo "✓ Frontend will open at http://localhost:3000"

echo ""
echo "========================================"
echo "All services started!"
echo ""
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:5000"
echo "Ollama:   http://localhost:11434"
echo ""
echo "Press Ctrl+C to stop all services"
echo "========================================"

wait
