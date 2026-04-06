# Tutor AI - Your Personal Programming Mentor

A personalized AI-powered tutoring application that uses your local **Ollama** engine to teach programming, generate quizzes, and track your learning progress.

## Features

✨ **Key Features:**
- 🤖 **AI Chat Tutor** - Interactive conversations with an intelligent tutor powered by local Ollama
- 📝 **Quiz Generation** - AI-generated quizzes with multiple question types (MCQ, True/False, Short Answer)
- 📊 **Progress Dashboard** - Track your learning metrics, accuracy, and performance by topic
- 💬 **Personalized Learning** - Adapts to your learning style (interactive, visual, detailed)
- 🔒 **Privacy First** - All data stays local on your machine

## Tech Stack

- **Frontend**: React 18 + CSS3
- **Backend**: Python Flask
- **Database**: SQLite
- **LLM**: Local Ollama Engine
- **API Communication**: REST API with CORS

## Prerequisites

Before you start, ensure you have:

1. **Ollama** installed and running
   - Download from [ollama.com](https://ollama.com)
   - Run: `ollama serve`
   - Pull a model: `ollama pull mistral` (or any other model)

2. **Python 3.8+**
3. **Node.js 14+** and **npm**

## Project Structure

```
d:\DA project\
├── backend/
│   ├── app.py                 # Flask application & API routes
│   ├── requirements.txt        # Python dependencies
│   ├── .env                   # Environment configuration
│   └── tutor_ai.db           # SQLite database (auto-created)
│
└── frontend/
    ├── package.json          # NPM dependencies
    ├── App.js               # Main React component
    ├── index.js             # Entry point
    ├── App.css              # Global styles
    ├── public/
    │   └── index.html       # HTML template
    ├── components/
    │   ├── ChatInterface.js      # Chat tutor component
    │   ├── QuizInterface.js      # Quiz component
    │   ├── ProgressDashboard.js  # Progress tracking
    │   └── UserProfile.js        # Registration component
    └── styles/
        ├── ChatInterface.css
        ├── QuizInterface.css
        ├── ProgressDashboard.css
        └── UserProfile.css
```

## Installation & Setup

### Step 1: Start Ollama

```bash
ollama serve
```

In another terminal, pull a model (if not already done):
```bash
ollama pull mistral
```

### Step 2: Setup Backend

```bash
cd d:\DA project\backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Flask server
python app.py
```

The backend will start at `http://localhost:5000`

### Step 3: Setup Frontend

```bash
cd d:\DA project\frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will open at `http://localhost:3000`

## Usage

### 1. **Register**
   - Create a username and email
   - Select your learning preference

### 2. **Chat & Learn**
   - Select a programming topic
   - Ask questions to the AI tutor
   - Get detailed explanations with code examples

### 3. **Take Quizzes**
   - Generate quizzes on specific topics
   - Choose difficulty level (easy, medium, hard)
   - Answer different question types
   - Get instant feedback with explanations

### 4. **Track Progress**
   - View your learning statistics
   - See accuracy by topic
   - Monitor daily streaks and learning time
   - Get personalized insights

## API Endpoints

### User Management
- `POST /api/users` - Create new user
- `GET /api/users/<id>` - Get user profile

### Chat
- `POST /api/chat` - Send message and get AI response
- `GET /api/chat-history/<user_id>` - Get chat history

### Quiz
- `POST /api/quiz/generate` - Generate quiz questions
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/quiz/history/<user_id>` - Get quiz history

### Progress
- `GET /api/progress/<user_id>` - Get overall progress
- `GET /api/progress/stats/<user_id>` - Get detailed statistics

### Health
- `GET /api/health` - Check API and Ollama status

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

## Configuration

### Environment Variables (`.env` file in backend/)

```
OLLAMA_API_URL=http://localhost:11434
OLLAMA_MODEL=mistral
FLASK_ENV=development
```

**Available Models:**
- `mistral` - Fast, good quality
- `llama2` - More detailed responses
- `neural-chat` - Optimized for chat
- `dolphin-mixtral` - High quality (requires more resources)

## Troubleshooting

### "Cannot connect to Ollama"
- Make sure Ollama is running: `ollama serve`
- Check `OLLAMA_API_URL` in `.env` file matches your Ollama server

### "Module not found" (Python)
- Ensure virtual environment is activated
- Run: `pip install -r requirements.txt`

### "npm packages missing" (React)
- Run: `npm install`

### Database errors
- Delete `tutor_ai.db` and restart backend to recreate it

### Quiz generation takes long time
- This depends on your model and machine specs
- Smaller models generate faster but with lower quality

## Tips for Best Results

✅ **For Better Learning:**
- Use consistent daily learning sessions
- Start with "interactive" learning style
- Gradually increase difficulty levels
- Review quiz explanations carefully
- Ask follow-up questions to clarify concepts

✅ **For Performance:**
- Use faster models like `mistral` for quick responses
- Close unnecessary applications to free up RAM
- Adjust Ollama parameter encoding context size if needed
