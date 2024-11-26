import React, { useState } from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import { questions } from "../data/questions";
import "./Game.css";

const Game = () => {
  const [isSplashScreenVisible, setIsSplashScreenVisible] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [showPopup, setShowPopup] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);

  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <div>Your browser does not support speech recognition.</div>;
  }

  const handleStartGame = () => {
    setIsTransitioning(true); // Trigger the fade-out transition.
    setTimeout(() => {
      setIsSplashScreenVisible(false); // Hide splash screen after transition.
    }, 1000); // Duration matches CSS transition time.
  };

  const currentQuestion = questions[currentQuestionIndex];

  const handleTapToSpeak = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      handleResult(transcript); // Evaluate the transcript when the user stops speaking.
    } else {
      resetTranscript(); // Clear previous transcript.
      SpeechRecognition.startListening();
    }
  };

  const handleResult = (userInput) => {
    const similarity =
      userInput.toLowerCase() === currentQuestion.answer.toLowerCase();
    if (similarity) {
      setScore(score + 1);
      setFeedback("✅ Correct!");
    } else {
      setFeedback("❌ Incorrect. Try Again!");
    }

    setShowPopup(true);
    setTimeout(() => {
      setShowPopup(false);
      setFeedback("");
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setShowResultPopup(true);
      }
    }, 2000);
  };

  const restartGame = () => {
    setShowResultPopup(false);
    setCurrentQuestionIndex(0);
    setScore(0);
    resetTranscript();
  };

  return (
    <div className="game-container">
      {isSplashScreenVisible ? (
        <div className={`splash-screen ${isTransitioning ? "fade-out" : ""}`}>
          <h1 className="splash-title">🎮 English Learning Game</h1>
          <p className="splash-subtitle">Learn while having fun!</p>
          <button className="play-button" onClick={handleStartGame}>
            Play Game
          </button>
        </div>
      ) : (
        <>
          <h1 className="game-title">English Learning Game</h1>
          {/* Person Asking the Question */}
          <div className="person-container">
            <img
              src="/images/person-asking.png"
              alt="Person Asking"
              className="person-image"
            />
            <div className="chat-bubble">
              <p>
                Question {currentQuestionIndex + 1}: {currentQuestion.question}
              </p>
            </div>
          </div>

          {/* Control Section */}
          <div className="control-section">
            <button className="control-btn" onClick={handleTapToSpeak}>
              {listening ? "Listening..." : "Tap to Speak"}
            </button>
          </div>

          {/* Feedback and Popups */}
          <div className="feedback-container">
            {feedback && <p className="feedback">{feedback}</p>}
          </div>

          {showPopup && (
            <div className="popup">
              <h2>{feedback}</h2>
            </div>
          )}

          {showResultPopup && (
            <div className="result-popup">
              <h1>Game Over!</h1>
              <div className="score-animation">
                <span className="score-number">{score}</span>
                <p>Points</p>
              </div>
              <button className="restart-btn" onClick={restartGame}>
                Play Again
              </button>
            </div>
          )}

          <h3>Score: {score}</h3>
        </>
      )}
    </div>
  );
};

export default Game;
