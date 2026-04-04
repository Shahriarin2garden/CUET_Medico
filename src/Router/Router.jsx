import { createBrowserRouter } from "react-router-dom";
import App from "../App";
import React from 'react';
import Home from "../pages/Home";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import OnlineAppointmentPage from "../pages/AppointmentSchedulingPage";
import AppointmentOverview from "../pages/dashboard/Appointment";
import StudentBooklet from "../pages/dashboard/Booklet";
import AdminDashboard from "../pages/dashboard/AdminDashboard";
import StudentDashboard from "../pages/dashboard/StudentDashboard";
import Appointments from "../pages/Appointments";
import Doctors from "../pages/Doctors";
import ContactPage from "../pages/Contact";
import SignupForm from "../pages/Signup";
import Login from "../pages/Login";
import MedicalHistoryPage from "../pages/MedicalHistoryPage";
import DoctorInfoDashboard from "../pages/dashboard/DoctorInfoDashboard";
import AddDoctor from "../pages/dashboard/AddDoctor";
import DoctorProfile from '../pages/DoctorProfile';
import MyAppointments from '../pages/student/MyAppointments';
import MyProfile from '../pages/student/MyProfile';
import ContactSupport from '../pages/student/ContactSupport';
// import ManageStudents from '../pages/admin/ManageStudents';
import ManageStudents from '../pages/admin/ManageStudents';
import AdminSettings from '../pages/admin/AdminSettings';
import MyPatients from '../pages/doctor/MyPatients';
import PatientHistory from '../pages/doctor/PatientHistory';
import DoctorSettings from '../pages/doctor/DoctorSettings';
import ReportsPage from "../pages/ReportsPage";
import PrescriptionPage from "../pages/PrescriptionPage";
import MentalHealthAnalysis from "../pages/MentalHealthAnalysis";
import MentalHealthScreening from "../pages/MentalHealthScreening";
import ChatSession from "../pages/ChatSession";


const router = createBrowserRouter([
  {
    // Everything is good 
    path: "/",
    element: <App />,  
    children: [
      { path: "/home", element: <Home /> },
      {
        path: "/dashmenu/*", element: <DashboardLayout />,
        children: [
          // Admin Panel
          { path: "dashboard", element: <AdminDashboard /> },
          { path: "appointmentsView", element: <AppointmentOverview /> },
          { path: "doctor-info", element: <DoctorInfoDashboard /> },
          { path: "add-doctor", element: <AddDoctor /> },
          { path: "admin/manage-students", element: <ManageStudents /> },
          { path: 'admin/booklet', element: <StudentBooklet /> },
          { path: "admin/settings", element: <AdminSettings /> },

          // Doctor Panel
          
          { path: "doctor/my-patients", element: <MyPatients /> },
          { path: "doctor/patient-history", element: <PatientHistory /> },
          { path: 'doctor/prescriptions', element: <PrescriptionPage /> },
          { path: 'doctor/reports', element: <ReportsPage /> },
          { path: "doctor/settings", element: <DoctorSettings /> },
          // Student (Patient) Panel
          { path: "student", element: <StudentDashboard /> },
          { path: "student/my-appointments", element: <MyAppointments /> },
          { path: "student/my-profile", element: <MyProfile /> },
          { path: "student/medical-history", element: <MedicalHistoryPage /> },
          { path: "student/contact", element: <ContactSupport /> },
        ]
      }, 
      { path: "/appointments", element: <OnlineAppointmentPage /> },
      { path: "/appointmentform", element: <Appointments /> },
      { path: "/doctors", element: <Doctors /> },
      { path: "/blog", element: <div className="min-h-screen flex items-center justify-center"><h1 className="text-3xl font-bold">Blog — Coming Soon</h1></div> },
      { path: "/contact", element: <ContactPage /> },
      { path: "/login", element: <Login /> },
      { path: "/signup", element: <SignupForm /> },
      // { path: "/medical-history", element: <MedicalHistoryPage /> },
      { path: "/doctor-profile/:id", element: <DoctorProfile /> },
      { path: "/mental-health-analysis", element: <MentalHealthAnalysis /> },
      { path: "/mental-health-screening", element: <MentalHealthScreening /> },
      { path: "/chat/:sessionId", element: <ChatSession /> },
      // { path: 'reports/:patientId', element: <ReportsPage /> },
      // { path: 'prescriptions/:appointmentId', element: <PrescriptionPage /> },
    ]
  }
]);

// const router = createBrowserRouter([
//   {
//     path: "/",
//     element: <App />,
//     children: [
//       {
//         path: "/home", element: <Home />
//       },
//     //   {
//     //     path: "/dashmenu/*", element: <DashboardLayout />,
//     //     children: [
//     //         { path: "/dashboard", element: <DashboardHome /> },
//     //         { path: "/appointments", element: <AppointmentOverview /> },
//     //         { path: "/appointment/:id", element: <AppointmentDetailsPage /> },
//     //         { path: "/booklet", element: <StudentBooklet /> },
//     //         { path: "/admin", element: <AdminDashboard /> },
//     //         { path: "/doctor", element: <DoctorDashboard /> },
//     //         { path: "/student", element: <StudentDashboard /> },
//     //         { path: "*", element: <div>404 Not Found</div> }
//     //     ]
//     //   },
//       { path: "*", element: <div>404 Not Found</div> },
//       { path: "/appointments", element: <OnlineAppointmentPage /> },
//       { path: "/appointmentform", element: <Appointments /> },
//       { path: "/doctors", element: <Doctors /> },
//       { path: "/contact", element: <ContactPage /> },
//       { path: "/login", element: <Login /> },
//       { path: "/signup", element: <SignupForm /> },
//       { }
//     ],
//   },
// ]);

export default router; 