import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../firebase/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Try to fetch user role from MongoDB
            let role = 'student';
            let name = user.displayName || email.split('@')[0];

            try {
                // Check if user is a doctor
                const docRes = await fetch('/all-doctors');
                if (docRes.ok) {
                    const doctors = await docRes.json();
                    const doc = doctors.find(d => d.email === user.email);
                    if (doc) {
                        role = 'doctor';
                        name = doc.name || name;
                    }
                }

                // Check if user is a student (if not already found as doctor)
                if (role === 'student') {
                    const studRes = await fetch('/all-students');
                    if (studRes.ok) {
                        const students = await studRes.json();
                        const stud = students.find(s => s.email === user.email);
                        if (stud) {
                            name = stud.name || stud.studentName || name;
                            // Check if they registered as admin
                            if (stud.role === 'admin') role = 'admin';
                        }
                    }
                }
            } catch (e) {
                // Fall back to localStorage if DB fetch fails
                const existingUser = JSON.parse(localStorage.getItem('user') || '{}');
                role = existingUser.role || 'student';
                name = existingUser.name || name;
            }

            localStorage.setItem('user', JSON.stringify({
                uid: user.uid,
                name,
                email: user.email,
                role,
            }));

            navigate('/home');
        } catch (err) {
            if (err.code === 'auth/user-not-found') {
                setError('No account found with this email. Please sign up first.');
            } else if (err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
                setError('Incorrect password. Please try again.');
            } else {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-500">
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-96">
                <h2 className="text-3xl font-bold mb-6 text-center">Login</h2>
                {error && <p className="text-red-500 text-center mb-4 text-sm">{error}</p>}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white p-3 rounded hover:bg-blue-600 transition duration-200"
                    disabled={loading}
                >
                    {loading ? 'Logging in...' : 'Login'}
                </button>
                <div className="mt-4 text-center">
                    <p className="text-gray-600">
                        Don't have an account?{' '}
                        <Link to="/signup" className="text-blue-500 hover:underline">Sign Up</Link>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default Login;
