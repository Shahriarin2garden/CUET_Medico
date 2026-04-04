import { Calendar, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Appointments = () => {
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState(null);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [studentInfo, setStudentInfo] = useState({
    studentName: '',
    studentID: '',
    department: '',
    hall: '',
    batchNo: '',
    email: '',
  });

  const navigate = useNavigate();

  // Auto-fill student info from logged-in user
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.email) {
      setStudentInfo(prev => ({
        ...prev,
        studentName: user.name || '',
        email: user.email || '',
      }));
    }
  }, []);

  // Fetch doctors from database
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await fetch('/all-doctors');
        if (res.ok) {
          const data = await res.json();
          setDoctors(data);
        }
      } catch (err) {
        console.error('Failed to fetch doctors:', err);
      } finally {
        setLoadingDoctors(false);
      }
    };
    fetchDoctors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedDoctor) {
      alert('Please select a doctor.');
      return;
    }

    const appointmentDetails = {
      studentName: studentInfo.studentName,
      studentID: studentInfo.studentID,
      studentEmail: studentInfo.email,
      studentDepartment: studentInfo.department,
      studentHall: studentInfo.hall,
      studentBatchNo: studentInfo.batchNo,
      doctorId: selectedDoctor._id,
      doctorName: selectedDoctor.name,
      doctorDesignation: selectedDoctor.designation || selectedDoctor.specialization,
      appointmentDay: selectedDate,
      selectedTime: selectedTime,
    };

    try {
      const response = await fetch('/api/appointmentform', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentDetails),
      });

      const data = await response.json();
      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      alert('An error occurred while booking your appointment.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-8">Book an Appointment</h1>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Appointment Details</h2>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Student Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Student Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Student Name</label>
                  <input
                    type="text"
                    value={studentInfo.studentName}
                    onChange={(e) => setStudentInfo({ ...studentInfo, studentName: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Student ID</label>
                  <input
                    type="text"
                    value={studentInfo.studentID}
                    onChange={(e) => setStudentInfo({ ...studentInfo, studentID: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Department</label>
                  <input
                    type="text"
                    value={studentInfo.department}
                    onChange={(e) => setStudentInfo({ ...studentInfo, department: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Hall</label>
                  <input
                    type="text"
                    value={studentInfo.hall}
                    onChange={(e) => setStudentInfo({ ...studentInfo, hall: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Batch No.</label>
                  <input
                    type="text"
                    value={studentInfo.batchNo}
                    onChange={(e) => setStudentInfo({ ...studentInfo, batchNo: e.target.value })}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email Address</label>
                  <input
                    type="email"
                    value={studentInfo.email}
                    onChange={(e) => setStudentInfo({ ...studentInfo, email: e.target.value })}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Doctor Selection */}
            <div>
              <label className="block text-sm font-medium mb-1">Select a Doctor</label>
              {loadingDoctors ? (
                <p className="text-gray-400 text-sm">Loading doctors...</p>
              ) : (
                <select
                  value={selectedDoctor ? selectedDoctor._id : ''}
                  onChange={(e) => {
                    const selected = doctors.find(doc => doc._id === e.target.value);
                    setSelectedDoctor(selected || null);
                  }}
                  className="w-full p-2 border rounded-md"
                  required
                >
                  <option value="">Choose a doctor</option>
                  {doctors.map(doctor => (
                    <option key={doctor._id} value={doctor._id}>
                      {doctor.name} — {doctor.designation || doctor.specialization}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Doctor Information (Display after selecting) */}
            {selectedDoctor && (
              <div className="bg-gray-50 p-4 rounded-md shadow-md mt-4">
                <h3 className="font-semibold mb-2">Doctor Information</h3>
                <div className="flex items-center space-x-4">
                  {selectedDoctor.image ? (
                    <img src={selectedDoctor.image} alt={selectedDoctor.name} className="w-16 h-16 rounded-full object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xl">
                      {(selectedDoctor.name || 'D')[0]}
                    </div>
                  )}
                  <div>
                    <h4 className="text-lg font-medium">{selectedDoctor.name}</h4>
                    <p className="text-sm text-gray-600">{selectedDoctor.designation}</p>
                    <p className="text-sm text-gray-500">{selectedDoctor.specialization} — {selectedDoctor.department}</p>
                    {selectedDoctor.phone && <p className="text-xs text-gray-400 mt-1">{selectedDoctor.phone}</p>}
                    {selectedDoctor.rating && (
                      <p className="text-xs text-yellow-500 mt-0.5">Rating: {selectedDoctor.rating} / 5</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Appointment Date and Time */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-1">Select Date</label>
              <div className="relative">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full p-2 border rounded-md pl-10"
                  required
                />
                <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Select Time</label>
              <div className="relative">
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full p-2 border rounded-md pl-10"
                  required
                >
                  <option value="">Choose a time</option>
                  <option value="9 AM - 4 PM">9 AM - 4 PM</option>
                  <option value="3 PM - 9 PM">3 PM - 9 PM</option>
                  <option value="9 PM - 9 AM">9 PM - 9 AM</option>
                </select>
                <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-primary text-white py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Book Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Appointments;
