import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { io } from "socket.io-client";
import { FaExclamationTriangle } from "react-icons/fa";
import ChatWindow from "../components/chat/ChatWindow";
import VoiceRecorder from "../components/chat/VoiceRecorder";
import SessionHeader from "../components/chat/SessionHeader";
import TranscriptAnalysis from "../components/chat/TranscriptAnalysis";

const SOCKET_URL = "http://localhost:5000";

const ChatSession = () => {
  const { sessionId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Get user info from URL params or localStorage
  const role = searchParams.get("role") || "patient";
  const userName = searchParams.get("name") || "User";

  const [session, setSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [error, setError] = useState(null);
  const [connected, setConnected] = useState(false);
  const socketRef = useRef(null);

  // Fetch session data
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch(`/api/chat/session/${sessionId}`);
        if (!res.ok) throw new Error("Session not found");
        const data = await res.json();
        setSession(data);
        setMessages(data.messages || []);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchSession();
  }, [sessionId]);

  // Connect to Socket.io
  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    socket.on("connect", () => {
      setConnected(true);
      socket.emit("join-session", sessionId);
    });

    socket.on("new-message", (message) => {
      setMessages((prev) => {
        // Prevent duplicates (same text + sender + timestamp)
        const ts = new Date(message.timestamp).getTime();
        const isDuplicate = prev.some(
          (m) => m.text === message.text && m.sender === message.sender &&
                 new Date(m.timestamp).getTime() === ts
        );
        if (isDuplicate) return prev;
        return [...prev, message];
      });
    });

    socket.on("session-ended", () => {
      setSession((prev) => (prev ? { ...prev, status: "ended" } : prev));
    });

    socket.on("disconnect", () => {
      setConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [sessionId]);

  const handleSendMessage = (text, isVoiceNote) => {
    if (!socketRef.current || !session || session.status !== "active") return;

    socketRef.current.emit("send-message", {
      sessionId,
      sender: role,
      senderName: userName,
      text,
      isVoiceNote,
    });
  };

  const handleVoiceTranscript = (transcript) => {
    handleSendMessage(transcript, true);
  };

  const handleEndSession = () => {
    if (socketRef.current) {
      socketRef.current.emit("end-session", sessionId);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <FaExclamationTriangle className="text-red-400 text-4xl mx-auto mb-4" />
          <h2 className="text-white text-xl font-bold mb-2">Session Error</h2>
          <p className="text-slate-400 text-sm mb-4">{error}</p>
          <button
            onClick={() => navigate("/home")}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-500"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const isDoctor = role === "doctor";

  return (
    <div className="h-screen bg-slate-900 flex flex-col">
      {/* Header */}
      <SessionHeader
        session={session}
        currentUserRole={role}
        onEndSession={handleEndSession}
      />

      {/* Connection indicator */}
      {!connected && (
        <div className="bg-yellow-500 bg-opacity-10 border-b border-yellow-500 border-opacity-20 px-4 py-1.5 text-center text-xs text-yellow-400">
          Reconnecting...
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat panel */}
        <div className={`flex flex-col ${isDoctor ? "w-1/2 border-r border-slate-700" : "w-full"}`}>
          <ChatWindow
            messages={messages}
            onSendMessage={handleSendMessage}
            currentUserRole={role}
          />

          {/* Voice recorder (shown for both, but mainly for patient) */}
          {session.status === "active" && (
            <div className="border-t border-slate-700 p-3">
              <VoiceRecorder onTranscriptReady={handleVoiceTranscript} />
            </div>
          )}

          {session.status === "ended" && (
            <div className="border-t border-slate-700 p-4 text-center">
              <p className="text-slate-500 text-sm">This session has ended.</p>
            </div>
          )}
        </div>

        {/* Analysis panel (doctor only) */}
        {isDoctor && (
          <div className="w-1/2 bg-slate-900">
            <TranscriptAnalysis
              sessionId={sessionId}
              messages={messages}
              existingAnalysis={session.mlAnalysis}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSession;
