import React, { useState, useEffect } from 'react';
import './App.css';
import ChatInterface from './components/ChatInterface';
import QuizInterface from './components/QuizInterface';
import ProgressDashboard from './components/ProgressDashboard';
import UserProfile from './components/UserProfile';

function App() {
  const [currentView, setCurrentView] = useState('chat');
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    // Check if user exists in localStorage
    const storedUserId = localStorage.getItem('userId');
    const storedUserName = localStorage.getItem('userName');
    if (storedUserId) {
      setUserId(parseInt(storedUserId));
      setUserName(storedUserName);
      setIsRegistered(true);
    }
  }, []);

  const handleRegister = async (username, email) => {
    try {
      const response = await fetch(`${API_URL}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          email,
          learning_style: 'interactive'
        })
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
        setUserName(data.username);
        setIsRegistered(true);
        localStorage.setItem('userId', data.id);
        localStorage.setItem('userName', data.username);
      } else {
        alert('Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error registering user');
    }
  };

  const handleLogout = () => {
    setUserId(null);
    setUserName('');
    setIsRegistered(false);
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    setCurrentView('chat');
  };

  if (!isRegistered) {
    return <UserProfile onRegister={handleRegister} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <h1>🤖 Tutor AI - Programming Mentor</h1>
          <p className="welcome-text">Welcome, {userName}!</p>
        </div>
      </header>

      <nav className="app-nav">
        <button
          className={`nav-btn ${currentView === 'chat' ? 'active' : ''}`}
          onClick={() => setCurrentView('chat')}
        >
          💬 Chat & Learn
        </button>
        <button
          className={`nav-btn ${currentView === 'quiz' ? 'active' : ''}`}
          onClick={() => setCurrentView('quiz')}
        >
          📝 Quiz
        </button>
        <button
          className={`nav-btn ${currentView === 'progress' ? 'active' : ''}`}
          onClick={() => setCurrentView('progress')}
        >
          📊 Progress
        </button>
        <button className="nav-btn logout-btn" onClick={handleLogout}>
          🚪 Logout
        </button>
      </nav>

      <main className="app-main">
        {currentView === 'chat' && <ChatInterface userId={userId} />}
        {currentView === 'quiz' && <QuizInterface userId={userId} />}
        {currentView === 'progress' && <ProgressDashboard userId={userId} />}
      </main>

      <footer className="app-footer">
        <p>Powered by Local Ollama Engine</p>
      </footer>
    </div>
  );
}

export default App;
