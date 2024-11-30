import React from "react";
import SpeechRecognition from "react-speech-recognition";
import { questions } from "../data/questions";
import "./Game.css";

class Game extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isSplashScreenVisible: true,
      isTransitioning: false,
      currentQuestionIndex: 0,
      score: 0,
      feedback: "",
      showPopup: false,
      showResultPopup: false,
      transcript: "",
      listening: false,
      microphonePermissionGranted: false, // New state for permission status
    };
    this.speechSynthesis = window.speechSynthesis;
  }

  componentDidUpdate(prevProps, prevState) {
    const { isSplashScreenVisible, showResultPopup, currentQuestionIndex } =
      this.state;

    // Trigger question reading when conditions change
    if (
      prevState.isSplashScreenVisible !== isSplashScreenVisible &&
      !isSplashScreenVisible &&
      !showResultPopup
    ) {
      this.readQuestion(questions[currentQuestionIndex].question);
    }

    if (
      prevState.currentQuestionIndex !== currentQuestionIndex &&
      !showResultPopup
    ) {
      this.readQuestion(questions[currentQuestionIndex].question);
    }
  }

  // New method to request microphone permission
  requestMicrophonePermission = () => {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then(() => {
        this.setState({ microphonePermissionGranted: true });
      })
      .catch((err) => {
        console.error("Microphone permission denied:", err);
        alert("Microphone permission is required for this feature.");
        this.setState({ microphonePermissionGranted: false });
      });
  };

  handleStartGame = () => {
    // Request permission when starting the game
    this.requestMicrophonePermission();
    if (!this.state.microphonePermissionGranted) {
      return; // Exit early if permission is not granted
    }

    this.setState({ isTransitioning: true });
    setTimeout(() => {
      this.setState({ isSplashScreenVisible: false });
    }, 1000); // Matches CSS transition duration
  };

  handleTapToSpeak = () => {
    const { listening } = this.state;

    if (!this.state.microphonePermissionGranted) {
      alert("Microphone permission is required to continue.");
      return;
    }

    if (listening) {
      SpeechRecognition.stopListening();
      const { transcript } = SpeechRecognition;
      console.log("Transcript:", transcript); // Debugging log
      this.setState({ transcript }); // Save the transcript when listening stops
      this.handleResult(transcript); // Evaluate the transcript
    } else {
      this.setState({ transcript: "" }, () => {
        SpeechRecognition.startListening({
          continuous: false,
          language: "en-US",
        });
      });
    }

    this.setState((prevState) => ({ listening: !prevState.listening }));
  };

  handleResult = (userInput) => {
    const { currentQuestionIndex, score } = this.state;
    const currentQuestion = questions[currentQuestionIndex];

    // Default to an empty string if userInput is undefined
    const normalizedInput = userInput ? userInput.toLowerCase() : "";

    const isCorrect = normalizedInput === currentQuestion.answer.toLowerCase();
    console.log(`Question: ${currentQuestion.question}`);
    console.log(`User's Response: ${userInput || "No Response"}`);
    console.log(`Correct Answer: ${currentQuestion.answer}`);
    console.log(`Result: ${isCorrect ? "Correct" : "Incorrect"}`);

    if (isCorrect) {
      this.setState({
        score: score + 1,
        feedback: "✅ Correct!",
        showPopup: true,
      });
    } else {
      this.setState({
        feedback: "❌ Incorrect. Try Again!",
        showPopup: true,
      });
    }

    setTimeout(() => {
      this.setState({ showPopup: false, feedback: "" });
      if (currentQuestionIndex < questions.length - 1) {
        this.setState({ currentQuestionIndex: currentQuestionIndex + 1 });
      } else {
        this.setState({ showResultPopup: true });
      }
    }, 2000);
  };

  readQuestion = (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    this.speechSynthesis.speak(utterance);
  };

  restartGame = () => {
    this.setState(
      {
        showResultPopup: false,
        currentQuestionIndex: 0,
        score: 0,
        transcript: "",
        listening: false,
      },
      () => {
        this.readQuestion(questions[0].question);
      }
    );
  };

  render() {
    const {
      isSplashScreenVisible,
      isTransitioning,
      currentQuestionIndex,
      score,
      feedback,
      showPopup,
      showResultPopup,
      listening,
      transcript,
      microphonePermissionGranted,
    } = this.state;

    const currentQuestion = questions[currentQuestionIndex];

    return (
      <div className="game-container">
        {isSplashScreenVisible ? (
          <div className={`splash-screen ${isTransitioning ? "fade-out" : ""}`}>
            <h1 className="splash-title">🎮 English Learning Game</h1>
            <p className="splash-subtitle">Learn while having fun!</p>
            <button className="play-button" onClick={this.handleStartGame}>
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
                  Question {currentQuestionIndex + 1}:{" "}
                  {currentQuestion.question}
                </p>
              </div>
            </div>

            {/* Display Required Answer */}
            <div className="required-answer">
              <p className="recorded-answer-title">
                Required Answer: {currentQuestion.answer}
              </p>
            </div>

            {/* Display User's Recorded Answer */}
            <div className="recorded-answer-container">
              <p className="recorded-answer-title">Your Answer:</p>
              <p className="recorded-answer">{transcript || "..."}</p>
            </div>

            {/* Control Section */}
            <div className="control-section">
              <button className="control-btn" onClick={this.handleTapToSpeak}>
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
                <button className="restart-btn" onClick={this.restartGame}>
                  Play Again
                </button>
              </div>
            )}

            <h3>Score: {score}</h3>
          </>
        )}
      </div>
    );
  }
}

export default Game;
