import React, { useState, useEffect } from 'react';
import '../styles/ProgressDashboard.css';

function ProgressDashboard({ userId }) {
  const [progress, setProgress] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    loadProgress();
    const interval = setInterval(loadProgress, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, [userId]);

  const loadProgress = async () => {
    try {
      const [progressRes, statsRes] = await Promise.all([
        fetch(`${API_URL}/progress/${userId}`),
        fetch(`${API_URL}/progress/stats/${userId}`)
      ]);

      if (progressRes.ok) {
        const data = await progressRes.json();
        setProgress(data);
      }

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error loading progress:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !progress) {
    return <div className="loading">Loading your progress...</div>;
  }

  return (
    <div className="progress-dashboard">
      <h2>📊 Your Learning Progress</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-info">
            <div className="stat-value">{progress.total_chats}</div>
            <div className="stat-label">Chat Sessions</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📝</div>
          <div className="stat-info">
            <div className="stat-value">{progress.total_quizzes}</div>
            <div className="stat-label">Questions Answered</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">✓</div>
          <div className="stat-info">
            <div className="stat-value">{progress.correct_answers}</div>
            <div className="stat-label">Correct Answers</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📈</div>
          <div className="stat-info">
            <div className="stat-value">{progress.accuracy.toFixed(1)}%</div>
            <div className="stat-label">Accuracy</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-info">
            <div className="stat-value">{progress.daily_streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-info">
            <div className="stat-value">{progress.total_learning_time}</div>
            <div className="stat-label">Minutes Learned</div>
          </div>
        </div>
      </div>

      {stats && stats.topic_stats && Object.keys(stats.topic_stats).length > 0 && (
        <div className="topics-section">
          <h3>📚 Topics Performance</h3>
          <div className="topics-grid">
            {Object.entries(stats.topic_stats).map(([topic, data]) => (
              <div key={topic} className="topic-card">
                <h4>{topic}</h4>
                <div className="topic-stats">
                  <p>Questions: <strong>{data.total}</strong></p>
                  <p>Correct: <strong>{data.correct}</strong></p>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${data.accuracy}%` }}
                    ></div>
                  </div>
                  <p className="accuracy-text">{data.accuracy.toFixed(1)}% accuracy</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="insights-section">
        <h3>💡 Insights</h3>
        <div className="insights-list">
          {progress.accuracy >= 80 ? (
            <div className="insight excellent">
              <span className="icon">🌟</span>
              <span className="text">Excellent performance! Keep up the great work!</span>
            </div>
          ) : progress.accuracy >= 60 ? (
            <div className="insight good">
              <span className="icon">👍</span>
              <span className="text">Good progress! Try more challenging questions to improve.</span>
            </div>
          ) : (
            <div className="insight improving">
              <span className="icon">💪</span>
              <span className="text">You're learning! Focus on weak areas with more practice.</span>
            </div>
          )}

          {progress.total_chats > 0 && (
            <div className="insight">
              <span className="icon">💬</span>
              <span className="text">You've had {progress.total_chats} productive chat sessions!</span>
            </div>
          )}

          {progress.daily_streak > 0 && (
            <div className="insight">
              <span className="icon">🔥</span>
              <span className="text">Amazing! You have a {progress.daily_streak}-day learning streak!</span>
            </div>
          )}
        </div>
      </div>

      <button onClick={loadProgress} className="btn-refresh">
        🔄 Refresh
      </button>
    </div>
  );
}

export default ProgressDashboard;
