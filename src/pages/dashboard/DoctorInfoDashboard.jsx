import { useState, useEffect } from 'react';
import { FaUserMd, FaStar, FaPhone, FaEnvelope, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const DoctorInfoDashboard = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch('/all-doctors');
                if (res.ok) setDoctors(await res.json());
            } catch (err) {
                console.error('Failed to fetch doctors:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    if (loading) return <div className="p-6 text-gray-400">Loading doctors...</div>;

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Doctor Information</h1>
            <p className="text-gray-500 mb-6">{doctors.length} doctors registered in the system</p>

            <div className="grid md:grid-cols-2 gap-5">
                {doctors.map((doc, i) => (
                    <div key={doc._id || i} className="bg-white rounded-xl shadow-sm p-5 flex gap-4">
                        {doc.image ? (
                            <img src={doc.image} alt={doc.name} className="w-20 h-20 rounded-full object-cover" />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-2xl">
                                {(doc.name || 'D')[0]}
                            </div>
                        )}
                        <div className="flex-1">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-semibold">{doc.name}</h3>
                                <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ${
                                    doc.available !== false ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    {doc.available !== false ? <><FaCheckCircle /> Available</> : <><FaTimesCircle /> Unavailable</>}
                                </span>
                            </div>
                            <p className="text-sm text-purple-600 font-medium">{doc.designation}</p>
                            <p className="text-sm text-gray-500">{doc.specialization} — {doc.department}</p>
                            {doc.rating && (
                                <div className="flex items-center gap-1 mt-1 text-yellow-500 text-sm">
                                    <FaStar /> {doc.rating}
                                </div>
                            )}
                            <div className="mt-2 flex gap-4 text-xs text-gray-400">
                                {doc.phone && <span className="flex items-center gap-1"><FaPhone /> {doc.phone}</span>}
                                {doc.email && <span className="flex items-center gap-1"><FaEnvelope /> {doc.email}</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {doctors.length === 0 && (
                <div className="bg-gray-50 rounded-xl p-8 text-center text-gray-400">
                    No doctors registered yet. Add doctors from the "Add Doctor" page.
                </div>
            )}
        </div>
    );
};

export default DoctorInfoDashboard;
