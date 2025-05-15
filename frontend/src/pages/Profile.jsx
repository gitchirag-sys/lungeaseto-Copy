import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

const Profile = ({ user }) => {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token");
      if (!token || !user?.uid) {
        setError("User not logged in.");
        return;
      }

      try {
        const response = await axios.post(
          "/api/getprofile",
          { user_id: user.uid },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setProfile(response.data.profile);
      } catch (err) {
        setError("Failed to load profile.");
        console.error(err.response?.data || err.message);
      }
    };

    fetchProfile();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem("token");
      alert("You have been logged out.");
      navigate("/");
    } catch (err) {
      console.error("Logout failed:", err.message);
    }
  };

  if (error) {
    return <div className="text-center text-red-600 mt-10">{error}</div>;
  }

  if (!profile) {
    return <div className="text-center mt-10">Loading profile...</div>;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>
      <div className="space-y-2 mb-6">
        <p><strong>Name:</strong> {profile.name}</p>
        <p><strong>Phone:</strong> {profile.phone}</p>
        <p><strong>Age:</strong> {profile.age}</p>
        <p><strong>Sex:</strong> {profile.sex}</p>
        <p><strong>Address:</strong> {profile.address}</p>
      </div>
      <div className="text-center">
        <button
          onClick={handleLogout}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
