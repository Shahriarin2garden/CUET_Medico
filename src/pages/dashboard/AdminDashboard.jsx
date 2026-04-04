import { useState, useEffect } from 'react';
import { FaUserMd, FaUserGraduate, FaCalendarAlt, FaCheckCircle, FaClock, FaChartPie } from 'react-icons/fa';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import ChartCard from '../../components/charts/ChartCard';
import { STATUS_COLORS, CHART_PALETTE } from '../../constants/chartColors';

const AdminDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [students, setStudents] = useState([]);
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [docRes, studRes, aptRes] = await Promise.all([
                    fetch('/all-doctors'),
                    fetch('/all-students'),
                    fetch('/api/appointmentform'),
                ]);
                if (docRes.ok) setDoctors(await docRes.json());
                if (studRes.ok) setStudents(await studRes.json());
                if (aptRes.ok) setAppointments(await aptRes.json());
            } catch (err) {
                console.error('Failed to load dashboard data:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const confirmedApts = appointments.filter(a => a.status === 'confirmed');
    const pendingApts = appointments.filter(a => a.status !== 'confirmed');

    const stats = [
        { label: 'Doctors', value: doctors.length, icon: <FaUserMd />, color: 'bg-blue-500' },
        { label: 'Students', value: students.length, icon: <FaUserGraduate />, color: 'bg-green-500' },
        { label: 'Total Appointments', value: appointments.length, icon: <FaCalendarAlt />, color: 'bg-purple-500' },
        { label: 'Confirmed', value: confirmedApts.length, icon: <FaCheckCircle />, color: 'bg-emerald-500' },
        { label: 'Pending', value: pendingApts.length, icon: <FaClock />, color: 'bg-yellow-500' },
    ];

    // --- Chart Data ---
    // Appointment status donut
    const statusCounts = {};
    appointments.forEach(a => {
        const s = a.status || 'pending';
        statusCounts[s] = (statusCounts[s] || 0) + 1;
    });
    const statusData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));

    // Appointments per doctor bar
    const doctorCounts = {};
    appointments.forEach(a => {
        const d = a.doctorName || 'Unknown';
        doctorCounts[d] = (doctorCounts[d] || 0) + 1;
    });
    const doctorBarData = Object.entries(doctorCounts)
        .map(([name, count]) => ({ name: name.split(' ').slice(-1)[0], count, fullName: name }))
        .sort((a, b) => b.count - a.count);

    // Appointments over time (by date)
    const dateCounts = {};
    appointments.forEach(a => {
        if (a.appointmentDay) {
            const d = new Date(a.appointmentDay).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            dateCounts[d] = (dateCounts[d] || 0) + 1;
        }
    });
    const timelineData = Object.entries(dateCounts)
        .map(([date, count]) => ({ date, count }));

    if (loading) return <div className="p-6 text-gray-400">Loading dashboard...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {stats.map((s, i) => (
                    <div key={i} className="bg-white rounded-xl shadow-sm p-5 flex items-center gap-4">
                        <div className={`${s.color} text-white p-3 rounded-lg text-xl`}>{s.icon}</div>
                        <div>
                            <p className="text-2xl font-bold">{s.value}</p>
                            <p className="text-xs text-gray-500">{s.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
                {/* Appointment Status Donut */}
                <ChartCard title="Appointment Status" subtitle="Distribution by status">
                    {statusData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <PieChart>
                                <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                    {statusData.map((entry, i) => (
                                        <Cell key={i} fill={STATUS_COLORS[entry.name] || CHART_PALETTE[i % CHART_PALETTE.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-10">No data</p>
                    )}
                </ChartCard>

                {/* Appointments per Doctor */}
                <ChartCard title="Appointments per Doctor" subtitle="Top doctors by appointment count">
                    {doctorBarData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={doctorBarData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip formatter={(v, _, p) => [v, p.payload.fullName]} />
                                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                                    {doctorBarData.map((_, i) => (
                                        <Cell key={i} fill={CHART_PALETTE[i % CHART_PALETTE.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-10">No data</p>
                    )}
                </ChartCard>

                {/* Timeline Area */}
                <ChartCard title="Appointments Over Time" subtitle="Appointments by scheduled date">
                    {timelineData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <AreaChart data={timelineData}>
                                <defs>
                                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Area type="monotone" dataKey="count" stroke="#8b5cf6" fill="url(#areaGrad)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <p className="text-gray-400 text-sm text-center py-10">No data</p>
                    )}
                </ChartCard>
            </div>

            {/* Recent Appointments */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <FaCalendarAlt className="text-purple-500" /> Recent Appointments
                </h2>
                {appointments.length === 0 ? (
                    <p className="text-gray-400 text-sm">No appointments yet.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left text-gray-500 border-b">
                                    <th className="pb-2">Student</th>
                                    <th className="pb-2">Doctor</th>
                                    <th className="pb-2">Date</th>
                                    <th className="pb-2">Time</th>
                                    <th className="pb-2">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {appointments.slice(0, 10).map((apt, i) => (
                                    <tr key={apt._id || i} className="border-b last:border-0">
                                        <td className="py-3 font-medium">{apt.studentName}</td>
                                        <td className="py-3">{apt.doctorName}</td>
                                        <td className="py-3">{apt.appointmentDay ? new Date(apt.appointmentDay).toLocaleDateString() : 'N/A'}</td>
                                        <td className="py-3">{apt.selectedTime}</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                                apt.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                                {apt.status || 'pending'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Doctor & Student Lists */}
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaUserMd className="text-blue-500" /> Registered Doctors
                    </h2>
                    {doctors.map((doc, i) => (
                        <div key={doc._id || i} className="flex items-center gap-3 py-2 border-b last:border-0">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                                {(doc.name || 'D')[0]}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{doc.name}</p>
                                <p className="text-xs text-gray-500">{doc.specialization || doc.designation}</p>
                            </div>
                            <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${doc.available !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {doc.available !== false ? 'Available' : 'Unavailable'}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6">
                    <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <FaUserGraduate className="text-green-500" /> Registered Students
                    </h2>
                    {students.map((stud, i) => (
                        <div key={stud._id || i} className="flex items-center gap-3 py-2 border-b last:border-0">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                                {(stud.name || stud.studentName || 'S')[0]}
                            </div>
                            <div>
                                <p className="font-medium text-sm">{stud.name || stud.studentName}</p>
                                <p className="text-xs text-gray-500">{stud.department} — Batch {stud.batch}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
