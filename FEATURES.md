# Tutor AI - Features & Functionality Overview

## Core Features

### 1. 🤖 AI Tutor (Chat Interface)
**What it does:**
- One-on-one conversations with AI tutor
- Select any programming topic
- Get detailed explanations with code examples
- Personalized based on learning style

**Key Components:**
- [ChatInterface.js](frontend/components/ChatInterface.js) - React component
- `/api/chat` - Backend endpoint
- `call_ollama()` - Ollama integration function

**Topics Supported:**
- Python (all levels)
- JavaScript & ES6+
- Web Development (HTML, CSS)
- Object-Oriented Programming
- Data Structures & Algorithms
- Database Design
- Custom topics

---

### 2. 📝 Quiz Generator
**What it does:**
- AI-generated quizzes on demand
- Three question types:
  - Multiple Choice (MCQ)
  - True/False
  - Short Answer
- Difficulty levels: Easy, Medium, Hard
- Auto-generated explanations

**Key Components:**
- [QuizInterface.js](frontend/components/QuizInterface.js) - React component
- `/api/quiz/generate` - Question generation
- `/api/quiz/submit` - Answer evaluation
- Question quality based on Ollama model

**Workflow:**
1. User selects topic, difficulty, and number of questions
2. Backend calls Ollama to generate appropriate questions
3. Questions stored in database
4. User answers questions
5. System evaluates answers (exact match for MCQ/True-False)
6. Provides score, feedback, and explanations

---

### 3. 📊 Progress Dashboard
**What it does:**
- Track learning metrics
- View accuracy by topic
- Monitor learning streaks
- See personalized insights

**Key Metrics:**
- Total chat sessions
- Questions answered
- Accuracy percentage
- Daily streak
- Learning time
- Topic-specific performance

**Key Components:**
- [ProgressDashboard.js](frontend/components/ProgressDashboard.js)
- `/api/progress/{user_id}` - Overall stats
- `/api/progress/stats/{user_id}` - Detailed breakdown

---

### 4. 👤 User Profile & Registration
**What it does:**
- Create user accounts
- Set learning preferences
- Personalize experience

**Learning Styles:**
- Interactive: Lots of questions and discussions
- Visual: Code examples and diagrams
- Detailed: In-depth explanations

**Key Components:**
- [UserProfile.js](frontend/components/UserProfile.js)
- `/api/users` - User creation

---

## Database Schema

### User Storage
```
Users Table:
├── ID (Primary Key)
├── Username (Unique)
├── Email (Unique)
├── Learning Style
├── Created At
└── [Relationships]
    ├── Chat Histories
    ├── Quiz Attempts
    └── Progress Record
```

### Learning Data
```
Chat History:
├── User ID
├── Topic
├── User Message
├── AI Response
└── Timestamp

Quiz Questions:
├── ID
├── Topic
├── Question Text
├── Type (MCQ/Boolean/Short)
├── Options (JSON)
├── Correct Answer
├── Explanation
└── Difficulty

Quiz Attempts:
├── User ID
├── Question ID
├── User Answer
├── Is Correct
├── Time Spent
└── Timestamp

User Progress:
├── User ID
├── Total Chats
├── Total Quizzes
├── Correct Answers
├── Topics Learned
├── Daily Streak
├── Last Active
└── Total Learning Time
```

---

