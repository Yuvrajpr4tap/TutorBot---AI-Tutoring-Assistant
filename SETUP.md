# Quick Start Guide

## Prerequisites
- Ollama running locally
- Python 3.8+
- Node.js 14+
- npm

## 5-Minute Setup

### Terminal 1: Start Ollama
```bash
ollama serve
```

### Terminal 2: Backend Setup
```bash
cd d:\DA project\backend

# Windows
python -m venv venv
venv\Scripts\activate

# Mac/Linux
python3 -m venv venv
source venv/bin/activate

# Install & Run
pip install -r requirements.txt
python app.py
```

Backend runs at: `http://localhost:5000`

### Terminal 3: Frontend Setup
```bash
cd d:\DA project\frontend

npm install
npm start
```

Frontend opens at: `http://localhost:3000`

---

## Verify Setup

### Check Backend API
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "ok",
  "ollama_connected": true,
  "model": "mistral"
}
```

### Check Ollama
```bash
curl http://localhost:11434/api/tags
```

---

## First Steps

1. **Register** - Create account in UI
2. **Chat** - Ask about "Python Basics"
3. **Quiz** - Take a 5-question quiz
4. **Dashboard** - View your progress

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Ollama not connected" | Run `ollama serve` in separate terminal |
| "Module not found" | Run `pip install -r requirements.txt` |
| "Port 5000 in use" | Change Flask port in `app.py` |
| "Port 3000 in use" | React will auto-detect next available port |
| Database errors | Delete `backend/tutor_ai.db` and restart |

---

## Optional: Change Ollama Model

Edit `backend/.env`:
```
OLLAMA_MODEL=llama2
```

Pull the model:
```bash
ollama pull llama2
```

Restart backend.

---

## Production Deployment

### Backend (Flask)
```bash
pip install gunicorn
gunicorn -w 4 -b 0.0.0.0:5000 app:app
```

### Frontend (React)
```bash
npm run build
# Deploy the 'build' folder to web server
```

### Ollama
Run with GPU support:
```bash
CUDA_VISIBLE_DEVICES=0 ollama serve
```

---

For full documentation, see [README.md](README.md)
