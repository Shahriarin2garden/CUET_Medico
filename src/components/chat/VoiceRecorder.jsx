import { useState, useRef, useEffect } from "react";
import { FaMicrophone, FaStop, FaExclamationCircle } from "react-icons/fa";

const SpeechRecognition =
  typeof window !== "undefined" &&
  (window.SpeechRecognition || window.webkitSpeechRecognition);

const VoiceRecorder = ({ onTranscriptReady }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [liveTranscript, setLiveTranscript] = useState("");
  const [supported, setSupported] = useState(true);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (!SpeechRecognition) {
      setSupported(false);
    }
  }, []);

  const startRecording = () => {
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    let finalTranscript = "";

    recognition.onresult = (event) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript + " ";
        } else {
          interim += transcript;
        }
      }
      setLiveTranscript(finalTranscript + interim);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      if (event.error !== "no-speech") {
        stopRecording();
      }
    };

    recognition.onend = () => {
      // Auto-restart if still recording (handles Chrome's auto-stop)
      if (isRecording && recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch (e) {
          // Already started
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setLiveTranscript("");
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
      recognitionRef.current = null;

      if (liveTranscript.trim()) {
        onTranscriptReady(liveTranscript.trim());
      }
      setLiveTranscript("");
    }
  };

  if (!supported) {
    return (
      <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500 bg-opacity-10 rounded-lg px-3 py-2">
        <FaExclamationCircle />
        <span>Voice notes not supported in this browser. Use Chrome or Edge.</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Live transcript preview */}
      {isRecording && liveTranscript && (
        <div className="bg-purple-500 bg-opacity-10 border border-purple-500 border-opacity-30 rounded-xl px-4 py-2">
          <p className="text-[10px] text-purple-400 font-semibold mb-1 flex items-center gap-1">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            Live Transcription
          </p>
          <p className="text-sm text-slate-300 italic">{liveTranscript}</p>
        </div>
      )}

      {/* Record button */}
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
          isRecording
            ? "bg-red-600 text-white hover:bg-red-500 animate-pulse"
            : "bg-slate-700 text-slate-300 hover:bg-slate-600 border border-slate-600"
        }`}
      >
        {isRecording ? (
          <>
            <FaStop className="text-xs" /> Stop & Send Voice Note
          </>
        ) : (
          <>
            <FaMicrophone className="text-xs" /> Record Voice Note
          </>
        )}
      </button>
    </div>
  );
};

export default VoiceRecorder;
