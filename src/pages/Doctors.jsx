import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaCalendarAlt, FaPhoneAlt, FaEnvelope, FaSearch } from 'react-icons/fa';

const Doctors = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [selectedSpecialization, setSelectedSpecialization] = useState('');
    const [selectedRating, setSelectedRating] = useState(0);

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

    const specializations = [...new Set(doctors.map(d => d.specialization).filter(Boolean))];

    const filteredDoctors = doctors.filter(doctor =>
        (doctor.name || '').toLowerCase().includes(search.toLowerCase()) &&
        (selectedSpecialization ? doctor.specialization === selectedSpecialization : true) &&
        (selectedRating ? (doctor.rating || 0) >= selectedRating : true)
    );

    return (
        <div className="bg-gradient-to-r from-blue-100 via-blue-200 to-white min-h-screen">
            {/* Hero Section */}
            <section
                className="h-screen flex items-center justify-center relative bg-cover bg-center"
                style={{
                    backgroundImage: "url('https://as1.ftcdn.net/v2/jpg/01/38/63/26/1000_F_138632656_V6qMgqGkROC606StfhSOXgbGRw62R04n.jpg')",
                }}
            >
                <div className="absolute inset-0 bg-blue-600 bg-opacity-40"></div>
                <div className="flex items-center justify-between w-full max-w-screen-lg mx-auto px-6 relative z-10">
                    <div className="text-center md:text-left md:w-1/2 -ml-10">
                        <h1 className="text-5xl font-bold mb-4 text-white">Meet Your Healthcare Provider</h1>
                        <p className="text-lg mb-6 text-gray-200">
                            Find the right doctor for your needs. Whether it's a routine check-up or an emergency, we're here to help.
                        </p>
                        <p className="text-sm mb-8 text-gray-300">Our experts are available for consultations today. Book your appointment now!</p>
                        <div className="space-x-4">
                            <Link to="/appointments" className="inline-block bg-white text-blue-600 px-6 py-3 rounded-md shadow-lg hover:shadow-xl hover:bg-gray-100 animate-pulse">
                                Book an Appointment
                            </Link>
                        </div>
                    </div>
                    <div className="hidden md:block">
                        <img
                            src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&q=80&w=400&h=400"
                            alt="Doctor"
                            className="rounded-full shadow-2xl border-4 border-white"
                        />
                    </div>
                </div>
            </section>

            {/* Filtering Section */}
            <section className="py-12">
                <div className="text-center mb-8 py-8 px-4">
                    <h2 className="text-4xl font-bold mb-4">Find the Best Doctors</h2>
                    <p className="text-lg text-teal-800">
                        Use the filters to find the best healthcare provider for your needs
                    </p>
                </div>

                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4 px-6">
                    <div className="w-full md:w-1/3">
                        <input
                            type="text"
                            className="p-3 rounded-full border border-gray-300 w-full focus:ring-2 focus:ring-blue-400"
                            placeholder="Search Doctors..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="w-full md:w-1/3">
                        <select
                            className="p-3 rounded-full border border-gray-300 w-full focus:ring-2 focus:ring-blue-400"
                            value={selectedSpecialization}
                            onChange={(e) => setSelectedSpecialization(e.target.value)}
                        >
                            <option value="">All Specializations</option>
                            {specializations.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                    <div className="w-full md:w-1/3">
                        <select
                            className="p-3 rounded-full border border-gray-300 w-full focus:ring-2 focus:ring-blue-400"
                            value={selectedRating}
                            onChange={(e) => setSelectedRating(parseInt(e.target.value))}
                        >
                            <option value={0}>All Ratings</option>
                            <option value={4}>4+ Stars</option>
                            <option value={4.5}>4.5+ Stars</option>
                        </select>
                    </div>
                </div>
            </section>

            {/* Doctors List */}
            <section className="py-12">
                {loading ? (
                    <p className="text-center text-gray-400">Loading doctors...</p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto px-6">
                        {filteredDoctors.map((doctor, i) => (
                            <div key={doctor._id || i} className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
                                <div className="flex flex-col items-center">
                                    {doctor.image ? (
                                        <img src={doctor.image} alt={doctor.name} className="w-24 h-24 rounded-full mb-4 object-cover" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full mb-4 bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-3xl">
                                            {(doctor.name || 'D')[0]}
                                        </div>
                                    )}
                                    <h3 className="text-xl font-semibold mb-1">{doctor.name}</h3>
                                    <p className="text-sm text-purple-600 font-medium mb-1">{doctor.designation}</p>
                                    <p className="text-sm text-gray-600 mb-2">{doctor.specialization}</p>
                                    {doctor.rating && (
                                        <div className="flex items-center mb-2">
                                            <FaStar className="text-yellow-400" />
                                            <span className="ml-1 text-sm">{doctor.rating} Stars</span>
                                        </div>
                                    )}
                                    <p className="text-sm text-gray-500 mb-1">
                                        <FaCalendarAlt className="inline-block mr-1" />
                                        {doctor.available !== false ? 'Available' : 'Currently Unavailable'}
                                    </p>
                                    {doctor.phone && (
                                        <p className="text-xs text-gray-400">
                                            <FaPhoneAlt className="inline-block mr-1" /> {doctor.phone}
                                        </p>
                                    )}
                                    {doctor.email && (
                                        <p className="text-xs text-gray-400 mb-3">
                                            <FaEnvelope className="inline-block mr-1" /> {doctor.email}
                                        </p>
                                    )}
                                    <Link
                                        to={`/doctor-profile/${doctor._id}`}
                                        className="bg-blue-500 text-white py-2 px-6 rounded-full hover:bg-blue-600 transition-all duration-300"
                                    >
                                        View Profile
                                    </Link>
                                </div>
                            </div>
                        ))}
                        {filteredDoctors.length === 0 && (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                No doctors found matching your criteria.
                            </div>
                        )}
                    </div>
                )}
            </section>
        </div>
    );
};

export default Doctors;
