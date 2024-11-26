import React from "react";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";

const SpeechToText = ({ onResult }) => {
  const { transcript, listening, resetTranscript } = useSpeechRecognition();

  if (!SpeechRecognition.browserSupportsSpeechRecognition()) {
    return <span>Your browser does not support speech recognition.</span>;
  }

  const handleClickToSpeak = () => {
    if (listening) {
      SpeechRecognition.stopListening();
      onResult(transcript.trim());
      resetTranscript();
    } else {
      SpeechRecognition.startListening({ continuous: true });
    }
  };

  return (
    <div>
      <button
        onClick={handleClickToSpeak}
        style={{
          backgroundColor: listening ? "#d9534f" : "#5cb85c",
          color: "white",
          border: "none",
          padding: "10px 20px",
          borderRadius: "5px",
          cursor: "pointer",
          fontSize: "16px",
          marginTop: "20px",
        }}
      >
        {listening ? "🎤 Stop" : "🎤 Click to Speak"}
      </button>
      <p style={{ fontStyle: "italic", marginTop: "10px" }}>
        {listening ? "Listening..." : "Click the button to start speaking"}
      </p>
    </div>
  );
};

export default SpeechToText;
