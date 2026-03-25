# API Documentation - Tutor AI

## Base URL
```
http://localhost:5000/api
```

## Authentication
Currently no authentication required. In production, add JWT tokens.

---

## Endpoints

### 1. User Management

#### Create User
```
POST /users
Content-Type: application/json

Request:
{
  "username": "john_doe",
  "email": "john@example.com",
  "learning_style": "interactive" // optional: interactive, visual, detailed
}

Response (201):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "created_at": "2024-03-25T10:30:00"
}

Error (400):
{
  "error": "Username and email required"
}
```

#### Get User Profile
```
GET /users/{user_id}

Response (200):
{
  "id": 1,
  "username": "john_doe",
  "email": "john@example.com",
  "learning_style": "interactive",
  "created_at": "2024-03-25T10:30:00"
}

Error (404):
{
  "error": "User not found"
}
```

---

### 2. Chat & Learning

#### Send Message to Tutor
```
POST /chat
Content-Type: application/json

Request:
{
  "user_id": 1,
  "topic": "Python Basics",
  "message": "What is a list comprehension?"
}

Response (200):
{
  "response": "A list comprehension is a concise way to create lists...",
  "topic": "Python Basics",
  "timestamp": "2024-03-25T10:35:00"
}

Error (400):
{
  "error": "user_id and message required"
}
```

#### Get Chat History
```
GET /chat-history/{user_id}?limit=20

Response (200):
{
  "chats": [
    {
      "id": 1,
      "topic": "Python Basics",
      "user_message": "What is a list?",
      "ai_response": "A list is a collection of items...",
      "timestamp": "2024-03-25T10:30:00"
    },
    ...
  ]
}

Query Parameters:
- limit: number of records (default: 20, max: 100)
```

---

### 3. Quiz Management

#### Generate Quiz
```
POST /quiz/generate
Content-Type: application/json

Request:
{
  "user_id": 1,
  "topic": "Python Functions",
  "num_questions": 5,
  "difficulty": "medium" // easy, medium, hard
}

Response (200):
{
  "questions": [
    {
      "id": 1,
      "question": "What is a function?",
      "question_type": "mcq", // mcq, true_false, short_answer
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "difficulty": "medium"
    },
    ...
  ]
}

Error (400):
{
  "error": "user_id required"
}
```

#### Submit Quiz Answers
```
POST /quiz/submit
Content-Type: application/json

Request:
{
  "user_id": 1,
  "answers": [
    {
      "question_id": 1,
      "answer": "A) A reusable block of code",
      "time_spent": 30
    },
    {
      "question_id": 2,
      "answer": "True",
      "time_spent": 15
    }
  ]
}

Response (200):
{
  "score": 4,
  "total": 5,
  "percentage": 80.0,
  "results": [
    {
      "question_id": 1,
      "is_correct": true,
      "correct_answer": "A) A reusable block of code",
      "explanation": "Functions allow you to write reusable code..."
    },
    ...
  ]
}

Error (400):
{
  "error": "user_id and answers required"
}
```

#### Get Quiz History
```
GET /quiz/history/{user_id}

Response (200):
{
  "attempts": [
    {
      "id": 1,
      "question": "What is a function?",
      "topic": "Python Functions",
      "user_answer": "A reusable block",
      "is_correct": true,
      "timestamp": "2024-03-25T10:40:00"
    },
    ...
  ]
}
```

---

### 4. Progress & Analytics

#### Get Overall Progress
```
GET /progress/{user_id}

Response (200):
{
  "total_chats": 15,
  "total_quizzes": 50,
  "correct_answers": 40,
  "accuracy": 80.0,
  "daily_streak": 7,
  "last_active": "2024-03-25T10:50:00",
  "total_learning_time": 240
}
```

#### Get Detailed Statistics
```
GET /progress/stats/{user_id}

Response (200):
{
  "topic_stats": {
    "Python Basics": {
      "total": 15,
      "correct": 12,
      "accuracy": 80.0
    },
    "Web Development": {
      "total": 10,
      "correct": 8,
      "accuracy": 80.0
    }
  }
}
```

---

### 5. Health Check

#### Check API Status
```
GET /health

Response (200):
{
  "status": "ok",
  "ollama_connected": true,
  "model": "mistral"
}

Response (200) - Ollama not available:
{
  "status": "ok",
  "ollama_connected": false,
  "model": "mistral"
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "error": "Description of what went wrong"
}
```

### 404 Not Found
```json
{
  "error": "Resource not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal server error"
}
```

---

## Question Types

### MCQ (Multiple Choice)
```json
{
  "question_type": "mcq",
  "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
  "correct_answer": "B) Option 2"
}
```

### True/False
```json
{
  "question_type": "true_false",
  "correct_answer": "True"
}
```

### Short Answer
```json
{
  "question_type": "short_answer",
  "correct_answer": "The answer to the question"
}
```

---

## Database Schema

### User Table
```sql
CREATE TABLE user (
  id INTEGER PRIMARY KEY,
  username VARCHAR(120) UNIQUE NOT NULL,
  email VARCHAR(120) UNIQUE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  learning_style VARCHAR(50)
);
```

### ChatHistory Table
```sql
CREATE TABLE chat_history (
  id INTEGER PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  topic VARCHAR(255),
  user_message TEXT,
  ai_response TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### QuizQuestion Table
```sql
CREATE TABLE quiz_question (
  id INTEGER PRIMARY KEY,
  topic VARCHAR(255),
  question TEXT,
  question_type VARCHAR(50),
  options TEXT (JSON),
  correct_answer TEXT,
  explanation TEXT,
  difficulty VARCHAR(20)
);
```

### QuizAttempt Table
```sql
CREATE TABLE quiz_attempt (
  id INTEGER PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  question_id INTEGER FOREIGN KEY,
  user_answer TEXT,
  is_correct BOOLEAN,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  time_spent INTEGER
);
```

### UserProgress Table
```sql
CREATE TABLE user_progress (
  id INTEGER PRIMARY KEY,
  user_id INTEGER FOREIGN KEY,
  total_chats INTEGER,
  total_quizzes INTEGER,
  correct_answers INTEGER,
  topics_learned TEXT (JSON),
  daily_streak INTEGER,
  last_active DATETIME,
  total_learning_time INTEGER
);
```

---

## Rate Limiting

Currently no rate limiting implemented. Add in production with Flask-Limiter:

```python
from flask_limiter import Limiter
limiter = Limiter(app, key_func=lambda: request.remote_addr)

@app.route('/api/chat', methods=['POST'])
@limiter.limit("60 per minute")
def chat():
    pass
```

---

## CORS Configuration

CORS is enabled for all origins in development. Update for production:

```python
CORS(app, resources={r"/api/*": {"origins": ["https://yourdomain.com"]}})
```

---

## Example Workflow

```
1. Create User
   POST /users
   → Get user_id

2. Send Chat Message
   POST /chat
   → Get AI response

3. Generate Quiz
   POST /quiz/generate
   → Get questions

4. Submit Quiz
   POST /quiz/submit
   → Get score and feedback

5. View Progress
   GET /progress/{user_id}
   → See analytics and stats
```

---

## Performance Tips

- Database queries are optimized with proper indexing
- Chat responses can take 5-30 seconds depending on model
- Quiz generation takes 1-2 minutes for 5 questions
- Use pagination for large datasets
- Cache frequently accessed data

---

## Future Enhancements

- [ ] JWT authentication
- [ ] Rate limiting
- [ ] Input validation & sanitization
- [ ] Request logging
- [ ] Batch operations
- [ ] WebSocket for real-time updates
- [ ] File uploads for code review