## API Endpoints Reference

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/users` | Create new user |
| GET | `/api/users/<id>` | Get user profile |
| POST | `/api/chat` | Send chat message |
| GET | `/api/chat-history/<uid>` | Get chat history |
| POST | `/api/quiz/generate` | Generate quiz |
| POST | `/api/quiz/submit` | Submit quiz answers |
| GET | `/api/quiz/history/<uid>` | Get quiz history |
| GET | `/api/progress/<uid>` | Get overall progress |
| GET | `/api/progress/stats/<uid>` | Get detailed stats |
| GET | `/api/health` | Check API status |

See [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for details.

---

## Technology Stack Details

### Frontend (React)
- **Framework**: React 18
- **Styling**: CSS3 with gradients & animations
- **HTTP Client**: Fetch API (browser native)
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: Component-based (manual routing)

### Backend (Python)
- **Framework**: Flask 2.3
- **Database**: SQLAlchemy ORM with SQLite
- **CORS**: Flask-CORS enabled
- **LLM Integration**: Ollama API via requests
- **Server**: Gunicorn (production)

### AI Integration
- **Model Provider**: Ollama (local inference)
- **API**: REST API `/api/generate`
- **Models**: Mistral (default), LLaMA-2, etc.
- **Customization**: System prompts for tutoring context

---

## Key Features Implementation

### Smart Tutoring
```python
# System prompt adapts to learning style
system_prompt = f"""You are an expert programming tutor...
Your learning style should be {user.learning_style}:
- interactive: Engage with questions
- visual: Provide code examples
- detailed: Provide thorough explanations
"""
```

### Quiz Generation
```python
# AI generates questions dynamically
prompt = f"""Generate a {difficulty} level quiz about {topic}
Rotate between MCQ, True/False, Short Answer
Return as JSON with structured format
"""
```

### Progress Tracking
```python
# Automatic progress updates
- Chat count increments
- Quiz attempts recorded
- Accuracy calculated in real-time
- Topics tracked across all interactions
```

---

## Performance Characteristics

| Feature | Time | Notes |
|---------|------|-------|
| Chat Response | 5-30s | Depends on model and query |
| Quiz Generation | 1-2 min | 5 questions |
| Page Load | < 1s | React frontend |
| API Response | < 100ms | Database queries |
| Progress Load | < 500ms | Aggregated stats |

---

## Future Enhancement Ideas

### Phase 2
- [ ] Voice input/output (Web Speech API)
- [ ] Code execution sandbox
- [ ] Spaced repetition scheduling
- [ ] Collaborative learning
- [ ] Leaderboards

### Phase 3
- [ ] Mobile app (React Native)
- [ ] Advanced NLP for answer evaluation
- [ ] Video tutorial recommendations
- [ ] Custom curriculum builder
- [ ] Export certificates

### Phase 4
- [ ] Multi-language AI support
- [ ] Advanced adaptivity (ML-based)
- [ ] Integration with LeetCode/HackerRank
- [ ] IDE plugin
- [ ] Team/classroom mode

---

## Security Considerations

**Current (Development):**
- No authentication
- CORS enabled for all origins
- SQLite database (local storage)

**For Production:**
- [ ] Add JWT authentication
- [ ] HTTPS/SSL
- [ ] Input validation & sanitization
- [ ] SQL injection prevention (using ORM)
- [ ] Rate limiting
- [ ] CORS restriction
- [ ] Secure session management
- [ ] Data encryption

---

## Scalability Notes

**Database:**
- SQLite works for single-user
- PostgreSQL recommended for 10+ concurrent users
- Add connection pooling for production

**Backend:**
- Gunicorn with multiple workers
- Load balancer for horizontal scaling
- Cache frequently accessed data

**Frontend:**
- React build optimization
- CDN for static assets
- Service worker for offline support

**Ollama:**
- GPU acceleration for faster responses
- Model quantization for efficiency
- Multi-GPU setup for concurrent requests

---

## Troubleshooting Guide

### Common Issues

**"Cannot connect to Ollama"**
- Check: `curl http://localhost:11434/api/tags`
- Solution: Start Ollama with `ollama serve`

**"Quiz generation stuck"**
- Check amount of available RAM
- Try smaller model (mistral instead of llama2-13B)
- Increase timeout in frontend

**"Database locked"**
- Delete `tutor_ai.db`
- Restart backend (auto-recreates)

**"Slow responses"**
- Check CPU/GPU usage
- Reduce model size
- Enable GPU acceleration

See [README.md](README.md) for full troubleshooting.

---

**Last Updated**: March 25, 2024
**Version**: 1.0.0
