import React, { useState } from 'react';
import '../styles/UserProfile.css';

function UserProfile({ onRegister }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!username.trim() || !email.trim()) {
      alert('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      await onRegister(username, email);
    } catch (error) {
      console.error('Registration error:', error);
      alert('Error registering. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="user-profile">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <h1>🤖 Tutor AI</h1>
            <p className="subtitle">Your Personal Programming Mentor</p>
          </div>

          <div className="welcome-section">
            <h2>Welcome to Your Learning Journey!</h2>
            <p>Get started by creating your profile. Your personalized AI tutor is ready to teach you programming concepts, generate quizzes, and track your progress.</p>
          </div>

          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                disabled={isLoading}
              />
            </div>

            <button type="submit" disabled={isLoading} className="btn-register">
              {isLoading ? 'Creating Account...' : '🚀 Get Started'}
            </button>
          </form>

          <div className="features">
            <h3>What You Can Do:</h3>
            <div className="features-grid">
              <div className="feature">
                <span className="feature-icon">💬</span>
                <h4>Chat & Learn</h4>
                <p>Have interactive conversations with your AI tutor about any programming topic</p>
              </div>
              <div className="feature">
                <span className="feature-icon">📝</span>
                <h4>Generate Quizzes</h4>
                <p>Test your knowledge with auto-generated quizzes on various difficulty levels</p>
              </div>
              <div className="feature">
                <span className="feature-icon">📊</span>
                <h4>Track Progress</h4>
                <p>Monitor your learning journey with detailed analytics and performance metrics</p>
              </div>
            </div>
          </div>

          <div className="tech-info">
            <p>🔌 Powered by Local Ollama Engine - All data stays on your machine!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default UserProfile;
