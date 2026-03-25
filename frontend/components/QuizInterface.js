import React, { useState } from 'react';
import '../styles/QuizInterface.css';

function QuizInterface({ userId }) {
  const [currentStep, setCurrentStep] = useState('setup'); // setup, quiz, results
  const [topic, setTopic] = useState('Python Basics');
  const [difficulty, setDifficulty] = useState('medium');
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [quizResults, setQuizResults] = useState(null);
  const [timers, setTimers] = useState({});

  const API_URL = 'http://localhost:5000/api';

  const generateQuiz = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/quiz/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          topic: topic,
          num_questions: numQuestions,
          difficulty: difficulty
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuestions(data.questions);
        setCurrentQuestionIdx(0);
        setAnswers({});
        setTimers({});
        setCurrentStep('quiz');
      } else {
        alert('Failed to generate quiz');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      alert('Error generating quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerChange = (questionIdx, answer) => {
    setAnswers(prev => ({
      ...prev,
      [questionIdx]: answer
    }));
  };

  const submitQuiz = async () => {
    const formattedAnswers = questions.map((q, idx) => ({
      question_id: q.id,
      answer: answers[idx] || '',
      time_spent: timers[idx] || 0
    }));

    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/quiz/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          answers: formattedAnswers
        })
      });

      if (response.ok) {
        const data = await response.json();
        setQuizResults(data);
        setCurrentStep('results');
      } else {
        alert('Failed to submit quiz');
      }
    } catch (error) {
      console.error('Error submitting quiz:', error);
      alert('Error submitting quiz');
    } finally {
      setIsLoading(false);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
    }
  };

  const prevQuestion = () => {
    if (currentQuestionIdx > 0) {
      setCurrentQuestionIdx(prev => prev - 1);
    }
  };

  const resetQuiz = () => {
    setCurrentStep('setup');
    setTopic('Python Basics');
    setDifficulty('medium');
    setNumQuestions(5);
    setQuestions([]);
    setCurrentQuestionIdx(0);
    setAnswers({});
    setQuizResults(null);
    setTimers({});
  };

  const currentQuestion = questions[currentQuestionIdx];

  return (
    <div className="quiz-interface">
      {currentStep === 'setup' && (
        <div className="quiz-setup">
          <h2>📝 Create a Quiz</h2>
          <div className="setup-form">
            <div className="form-group">
              <label>Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g., Python Basics, Web Development"
              />
            </div>

            <div className="form-group">
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="form-group">
              <label>Number of Questions</label>
              <input
                type="number"
                min="1"
                max="20"
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
              />
            </div>

            <button
              className="btn-primary"
              onClick={generateQuiz}
              disabled={isLoading}
            >
              {isLoading ? 'Generating...' : '🚀 Generate Quiz'}
            </button>
          </div>
        </div>
      )}

      {currentStep === 'quiz' && currentQuestion && (
        <div className="quiz-container">
          <div className="quiz-header">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestionIdx + 1) / questions.length) * 100}%` }}
              ></div>
            </div>
            <p className="question-counter">
              Question {currentQuestionIdx + 1} of {questions.length}
            </p>
          </div>

          <div className="question-box">
            <div className="difficulty-badge">{currentQuestion.difficulty}</div>
            <h3 className="question-text">{currentQuestion.question}</h3>

            <div className="answer-section">
              {currentQuestion.question_type === 'mcq' && (
                <div className="options">
                  {currentQuestion.options && currentQuestion.options.map((option, idx) => (
                    <label key={idx} className="option-label">
                      <input
                        type="radio"
                        name={`question-${currentQuestionIdx}`}
                        value={option}
                        checked={answers[currentQuestionIdx] === option}
                        onChange={(e) => handleAnswerChange(currentQuestionIdx, e.target.value)}
                      />
                      <span className="option-text">{option}</span>
                    </label>
                  ))}
                </div>
              )}

              {currentQuestion.question_type === 'true_false' && (
                <div className="tf-options">
                  <label className="tf-label">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIdx}`}
                      value="True"
                      checked={answers[currentQuestionIdx] === 'True'}
                      onChange={(e) => handleAnswerChange(currentQuestionIdx, e.target.value)}
                    />
                    <span>True</span>
                  </label>
                  <label className="tf-label">
                    <input
                      type="radio"
                      name={`question-${currentQuestionIdx}`}
                      value="False"
                      checked={answers[currentQuestionIdx] === 'False'}
                      onChange={(e) => handleAnswerChange(currentQuestionIdx, e.target.value)}
                    />
                    <span>False</span>
                  </label>
                </div>
              )}

              {currentQuestion.question_type === 'short_answer' && (
                <textarea
                  value={answers[currentQuestionIdx] || ''}
                  onChange={(e) => handleAnswerChange(currentQuestionIdx, e.target.value)}
                  placeholder="Type your answer here..."
                  className="short-answer-input"
                />
              )}
            </div>
          </div>

          <div className="quiz-navigation">
            <button
              onClick={prevQuestion}
              disabled={currentQuestionIdx === 0}
              className="btn-secondary"
            >
              ← Previous
            </button>

            {currentQuestionIdx === questions.length - 1 ? (
              <button
                onClick={submitQuiz}
                disabled={isLoading}
                className="btn-primary"
              >
                {isLoading ? 'Submitting...' : '✓ Submit Quiz'}
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                className="btn-secondary"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      )}

      {currentStep === 'results' && quizResults && (
        <div className="quiz-results">
          <div className="results-header">
            <h2>🎉 Quiz Complete!</h2>
          </div>

          <div className="score-display">
            <div className="score-circle">
              <div className="score-percentage">{quizResults.percentage.toFixed(1)}%</div>
              <p className="score-text">Score</p>
            </div>
            <div className="score-details">
              <p>Correct Answers: <strong>{quizResults.score}</strong> / {quizResults.total}</p>
              <p className="performance-text">
                {quizResults.percentage >= 80 ? '🌟 Excellent!' : 
                 quizResults.percentage >= 60 ? '👍 Good job!' : 
                 '💪 Keep practicing!'}
              </p>
            </div>
          </div>

          <div className="results-details">
            <h3>Review Your Answers</h3>
            {quizResults.results.map((result, idx) => (
              <div key={idx} className={`result-item ${result.is_correct ? 'correct' : 'incorrect'}`}>
                <div className="result-status">
                  {result.is_correct ? '✓' : '✗'}
                </div>
                <div className="result-content">
                  <p className="result-question">Q{idx + 1}: {questions[idx].question}</p>
                  <p className="your-answer">Your answer: {result.user_answer || '(no answer)'}</p>
                  {!result.is_correct && (
                    <p className="correct-answer">Correct answer: {result.correct_answer}</p>
                  )}
                  {result.explanation && (
                    <p className="explanation">💡 {result.explanation}</p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button onClick={resetQuiz} className="btn-primary">
            📝 Take Another Quiz
          </button>
        </div>
      )}
    </div>
  );
}

export default QuizInterface;
