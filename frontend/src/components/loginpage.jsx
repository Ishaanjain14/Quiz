import React from "react";
import { Link, useNavigate } from "react-router-dom";

export const LoginPage = () => {
  const navigate = useNavigate(); // Hook to navigate programmatically

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent form submission
    navigate("/instructions"); // Navigate to instructions page
  };

  return (
    <div className="min-h-screen bg-blue-900 flex flex-col items-center justify-center">
      <header className="w-full bg-white shadow-md py-4 px-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <img
            src="/nta_logo.png"
            alt="National Testing Agency"
            className="h-12"
          />
          <div>
            <h1 className="text-lg font-bold text-blue-900">
              National Testing Agency
            </h1>
            <p className="text-xs text-gray-600">Excellence in Assessment</p>
          </div>
        </div>
        <button className="text-blue-900 font-bold">Home</button>
      </header>

      <div className="bg-white p-8 rounded-lg shadow-lg w-96 mt-10">
        <h2 className="text-lg font-semibold mb-4 text-center">Login (Demo)</h2>
        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium">Username</label>
            <input
              type="text"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Password</label>
            <input
              type="password"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
          >
            LOGIN
          </button>
        </form>
        <p className="text-center text-sm text-red-500 mt-2">
          Click Login To proceed
        </p>
      </div>

      <footer className="text-white mt-10">
        &copy; All Rights Reserved - National Testing Agency
      </footer>
    </div>
  );
};
