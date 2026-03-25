from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os
from dotenv import load_dotenv
import requests
import json

load_dotenv()

app = Flask(__name__)
CORS(app)

# Database Configuration
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///tutor_ai.db?timeout=30&check_same_thread=False'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
    'connect_args': {
        'timeout': 30,
        'check_same_thread': False,
    },
    'pool_pre_ping': True,
    'pool_recycle': 3600,
}
db = SQLAlchemy(app)

# Ollama Configuration
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
OLLAMA_MODEL = os.getenv('OLLAMA_MODEL', 'mistral')

# ==================== Database Models ====================

class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    learning_style = db.Column(db.String(50), default='balanced')  # interactive, visual, detailed
    
    # Relationships
    chat_histories = db.relationship('ChatHistory', backref='user', lazy=True, cascade='all, delete-orphan')
    quiz_attempts = db.relationship('QuizAttempt', backref='user', lazy=True, cascade='all, delete-orphan')
    progress = db.relationship('UserProgress', backref='user', lazy=True, uselist=False, cascade='all, delete-orphan')


class ChatHistory(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    topic = db.Column(db.String(255), nullable=False)
    user_message = db.Column(db.Text, nullable=False)
    ai_response = db.Column(db.Text, nullable=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)


class QuizQuestion(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    topic = db.Column(db.String(255), nullable=False)
    question = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(50), nullable=False)  # mcq, short_answer, true_false
    options = db.Column(db.Text)  # JSON for MCQ options
    correct_answer = db.Column(db.Text, nullable=False)
    explanation = db.Column(db.Text)
    difficulty = db.Column(db.String(20), default='medium')  # easy, medium, hard
    
    quiz_attempts = db.relationship('QuizAttempt', backref='question', lazy=True)


class QuizAttempt(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    question_id = db.Column(db.Integer, db.ForeignKey('quiz_question.id'), nullable=False)
    user_answer = db.Column(db.Text, nullable=False)
    is_correct = db.Column(db.Boolean, default=False)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    time_spent = db.Column(db.Integer)  # seconds


class UserProgress(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    total_chats = db.Column(db.Integer, default=0)
    total_quizzes = db.Column(db.Integer, default=0)
    correct_answers = db.Column(db.Integer, default=0)
    topics_learned = db.Column(db.Text, default='{}')  # JSON
    daily_streak = db.Column(db.Integer, default=0)
    last_active = db.Column(db.DateTime, default=datetime.utcnow)
    total_learning_time = db.Column(db.Integer, default=0)  # minutes


# ==================== Helper Functions ====================

def call_ollama(prompt, system_prompt=""):
    """Call local Ollama API"""
    try:
        url = f"{OLLAMA_API_URL}/api/generate"
        payload = {
            "model": OLLAMA_MODEL,
            "prompt": prompt,
            "stream": False,
            "temperature": 0.7
        }
        
        if system_prompt:
            payload["system"] = system_prompt
            
        response = requests.post(url, json=payload, timeout=60)
        response.raise_for_status()
        
        result = response.json()
        return result.get('response', '').strip()
    except Exception as e:
        return f"Error connecting to Ollama: {str(e)}"


# ==================== API Routes ====================

# --- User Management ---

@app.route('/api/users', methods=['POST'])
def create_user():
    """Create a new user"""
    data = request.json
    
    if not data.get('username') or not data.get('email'):
        return jsonify({'error': 'Username and email required'}), 400
    
    try:
        user = User(
            username=data['username'],
            email=data['email'],
            learning_style=data.get('learning_style', 'balanced')
        )
        user.progress = UserProgress()
        db.session.add(user)
        db.session.commit()
        
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'created_at': user.created_at.isoformat()
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 400


@app.route('/api/users/<int:user_id>', methods=['GET'])
def get_user(user_id):
    """Get user profile"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    return jsonify({
        'id': user.id,
        'username': user.username,
        'email': user.email,
        'learning_style': user.learning_style,
        'created_at': user.created_at.isoformat()
    }), 200


# --- Chat Routes ---

@app.route('/api/chat', methods=['POST'])
def chat():
    """Send message to tutor and get response"""
    data = request.json
    user_id = data.get('user_id')
    topic = data.get('topic', 'General Programming')
    user_message = data.get('message', '')
    
    if not user_id or not user_message:
        return jsonify({'error': 'user_id and message required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Create system prompt based on learning style
    system_prompt = f"""You are an expert programming tutor. You specialize in teaching {topic}.
Your learning style should be {user.learning_style}:
- interactive: Engage the student with questions and discussions
- visual: Provide code examples and diagrams
- detailed: Provide thorough, in-depth explanations

Keep responses concise but informative. When appropriate, provide code examples.
If the student asks a question unrelated to programming, gently redirect them back to programming topics."""
    
    # Call Ollama
    ai_response = call_ollama(user_message, system_prompt)
    
    # Save to chat history
    chat_record = ChatHistory(
        user_id=user_id,
        topic=topic,
        user_message=user_message,
        ai_response=ai_response
    )
    db.session.add(chat_record)
    
    # Update user progress
    user.progress.total_chats += 1
    user.progress.last_active = datetime.utcnow()
    db.session.commit()
    
    return jsonify({
        'response': ai_response,
        'topic': topic,
        'timestamp': datetime.utcnow().isoformat()
    }), 200


@app.route('/api/chat-history/<int:user_id>', methods=['GET'])
def get_chat_history(user_id):
    """Get user's chat history"""
    limit = request.args.get('limit', 20, type=int)
    
    chats = ChatHistory.query.filter_by(user_id=user_id).order_by(
        ChatHistory.timestamp.desc()
    ).limit(limit).all()
    
    return jsonify({
        'chats': [{
            'id': chat.id,
            'topic': chat.topic,
            'user_message': chat.user_message,
            'ai_response': chat.ai_response,
            'timestamp': chat.timestamp.isoformat()
        } for chat in reversed(chats)]
    }), 200


# --- Quiz Routes ---

@app.route('/api/quiz/generate', methods=['POST'])
def generate_quiz():
    """Generate quiz questions using Ollama"""
    data = request.json
    user_id = data.get('user_id')
    topic = data.get('topic', 'Python Basics')
    num_questions = data.get('num_questions', 5)
    difficulty = data.get('difficulty', 'medium')
    
    if not user_id:
        return jsonify({'error': 'user_id required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    questions = []
    
    for i in range(num_questions):
        prompt = f"""Generate a {difficulty} level programming quiz question about "{topic}".
        
        Question type (rotate through these): MCQ, True/False, Short Answer
        Current question type: {['MCQ', 'True/False', 'Short Answer'][i % 3]}
        
        Format your response as JSON with these fields:
        {{
            "question": "...",
            "question_type": "mcq|true_false|short_answer",
            "options": ["A) ...", "B) ...", "C) ...", "D) ..."] (only for MCQ),
            "correct_answer": "...",
            "explanation": "..."
        }}"""
        
        response_text = call_ollama(prompt)
        
        try:
            # Try to parse JSON from response
            question_data = json.loads(response_text)
            
            quiz_q = QuizQuestion(
                topic=topic,
                question=question_data.get('question', ''),
                question_type=question_data.get('question_type', 'mcq'),
                options=json.dumps(question_data.get('options', [])),
                correct_answer=question_data.get('correct_answer', ''),
                explanation=question_data.get('explanation', ''),
                difficulty=difficulty
            )
            db.session.add(quiz_q)
            
            questions.append({
                'id': quiz_q.id,
                'question': quiz_q.question,
                'question_type': quiz_q.question_type,
                'options': json.loads(quiz_q.options) if quiz_q.options else [],
                'difficulty': quiz_q.difficulty
            })
        except json.JSONDecodeError:
            # Fallback if JSON parsing fails
            questions.append({
                'id': 0,
                'question': response_text,
                'question_type': 'short_answer',
                'options': [],
                'difficulty': difficulty
            })
    
    db.session.commit()
    return jsonify({'questions': questions}), 200


@app.route('/api/quiz/submit', methods=['POST'])
def submit_quiz():
    """Submit quiz answers and evaluate"""
    data = request.json
    user_id = data.get('user_id')
    answers = data.get('answers', [])  # [{question_id, answer}, ...]
    
    if not user_id or not answers:
        return jsonify({'error': 'user_id and answers required'}), 400
    
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    results = []
    correct_count = 0
    
    for answer_data in answers:
        question_id = answer_data.get('question_id')
        user_answer = answer_data.get('answer', '')
        time_spent = answer_data.get('time_spent', 0)
        
        question = QuizQuestion.query.get(question_id)
        if not question:
            continue
        
        # For now, exact match checking (can be improved with NLP)
        is_correct = user_answer.strip().lower() == question.correct_answer.strip().lower()
        
        attempt = QuizAttempt(
            user_id=user_id,
            question_id=question_id,
            user_answer=user_answer,
            is_correct=is_correct,
            time_spent=time_spent
        )
        db.session.add(attempt)
        
        if is_correct:
            correct_count += 1
        
        results.append({
            'question_id': question_id,
            'is_correct': is_correct,
            'correct_answer': question.correct_answer,
            'explanation': question.explanation
        })
    
    # Update user progress
    user.progress.total_quizzes += len(answers)
    user.progress.correct_answers += correct_count
    db.session.commit()
    
    score_percentage = (correct_count / len(answers)) * 100 if answers else 0
    
    return jsonify({
        'score': correct_count,
        'total': len(answers),
        'percentage': score_percentage,
        'results': results
    }), 200


@app.route('/api/quiz/history/<int:user_id>', methods=['GET'])
def get_quiz_history(user_id):
    """Get user's quiz history"""
    attempts = QuizAttempt.query.filter_by(user_id=user_id).order_by(
        QuizAttempt.timestamp.desc()
    ).limit(50).all()
    
    return jsonify({
        'attempts': [{
            'id': attempt.id,
            'question': attempt.question.question,
            'topic': attempt.question.topic,
            'user_answer': attempt.user_answer,
            'is_correct': attempt.is_correct,
            'timestamp': attempt.timestamp.isoformat()
        } for attempt in attempts]
    }), 200


# --- Progress Routes ---

@app.route('/api/progress/<int:user_id>', methods=['GET'])
def get_progress(user_id):
    """Get user's learning progress"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    progress = user.progress
    accuracy = 0
    if progress.total_quizzes > 0:
        accuracy = (progress.correct_answers / progress.total_quizzes) * 100
    
    return jsonify({
        'total_chats': progress.total_chats,
        'total_quizzes': progress.total_quizzes,
        'correct_answers': progress.correct_answers,
        'accuracy': accuracy,
        'daily_streak': progress.daily_streak,
        'last_active': progress.last_active.isoformat(),
        'total_learning_time': progress.total_learning_time
    }), 200


@app.route('/api/progress/stats/<int:user_id>', methods=['GET'])
def get_detailed_stats(user_id):
    """Get detailed learning statistics"""
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
    
    # Topic breakdown
    attempts = QuizAttempt.query.filter_by(user_id=user_id).all()
    topic_stats = {}
    
    for attempt in attempts:
        topic = attempt.question.topic
        if topic not in topic_stats:
            topic_stats[topic] = {'total': 0, 'correct': 0}
        topic_stats[topic]['total'] += 1
        if attempt.is_correct:
            topic_stats[topic]['correct'] += 1
    
    return jsonify({
        'topic_stats': {
            topic: {
                'total': stats['total'],
                'correct': stats['correct'],
                'accuracy': (stats['correct'] / stats['total'] * 100) if stats['total'] > 0 else 0
            }
            for topic, stats in topic_stats.items()
        }
    }), 200


# --- Health Check ---

@app.route('/api/health', methods=['GET'])
def health_check():
    """Check if API and Ollama are running"""
    try:
        response = requests.get(f"{OLLAMA_API_URL}/api/tags", timeout=5)
        ollama_status = response.status_code == 200
    except:
        ollama_status = False
    
    return jsonify({
        'status': 'ok',
        'ollama_connected': ollama_status,
        'model': OLLAMA_MODEL
    }), 200


# ==================== Error Handlers ====================

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'error': 'Internal server error'}), 500


# ==================== Initialize Database ====================

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000)
