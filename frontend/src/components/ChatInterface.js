import React, { useState, useEffect, useRef } from 'react';
import '../styles/ChatInterface.css';

function ChatInterface({ userId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [topic, setTopic] = useState('Python Basics');
  const [isLoading, setIsLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const messagesEndRef = useRef(null);

  const API_URL = 'http://localhost:5000/api';

  useEffect(() => {
    loadChatHistory();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_URL}/chat-history/${userId}`);
      if (response.ok) {
        const data = await response.json();
        setChatHistory(data.chats);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    setInputValue('');

    // Add user message to display
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic: topic,
          message: userMessage
        })
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        loadChatHistory();
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong.' }]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error: Could not connect to the server.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestedTopics = [
    'Python Basics',
    'JavaScript ES6+',
    'Web Development',
    'Object-Oriented Programming',
    'Data Structures',
    'Database Design'
  ];

  return (
    <div className="chat-interface">
      <div className="chat-sidebar">
        <h3>Topics</h3>
        <div className="topics-list">
          {suggestedTopics.map(t => (
            <button
              key={t}
              className={`topic-btn ${topic === t ? 'active' : ''}`}
              onClick={() => setTopic(t)}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="topic-custom">
          <input
            type="text"
            placeholder="Enter custom topic..."
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="topic-input"
          />
        </div>
      </div>

      <div className="chat-container">
        <div className="chat-header">
          <h2>📚 {topic}</h2>
          <p className="chat-subtitle">Personalized AI tutor powered by Ollama</p>
        </div>

        <div className="messages-container">
          {messages.length === 0 && (
            <div className="welcome-message">
              <h3>Welcome! 👋</h3>
              <p>Ask me anything about <strong>{topic}</strong></p>
              <p className="hint">Try questions like:</p>
              <ul>
                <li>"What is object-oriented programming?"</li>
                <li>"Can you explain decorators in Python?"</li>
                <li>"How do databases work?"</li>
              </ul>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`message ${msg.role}`}>
              <div className="message-avatar">
                {msg.role === 'user' ? '👤' : '🤖'}
              </div>
              <div className="message-content">
                {msg.content}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="message assistant loading">
              <div className="message-avatar">🤖</div>
              <div className="message-content">
                <div className="typing-indicator">
                  <span></span><span></span><span></span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="message-form" onSubmit={sendMessage}>
          <div className="input-group">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask me anything about programming..."
              disabled={isLoading}
              className="message-input"
            />
            <button type="submit" disabled={isLoading} className="send-btn">
              {isLoading ? '⏳' : '📤'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ChatInterface;
