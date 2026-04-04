import { FaMicrophone } from "react-icons/fa";

const ChatMessage = ({ message, isOwnMessage }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} mb-3`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwnMessage
            ? "bg-purple-600 text-white rounded-br-sm"
            : "bg-slate-700 text-slate-200 rounded-bl-sm"
        }`}
      >
        {!isOwnMessage && (
          <p className="text-[10px] text-purple-300 font-semibold mb-0.5">
            {message.senderName}
          </p>
        )}
        {message.isVoiceNote && (
          <span className="inline-flex items-center gap-1 text-[10px] bg-white bg-opacity-15 rounded-full px-2 py-0.5 mb-1">
            <FaMicrophone className="text-[8px]" /> Voice Note
          </span>
        )}
        <p className="text-sm leading-relaxed">{message.text}</p>
        <p
          className={`text-[10px] mt-1 ${
            isOwnMessage ? "text-purple-200" : "text-slate-500"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
