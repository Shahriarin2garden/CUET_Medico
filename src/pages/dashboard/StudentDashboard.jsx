import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaUserMd, FaIdCard, FaBrain, FaShieldAlt } from 'react-icons/fa';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import ChartCard from '../../components/charts/ChartCard';
import { STATUS_COLORS, RISK_COLORS, CHART_PALETTE } from '../../constants/chartColors';

const StudentDashboard = () => {
    const [appointments, setAppointments] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [screenings, setScreenings] = useState([]);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userEmail = user.email || '';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [aptRes, sessRes, scrRes] = await Promise.all([
                    fetch('/api/appointmentform'),
                    userEmail ? fetch(`/api/chat/sessions?email=${encodeURIComponent(userEmail)}`) : null,
                    userEmail ? fetch(`/api/screenings?email=${encodeURIComponent(userEmail)}`) : null,
                ]);

                if (aptRes.ok) {
                    const all = await aptRes.json();
                    setAppointments(all.filter(a => a.studentEmail === userEmail));
                }
                if (sessRes?.ok) setSessions(await sessRes.json());
                if (scrRes?.ok) setScreenings(await scrRes.json());
            } catch (err) {
                console.error('Failed to load data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [userEmail]);

    const upcomingApts = appointments.filter(a => {
        if (!a.appointmentDay) return false;
        return new Date(a.appointmentDay) >= new Date();
    });
    const pastSessions = sessions.filter(s => s.status === 'ended');

    // --- Chart Data ---
    // Appointment status donut
    const statusCounts = {};
    appointments.forEach(a => {
        const s = a.status || 'pending';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Screening history timeline
    const screeningTimeline = screenings
        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        .map(s => ({
            date: new Date(s.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            score: s.compositeScore || 0,
            risk: s.overallRiskLevel || 'N/A',
        }));

    if (loading) return <div className="p-6 text-gray-400">Loading dashboard...</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <h1 className="text-3xl font-bold mb-6">Student Dashboard</h1>

            {/* Profile Card */}
            <section className="bg-white rounded-xl shadow-sm p-5 mb-6 flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                    {(user.name || 'S')[0]}
                </div>
                <div>
                    <h2 className="text-xl font-semibold">{user.name || 'Student'}</h2>
                    <p className="text-sm text-gray-500">{user.email}</p>
                    <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full capitalize">{user.role || 'student'}</span>
                </div>
                <Link to="/dashmenu/student/my-profile" className="ml-auto text-sm text-purple-600 hover:underline flex items-center gap-1">
                    <FaIdCard /> Edit Profile
                </Link>
            </section>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-purple-600">{appointments.length}</p>
                    <p className="text-xs text-gray-500">Total Appointments</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-green-600">{upcomingApts.length}</p>
                    <p className="text-xs text-gray-500">Upcoming</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-blue-600">{pastSessions.length}</p>
                    <p className="text-xs text-gray-500">Past Sessions</p>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-4 text-center">
                    <p className="text-2xl font-bold text-indigo-600">{screenings.length}</p>
                    <p className="text-xs text-gray-500">Screenings</p>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Appointment Status Donut */}
                <ChartCard title="My Appointments" subtitle="Status breakdown">
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3}>
                                    {statusData.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_PALETTE[i % CHART_PALETTE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-10">No appointments yet</p>
                    )}
                </ChartCard>

                {/* Screening History Timeline */}
                <ChartCard title="Screening History" subtitle="Composite risk score over time">
                    {screeningTimeline.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={screeningTimeline}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v, _, p) => [`${v}% (${p.payload.risk})`, 'Risk Score']} />
                                <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 5, fill: '#8b5cf6' }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center py-8">
                            <FaBrain className="text-gray-300 text-3xl mx-auto mb-2" />
                            <p className="text-gray-400 text-sm">No screenings yet</p>
                            <Link to="/mental-health-screening" className="text-purple-600 text-xs hover:underline mt-1 inline-block">
                                Take your first screening
                            </Link>
                        </div>
                    )}
                </ChartCard>
            </div>

            {/* Latest Screening Result */}
            {screenings.length > 0 && (() => {
                const latest = screenings[screenings.length - 1];
                return (
                    <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
                        <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <FaShieldAlt className="text-purple-500" /> Latest Screening
                        </h2>
                        <div className="flex items-center gap-4 flex-wrap">
                            <div
                                className="px-4 py-2 rounded-full text-white text-sm font-bold"
                                style={{ backgroundColor: RISK_COLORS[latest.overallRiskLevel] || '#6b7280' }}
                            >
                                {latest.overallRiskLevel || 'N/A'} Risk — {latest.compositeScore || 0}%
                            </div>
                            <span className="text-xs text-gray-500">
                                {new Date(latest.createdAt).toLocaleDateString()}
                            </span>
                            {latest.mlPrediction && (
                                <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
                                    AI: {latest.mlPrediction}
                                </span>
                            )}
                            {latest.severityLevel && (
                                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                                    Quiz: {latest.severityLevel}
                                </span>
                            )}
                        </div>
                    </section>
                );
            })()}

            {/* Upcoming Appointments */}
            <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500" /> Upcoming Appointments
                </h2>
                {upcomingApts.length === 0 ? (
                    <div className="text-center py-6 text-gray-400">
                        <p>No upcoming appointments.</p>
                        <Link to="/appointments" className="text-purple-600 hover:underline text-sm mt-1 inline-block">Book an Appointment</Link>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {upcomingApts.map((apt, i) => (
                            <div key={apt._id || i} className="flex items-center justify-between border-b last:border-0 pb-3">
                                <div>
                                    <p className="font-medium flex items-center gap-2">
                                        <FaUserMd className="text-blue-500" /> {apt.doctorName}
                                    </p>
                                    <p className="text-xs text-gray-500">{apt.doctorDesignation}</p>
                                    {apt.reason && <p className="text-xs text-gray-400 mt-0.5">{apt.reason}</p>}
                                </div>
                                <div className="text-right">
                                    <p className="text-sm flex items-center gap-1 justify-end">
                                        <FaCalendarAlt className="text-gray-400" />
                                        {new Date(apt.appointmentDay).toLocaleDateString()}
                                    </p>
                                    <p className="text-xs text-gray-500 flex items-center gap-1 justify-end">
                                        <FaClock className="text-gray-400" /> {apt.selectedTime}
                                    </p>
                                    <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block ${
                                        apt.status === 'confirmed' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'
                                    }`}>
                                        {apt.status || 'pending'}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* Recent Chat Sessions */}
            {pastSessions.length > 0 && (
                <section className="bg-white rounded-xl shadow-sm p-5 mb-6">
                    <h2 className="text-lg font-semibold mb-4">Recent Consultation Sessions</h2>
                    <div className="space-y-3">
                        {pastSessions.slice(0, 5).map((session) => (
                            <div key={session._id} className="flex items-center justify-between border-b last:border-0 pb-3">
                                <div>
                                    <p className="font-medium">{session.doctorName}</p>
                                    <p className="text-xs text-gray-500">
                                        {new Date(session.createdAt).toLocaleDateString()} — {session.messages?.length || 0} messages
                                    </p>
                                    {session.mlAnalysis && (
                                        <span className="text-[10px] bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full mt-1 inline-block">
                                            Analysis: {session.mlAnalysis.prediction}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Quick Links */}
            <section className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Link to="/appointments" className="bg-purple-50 hover:bg-purple-100 rounded-lg p-4 text-center transition">
                        <FaCalendarAlt className="text-purple-600 text-xl mx-auto mb-2" />
                        <p className="text-sm font-medium">Book Appointment</p>
                    </Link>
                    <Link to="/mental-health-screening" className="bg-indigo-50 hover:bg-indigo-100 rounded-lg p-4 text-center transition">
                        <FaBrain className="text-indigo-600 text-xl mx-auto mb-2" />
                        <p className="text-sm font-medium">Screening</p>
                    </Link>
                    <Link to="/doctors" className="bg-blue-50 hover:bg-blue-100 rounded-lg p-4 text-center transition">
                        <FaUserMd className="text-blue-600 text-xl mx-auto mb-2" />
                        <p className="text-sm font-medium">View Doctors</p>
                    </Link>
                    <Link to="/dashmenu/student/my-appointments" className="bg-yellow-50 hover:bg-yellow-100 rounded-lg p-4 text-center transition">
                        <FaClock className="text-yellow-600 text-xl mx-auto mb-2" />
                        <p className="text-sm font-medium">My Appointments</p>
                    </Link>
                </div>
            </section>
        </div>
    );
};

export default StudentDashboard;
