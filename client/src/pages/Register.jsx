import React, { useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
const API = import.meta.env.VITE_API_BASE_URL;

function Register() {
  const [form, setForm] = useState({
    committeeName: '',
    email: '',
    facultyEmail: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSendOtp = async () => {
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        committeeName: form.committeeName,
        email: form.email,
        facultyEmail: form.facultyEmail,
        password: form.password,
      });
  
      if (res.status === 200) {
        alert('OTP sent to faculty email');
        navigate('/admin/verify-otp', { state: form }); // send form data to OTP page
      }
    } catch (error) {
      alert(error.response?.data?.msg || 'Error sending OTP');
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Create Account</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Create your account to manage events efficiently
        </p>

        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <div className="space-y-4">
          <input
            type="text"
            name="committeeName"
            value={form.committeeName}
            onChange={handleChange}
            placeholder="Enter your committee name"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Your official email address"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            name="facultyEmail"
            value={form.facultyEmail}
            onChange={handleChange}
            placeholder="Your faculty email for OTP"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            name="confirmPassword"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Re-enter your password"
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            onClick={handleSendOtp}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-md transition duration-300"
          >
            {loading ? 'Sending OTP...' : 'Send OTP'}
          </button>
        </div>

        <p className="mt-4 text-center text-sm text-gray-600">
          Already registered? <Link  to= "/admin/login" className="text-blue-600 hover:underline">Log in</Link>
        </p>
      </div>
    </div>
    </div>
  );
}

export default Register;
