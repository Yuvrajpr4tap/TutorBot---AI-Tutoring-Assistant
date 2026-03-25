# Configuration Guide

## 1. Backend Configuration (backend/.env)

```
# Ollama Settings
OLLAMA_API_URL=http://localhost:11434  # Ollama server URL
OLLAMA_MODEL=mistral                    # AI model to use

# Flask Settings
FLASK_ENV=development                   # development or production
```

## 2. Supported Models

### Fast & Lightweight
- **mistral** (7B) - Default, balanced
- **phi** (3.8B) - Very fast
- **neural-chat** (7B) - Good for chat

### Balanced
- **llama2** (7B/13B/70B) - Very capable
- **dolphin-mixtral** (8x7B) - High quality

### High Quality (Slower)
- **openchat** (8B) - Instruction-tuned
- **stable-code** (Code-specific)

**To use a different model:**

```bash
# Download model
ollama pull llama2

# Update backend/.env
OLLAMA_MODEL=llama2

# Restart backend
```

## 3. Learning Styles

Choose one during registration:

- **interactive**: Lots of questions and discussions
- **visual**: Code examples and diagrams
- **detailed**: In-depth explanations

## 4. Quiz Difficulty Levels

- **easy**: Basic concepts, straightforward questions
- **medium**: Intermediate concepts, practical scenarios
- **hard**: Advanced topics, complex problems

## 5. Database Configuration

Default: SQLite (tutor_ai.db)

To use PostgreSQL (production):

```python
# Update backend/app.py
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://user:password@localhost/tutor_ai'

# Install psycopg2
pip install psycopg2
```

## 6. API Configuration

### Enable Authentication (production)

Install:
```bash
pip install PyJWT
```

Update app.py:
```python
from flask_jwt_extended import JWTManager

app.config['JWT_SECRET_KEY'] = 'your-secret-key'
jwt = JWTManager(app)

@app.route('/api/chat', methods=['POST'])
@jwt_required()
def chat():
    current_user = get_jwt_identity()
    # ... rest of code
```

### Enable CORS for Production

```python
CORS(app, resources={
    r"/api/*": {
        "origins": ["https://yourdomain.com"],
        "methods": ["GET", "POST"],
        "allow_headers": ["Content-Type"]
    }
})
```

## 7. Performance Tuning

### For Faster Responses
- Use smaller models (mistral, phi)
- Increase Ollama context size:
  ```bash
  OLLAMA_NUM_THREAD=8 ollama serve
  ```
- Add GPU support:
  ```bash
  # NVIDIA
  CUDA_VISIBLE_DEVICES=0 ollama serve
  
  # AMD
  HSA_OVERRIDE_GFX_VERSION=gfx1030 ollama serve
  ```

### For Better Quality
- Use larger models (llama2-13B, mixtral)
- Increase temperature (0.7 default, 1.0 = more creative)
- Use longer context

## 8. Logging Configuration

Add to backend/app.py:

```python
import logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('tutor_ai.log'),
        logging.StreamHandler()
    ]
)
```

## 9. Environment Variables

### Development
```
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral
FLASK_ENV=development
DEBUG=True
```

### Testing
```
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral
FLASK_ENV=testing
SQLALCHEMY_DATABASE_URI=sqlite:///test.db
```

### Production
```
OLLAMA_API_URL=http://ollama-server:11434
OLLAMA_MODEL=llama2
FLASK_ENV=production
DEBUG=False
SQLALCHEMY_DATABASE_URI=postgresql://...
JWT_SECRET_KEY=your-secret-key
```

## 10. Firewall & Security

### Open Ports
- 3000: Frontend (React dev server)
- 5000: Backend API
- 11434: Ollama server (local only)

### Security Headers (Production)

```python
@app.after_request
def set_security_headers(response):
    response.headers['X-Content-Type-Options'] = 'nosniff'
    response.headers['X-Frame-Options'] = 'DENY'
    response.headers['X-XSS-Protection'] = '1; mode=block'
    return response
```

## 11. Backup & Restore

### Backup User Data
```bash
# Backup database
cp backend/tutor_ai.db backups/tutor_ai_$(date +%Y%m%d).db

# Backup with tar
tar -czf tutor_ai_backup_$(date +%Y%m%d).tar.gz \
    backend/tutor_ai.db \
    backend/.env
```

### Restore Database
```bash
cp backups/tutor_ai_YYYYMMDD.db backend/tutor_ai.db
python backend/app.py  # Restart to verify
```

---

For more details, see README.md and API_DOCUMENTATION.md
