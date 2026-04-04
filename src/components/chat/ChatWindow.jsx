import { useState, useRef, useEffect } from "react";
import { FaPaperPlane } from "react-icons/fa";
import ChatMessage from "./ChatMessage";

const ChatWindow = ({ messages, onSendMessage, currentUserRole }) => {
  const [text, setText] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSendMessage(trimmed, false);
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500 text-sm">No messages yet. Start the conversation!</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            message={msg}
            isOwnMessage={msg.sender === currentUserRole}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-slate-700 p-3">
        <div className="flex items-end gap-2">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            className="flex-1 bg-slate-800 border border-slate-600 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-400 resize-none text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim()}
            className={`p-2.5 rounded-xl transition-colors ${
              text.trim()
                ? "bg-purple-600 text-white hover:bg-purple-500"
                : "bg-slate-700 text-slate-500"
            }`}
          >
            <FaPaperPlane className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
