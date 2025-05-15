// src/components/Navbar.jsx
import React from "react";
import { Link } from "react-router-dom";

const Navbar = ({ user, loading }) => {
  return (
    <nav className="flex justify-center bg-[#1b263b] px-10 py-4 shadow-md text-white space-x-10">
      <Link to="/" className="text-white font-semibold hover:text-gray-300">
        Home
      </Link>
      <Link
        to="/HistorySection"
        className="text-white font-semibold hover:text-gray-300"
      >
        History
      </Link>
      <Link
        to="/TestRunSection"
        className="text-white font-semibold hover:text-gray-300"
      >
        Run Test
      </Link>

      {!loading && (
        <>
          {user ? (
            <Link
              to="/profile"
              className="text-white font-semibold hover:text-gray-300"
            >
              Profile
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-white font-semibold hover:text-gray-300"
            >
              Login/Signup
            </Link>
          )}
        </>
      )}
    </nav>
  );
};

export default Navbar;
