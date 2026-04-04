import { Stethoscope } from "lucide-react";
import React, { useEffect, useState } from "react";
import { FaBarsStaggered, FaXmark } from "react-icons/fa6";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSticky, setSticky] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setSticky(window.scrollY > 0);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    localStorage.removeItem("user");
    navigate("/login");
  };

  const handleMenuToggler = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Get role-based dashboard path
  const getDashboardPath = () => {
    const userData = JSON.parse(localStorage.getItem("user") || "{}");
    const role = userData.role || "student";
    if (role === "admin") return "/dashmenu/dashboard";
    if (role === "doctor") return "/dashmenu/doctor/my-patients";
    return "/dashmenu/student";
  };

  const navItems = [
    { path: "/home", title: "Home" },
    { path: "/appointments", title: "Appointments" },
    { path: "/doctors", title: "Doctors" },
    { path: "/mental-health-analysis", title: "AI Analysis" },
    { path: "/blog", title: "Blog" },
    { path: "/contact", title: "Contact" },
  ];

  return (
    <header className={`max-w-screen-2xl container mx-auto xl:px-24 px-4 top-0 left-0 right-0 ${isSticky ? "shadow-md bg-base-100 transition-all duration-300 ease-in-out" : ""}`}>
      <nav className="flex justify-between items-center py-6">
        <div className="flex items-center">
          <Link to="/home" className="flex items-center space-x-2">
            <Stethoscope className="h-8 w-8 text-primary" />
            <span className="font-bold text-xl text-primary">CUET Medical</span>
          </Link>
        </div>

        <ul className="hidden md:flex gap-12 items-center">
          {navItems.map(({ path, title }) => (
            <li key={path} className="text-base text-primary">
              <NavLink to={path} className={({ isActive }) => (isActive ? "active" : "")}>
                {title}
              </NavLink>
            </li>
          ))}

          {user ? (
            <>
              <li className="text-base text-primary">
                <NavLink to={getDashboardPath()} className={({ isActive }) => (isActive ? "active" : "")}>
                  Dashboard
                </NavLink>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-3 py-1.5 hover:bg-red-600 rounded-lg text-sm"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <li>
              <Link to="/login" className="bg-blue text-white p-2 hover:bg-purple-900 rounded-lg">
                Log In
              </Link>
            </li>
          )}
        </ul>

        <div className="md:hidden block">
          <button onClick={handleMenuToggler}>
            {isMenuOpen ? (
              <FaXmark className="w-5 h-5 text-primary" />
            ) : (
              <FaBarsStaggered className="w-5 h-5 text-primary" />
            )}
          </button>
        </div>
      </nav>

      <div className={`px-4 bg-black py-5 rounded-sm ${isMenuOpen ? "" : "hidden"}`}>
        <ul>
          {navItems.map(({ path, title }) => (
            <li key={path} className="text-base text-white first:text-blue py-1">
              <NavLink to={path} className={({ isActive }) => (isActive ? "active" : "")}>
                {title}
              </NavLink>
            </li>
          ))}
          {user ? (
            <>
              <li className="text-base text-white py-1">
                <NavLink to={getDashboardPath()}>Dashboard</NavLink>
              </li>
              <li className="text-base text-white py-1">
                <button onClick={handleLogout} className="text-red-400">Logout</button>
              </li>
            </>
          ) : (
            <li className="text-base bg-black text-white py-1">
              <Link to="/login" className="text-black bg-blue">Log In</Link>
            </li>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Navbar;
