// src/App.jsx

import React, { useEffect, useState } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "./firebase";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import Profile from "./pages/Profile";

import Navbar from "./components/Navbar";
import ProfileForm from "./components/ProfileForm";
import HistorySection from "./components/HistorySection";
import TestRunSection from "./components/TestRunSection";

function AppWrapper() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [profileCompleted, setProfileCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      if (user) {
        const token = await user.getIdToken();
        localStorage.setItem("token", token);

        const justSignedUp = localStorage.getItem("justSignedUp");
        const cachedProfile = localStorage.getItem("profileCompleted");

        //  Handle post-signup redirect
        if (justSignedUp === "true") {
          localStorage.removeItem("justSignedUp");
          setProfileCompleted(false);
          navigate("/complete-profile");
          setLoading(false);
          return;
        }

        //  Cached profile info
        if (cachedProfile === "true") {
          setProfileCompleted(true);
          setLoading(false);
          return;
        }

        //  Fetch from backend
        try {
          const res = await fetch("http://127.0.0.1:5000/profile", {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (res.ok) {
            localStorage.setItem("profileCompleted", "true");
            setProfileCompleted(true);
            navigate("/");
          } else {
            localStorage.removeItem("profileCompleted");
            setProfileCompleted(false);
            navigate("/complete-profile");
          }
        } catch (error) {
          localStorage.removeItem("profileCompleted");
          setProfileCompleted(false);
          navigate("/complete-profile");
        }
      } else {
        setProfileCompleted(false);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <>
      <Navbar user={user} profileCompleted={profileCompleted} />
      <Routes>
        <Route path="/" element={<Home user={user} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/complete-profile"
          element={
            user ? <ProfileForm user={user} /> : <Navigate to="/login" />
          }
        />
        <Route
          path="/profile"
          element={user ? <Profile user={user} /> : <Navigate to="/login" />}
        />
        <Route
          path="/HistorySection"
          element={<HistorySection user={user} />}
        />
        <Route
          path="/TestRunSection"
          element={<TestRunSection user={user} />}
        />
      </Routes>
    </>
  );
}

// Wrap App with Router since we use useNavigate
function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}

export default App;
