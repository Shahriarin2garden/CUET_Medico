import { FaCircle, FaSignOutAlt, FaUserMd, FaUser } from "react-icons/fa";

const SessionHeader = ({ session, currentUserRole, onEndSession }) => {
  const isActive = session?.status === "active";
  const otherName =
    currentUserRole === "doctor" ? session?.patientName : session?.doctorName;
  const otherRole = currentUserRole === "doctor" ? "Patient" : "Doctor";

  return (
    <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center text-white">
          {currentUserRole === "doctor" ? (
            <FaUser className="text-sm" />
          ) : (
            <FaUserMd className="text-sm" />
          )}
        </div>
        <div>
          <p className="text-white font-semibold text-sm">
            {otherName || otherRole}
          </p>
          <div className="flex items-center gap-1.5">
            <FaCircle
              className={`text-[6px] ${isActive ? "text-green-400" : "text-slate-500"}`}
            />
            <span className="text-[11px] text-slate-400">
              {isActive ? "Session Active" : "Session Ended"}
            </span>
          </div>
        </div>
      </div>

      {isActive && (
        <button
          onClick={onEndSession}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300 bg-red-500 bg-opacity-10 hover:bg-opacity-20 border border-red-500 border-opacity-20 rounded-lg px-3 py-1.5 transition-colors"
        >
          <FaSignOutAlt /> End Session
        </button>
      )}
    </div>
  );
};

export default SessionHeader;
