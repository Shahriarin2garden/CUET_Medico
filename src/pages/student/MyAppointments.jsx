import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { FaVideo, FaCalendarAlt, FaClock, FaUserMd, FaSpinner, FaComments, FaBrain } from "react-icons/fa";

const MyAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userEmail = user.email || "";
  const userName = user.name || "Patient";

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments for this student
        const aptRes = await fetch("/api/appointmentform");
        if (aptRes.ok) {
          const allApts = await aptRes.json();
          const mine = allApts.filter((a) => a.studentEmail === userEmail);
          setAppointments(mine);
        }

        // Fetch chat sessions for this student
        if (userEmail) {
          const sessRes = await fetch(`/api/chat/sessions?email=${encodeURIComponent(userEmail)}`);
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
  }, [userEmail]);

  const joinSession = (sessionId) => {
    navigate(`/chat/${sessionId}?role=patient&name=${encodeURIComponent(userName)}`);
  };

  // Student can request a session for an appointment
  const requestSession = async (apt) => {
    setRequesting(apt._id);
    try {
      const res = await fetch("/api/chat/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          appointmentId: apt._id,
          doctorName: apt.doctorName || "Doctor",
          doctorEmail: "", // Doctor will see it when they check sessions
          patientName: userName,
          patientEmail: userEmail,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/chat/${data.sessionId}?role=patient&name=${encodeURIComponent(userName)}`);
      }
    } catch (err) {
      console.error("Failed to create session:", err);
    } finally {
      setRequesting(null);
    }
  };

  // Check if an appointment already has an active session
  const getSessionForAppointment = (apt) => {
    return sessions.find(
      (s) => s.appointmentId === apt._id && s.status === "active"
    );
  };

  const activeSessions = sessions.filter((s) => s.status === "active");
  const pastSessions = sessions.filter((s) => s.status === "ended");

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">My Appointments</h1>

      {/* Screening Banner */}
      <Link
        to="/mental-health-screening"
        className="block mb-6 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white hover:from-purple-500 hover:to-indigo-500 transition"
      >
        <div className="flex items-center gap-3">
          <FaBrain className="text-2xl" />
          <div>
            <p className="font-semibold">Take Pre-Appointment Screening</p>
            <p className="text-xs text-purple-200">Complete fun activities & a quiz to help your doctor understand you better</p>
          </div>
          <span className="ml-auto text-sm font-medium">Start →</span>
        </div>
      </Link>

      {/* Active Sessions */}
      {activeSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-purple-600 mb-3 flex items-center gap-2">
            <FaVideo /> Active Consultation Sessions
          </h2>
          <div className="grid gap-3">
            {activeSessions.map((session) => (
              <div
                key={session._id}
                className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    <FaUserMd className="inline mr-2 text-purple-500" />
                    {session.doctorName}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Started: {new Date(session.createdAt).toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-400">
                    {session.messages?.length || 0} messages
                  </p>
                </div>
                <button
                  onClick={() => joinSession(session._id)}
                  className="bg-purple-600 text-white px-5 py-2 rounded-lg font-semibold text-sm hover:bg-purple-500 flex items-center gap-2"
                >
                  <FaVideo /> Join Session
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past Sessions */}
      {pastSessions.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Past Sessions</h2>
          <div className="grid gap-3">
            {pastSessions.map((session) => (
              <div
                key={session._id}
                className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">{session.doctorName}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(session.createdAt).toLocaleDateString()} — {session.messages?.length || 0} messages
                  </p>
                  {session.mlAnalysis && (
                    <span className="inline-block text-[10px] bg-green-100 text-green-600 px-2 py-0.5 rounded-full mt-1">
                      Analysis: {session.mlAnalysis.prediction} ({(session.mlAnalysis.confidence * 100).toFixed(0)}%)
                    </span>
                  )}
                </div>
                <button
                  onClick={() => joinSession(session._id)}
                  className="text-purple-600 border border-purple-300 px-4 py-1.5 rounded-lg text-sm hover:bg-purple-50"
                >
                  View Transcript
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Booked Appointments */}
      <h2 className="text-lg font-semibold text-gray-700 mb-3 flex items-center gap-2">
        <FaCalendarAlt /> Booked Appointments
      </h2>
      {loading ? (
        <div className="text-gray-400 text-sm">Loading...</div>
      ) : appointments.length === 0 ? (
        <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-500">
          <p>No appointments found.</p>
          <p className="text-sm mt-1">Book an appointment from the Appointments page to get started.</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {appointments.map((apt, i) => {
            const existingSession = getSessionForAppointment(apt);
            return (
              <div
                key={apt._id || i}
                className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-gray-800">
                    <FaUserMd className="inline mr-2 text-blue-500" />
                    {apt.doctorName || "Doctor"}
                  </p>
                  <p className="text-sm text-gray-500">{apt.doctorDesignation || ""}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                    <span className="flex items-center gap-1">
                      <FaCalendarAlt /> {apt.appointmentDay ? new Date(apt.appointmentDay).toLocaleDateString() : "N/A"}
                    </span>
                    <span className="flex items-center gap-1">
                      <FaClock /> {apt.selectedTime}
                    </span>
                  </div>
                  {apt.reason && <p className="text-xs text-gray-400 mt-0.5">{apt.reason}</p>}
                </div>
                <div>
                  {existingSession ? (
                    <button
                      onClick={() => joinSession(existingSession._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-500 flex items-center gap-2"
                    >
                      <FaVideo /> Join Session
                    </button>
                  ) : (
                    <button
                      onClick={() => requestSession(apt)}
                      disabled={requesting === apt._id}
                      className="bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-purple-500 flex items-center gap-2 disabled:opacity-50"
                    >
                      {requesting === apt._id ? (
                        <FaSpinner className="animate-spin" />
                      ) : (
                        <FaComments />
                      )}
                      Start Chat
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyAppointments;
