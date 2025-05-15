// src/components/ProfileForm.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const ProfileForm = ({ user }) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    name: "",
    phone: "",
    age: "",
    sex: "",
    address: "",
  });

  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Token missing. Please login again.");
        return;
      }

      const response = await axios.post(
        "/api/saveprofile",
        {
          user_id: user?.uid,
          ...profile,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setSuccess(true);
        localStorage.removeItem("justSignedUp"); // Remove signup flag
      } else {
        throw new Error("Unexpected response");
      }
    } catch (error) {
      console.error("Profile save failed:", error.response?.data || error.message);
      alert("Failed to save profile. Please try again.\n" + (error.response?.data?.error || error.message));
    }
  };

  const handleRedirect = () => {
    navigate("/");
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow">
      {!success ? (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">Complete Your Profile</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {["name", "phone", "age", "sex", "address"].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-gray-700">
                  {field.charAt(0).toUpperCase() + field.slice(1)}
                </label>
                <input
                  type={field === "age" ? "number" : "text"}
                  name={field}
                  value={profile[field]}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded px-3 py-2"
                />
              </div>
            ))}
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded w-full">
              Save Profile
            </button>
          </form>
        </>
      ) : (
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-green-600">✅ Profile saved successfully!</h2>
          <button onClick={handleRedirect} className="bg-blue-600 text-white px-6 py-2 rounded">
            OK
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileForm;
