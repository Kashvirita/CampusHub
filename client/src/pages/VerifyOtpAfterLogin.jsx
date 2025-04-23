import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const VerifyOtpAfterLogin = () => {
  const [otp, setOtp] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const navigate = useNavigate();

  const handleVerify = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post('http://localhost:5000/api/auth/login/verify-otp', {
        credentials: 'include',
        facultyEmail,
        otp
      });

      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('committeeId', res.data.committeeId);
      console.log(res.data.committeeId);
      alert('OTP verified successfully!');
      navigate('/admin/dashboard/' + res.data.committeeId);

    } catch (err) {
      alert(err.response?.data?.msg || 'OTP verification failed');
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleVerify}
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-2 text-center">Verify OTP</h2>
        <p className="text-gray-600 text-center mb-6">Check your faculty email for the OTP</p>

        <input
          type="email"
          placeholder="Faculty Email"
          value={facultyEmail}
          onChange={(e) => setFacultyEmail(e.target.value)}
          className="w-full mb-4 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <input
          type="text"
          placeholder="Enter OTP"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full mb-6 p-3 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          required
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          Verify OTP
        </button>
      </form>
    </div>
  );
};

export default VerifyOtpAfterLogin;