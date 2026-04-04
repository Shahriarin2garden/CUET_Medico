import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaVideo,
  FaPlus,
  FaUserInjured,
  FaBrain,
  FaSpinner,
} from "react-icons/fa";

const MyPatients = () => {
  const [sessions, setSessions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorEmail = user.email || "";
  const doctorName = user.name || "Doctor";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch students
        const studRes = await fetch("/all-students");
        if (studRes.ok) {
          const studData = await studRes.json();
          setStudents(studData);
        }

        // Fetch sessions for this doctor
        if (doctorEmail) {
          const sessRes = await fetch(`/api/chat/sessions?email=${encodeURIComponent(doctorEmail)}`);
          if (sessRes.ok) {
            const sessData = await sessRes.json();
            setSessions(sessData);
          }
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [doctorEmail]);

  const startSession = async (patient) => {
    setCreating(patient.email || patient._id);
    try {
      const res = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          doctorName,
          doctorEmail,
          patientName: patient.name || patient.studentName || "Patient",
          patientEmail: patient.email || patient.studentEmail || "",
        }),
      });
      const data = await res.json();
      navigate(`/chat/${data.sessionId}?role=doctor&name=${encodeURIComponent(doctorName)}`);
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setCreating(null);
    }
  };

  const joinSession = (sessionId) => {
    navigate(`/chat/${sessionId}?role=doctor&name=${encodeURIComponent(doctorName)}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Patients</h1>

      {/* Active Sessions */}
      {sessions.filter((s) => s.status === "active").length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-green-600 mb-3 flex items-center gap-2">
            <FaVideo /> Active Sessions
          </h2>
          <div className="grid gap-3">
            {sessions
              .filter((s) => s.status === "active")
              .map((session) => (
                <div
                  key={session._id}
                  className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      <FaUserInjured className="inline mr-2 text-green-500" />
                      {session.patientName}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {session.messages?.length || 0} messages — Started{" "}
                      {new Date(session.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <button
                    onClick={() => joinSession(session._id)}
                    className="bg-green-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-green-500 flex items-center gap-2"
                  >
                    <FaVideo /> Resume
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Past Sessions with Analysis */}
      {sessions.filter((s) => s.status === "ended").length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Past Sessions</h2>
          <div className="grid gap-3">
            {sessions
              .filter((s) => s.status === "ended")
              .map((session) => (
                <div
                  key={session._id}
                  className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between"
                >
                  <div>
                    <p className="font-semibold text-gray-800">{session.patientName}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(session.createdAt).toLocaleDateString()} — {session.messages?.length || 0} messages
                    </p>
                    {session.mlAnalysis && (
                      <span className="inline-flex items-center gap-1 text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full mt-1">
                        <FaBrain /> {session.mlAnalysis.prediction} ({(session.mlAnalysis.confidence * 100).toFixed(0)}%)
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => joinSession(session._id)}
                    className="text-purple-600 border border-purple-300 px-4 py-1.5 rounded-lg text-sm hover:bg-purple-50"
                  >
                    View Details
                  </button>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Patient List — Start new session */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <FaUserInjured /> Registered Students
      </h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : students.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p>No registered students found.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {students.map((student, i) => (
            <div
              key={student._id || i}
              className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between"
            >
              <div>
                <p className="font-semibold text-gray-800">
                  {student.name || student.studentName || "Student"}
                </p>
                <p className="text-sm text-gray-500">
                  {student.email || student.studentEmail || ""}
                </p>
                {student.department && (
                  <p className="text-xs text-gray-400 mt-0.5">{student.department}</p>
                )}
              </div>
              <button
                onClick={() => startSession(student)}
                disabled={creating === (student.email || student._id)}
                className="bg-purple-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-purple-500 flex items-center gap-2 disabled:opacity-50"
              >
                {creating === (student.email || student._id) ? (
                  <FaSpinner className="animate-spin" />
                ) : (
                  <FaPlus className="text-xs" />
                )}
                Start Session
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyPatients;
