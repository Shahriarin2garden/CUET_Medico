import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    FaHome, FaCalendarAlt, FaBook, FaUserMd, FaUserGraduate,
    FaUserPlus, FaUsers, FaCog, FaClipboardList, FaFileMedical,
    FaPrescriptionBottleAlt, FaChartBar, FaHeadset, FaIdCard, FaHistory, FaBrain
} from 'react-icons/fa';

const adminItems = [
    { to: "/dashmenu/dashboard", icon: <FaHome className="mr-3" />, label: "Dashboard" },
    { to: "/dashmenu/appointmentsView", icon: <FaCalendarAlt className="mr-3" />, label: "Appointments" },
    { to: "/dashmenu/doctor-info", icon: <FaUserMd className="mr-3" />, label: "Doctor Info" },
    { to: "/dashmenu/add-doctor", icon: <FaUserPlus className="mr-3" />, label: "Add Doctor" },
    { to: "/dashmenu/admin/manage-students", icon: <FaUsers className="mr-3" />, label: "Manage Students" },
    { to: "/dashmenu/admin/booklet", icon: <FaBook className="mr-3" />, label: "Booklet" },
    { to: "/dashmenu/admin/settings", icon: <FaCog className="mr-3" />, label: "Settings" },
];

const doctorItems = [
    { to: "/dashmenu/doctor/my-patients", icon: <FaUsers className="mr-3" />, label: "My Patients" },
    { to: "/dashmenu/doctor/patient-history", icon: <FaHistory className="mr-3" />, label: "Patient History" },
    { to: "/dashmenu/doctor/prescriptions", icon: <FaPrescriptionBottleAlt className="mr-3" />, label: "Prescriptions" },
    { to: "/dashmenu/doctor/reports", icon: <FaChartBar className="mr-3" />, label: "Reports" },
    { to: "/dashmenu/doctor/settings", icon: <FaCog className="mr-3" />, label: "Settings" },
];

const studentItems = [
    { to: "/dashmenu/student", icon: <FaHome className="mr-3" />, label: "Dashboard" },
    { to: "/dashmenu/student/my-appointments", icon: <FaCalendarAlt className="mr-3" />, label: "My Appointments" },
    { to: "/dashmenu/student/my-profile", icon: <FaIdCard className="mr-3" />, label: "My Profile" },
    { to: "/mental-health-screening", icon: <FaBrain className="mr-3" />, label: "Health Screening" },
    { to: "/dashmenu/student/medical-history", icon: <FaFileMedical className="mr-3" />, label: "Medical History" },
    { to: "/dashmenu/student/contact", icon: <FaHeadset className="mr-3" />, label: "Contact Support" },
];

const roleConfig = {
    admin: { items: adminItems, title: "Admin Panel", color: "text-red-400" },
    doctor: { items: doctorItems, title: "Doctor Panel", color: "text-green-400" },
    student: { items: studentItems, title: "Student Panel", color: "text-blue-400" },
};

const DashboardSidebar = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'student';
    const config = roleConfig[role] || roleConfig.student;

    return (
        <div className="w-64 bg-gray-900 text-white min-h-screen p-6 shadow-lg">
            <h2 className="text-xl font-bold mb-2 text-center">{user.name || 'User'}</h2>
            <p className={`text-xs text-center mb-6 ${config.color} font-semibold uppercase tracking-wide`}>
                {config.title}
            </p>
            <ul>
                {config.items.map((item, index) => (
                    <li key={index} className="mb-2">
                        <NavLink
                            to={item.to}
                            className={({ isActive }) =>
                                `flex items-center p-3 rounded-lg transition-colors duration-200 hover:bg-gray-700 ${isActive ? 'bg-gray-700 border-l-4 border-purple-500' : ''}`
                            }
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default DashboardSidebar;
