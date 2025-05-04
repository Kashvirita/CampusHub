import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
const API = import.meta.env.VITE_API_BASE_URL;

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(90);
  const [resendEnabled, setResendEnabled] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state;

  useEffect(() => {
    if (!formData) {
      alert('No registration data found. Redirecting to Register.');
      navigate('/admin/register');
    }
  }, [formData, navigate]);

  useEffect(() => {
    let countdown;
    if (timer > 0) {
      countdown = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setResendEnabled(true);
    }
    return () => clearInterval(countdown);
  }, [timer]);

  // const handleVerify = async (e) => {
  //   e.preventDefault();

  //   try {
  //     const res = await axios.post('http://localhost:5000/api/auth/verify-otp', {
  //       ...formData,
  //       otp
  //     });

  //     console.log('Verifying OTP for:', facultyEmail);
  //     console.log('Received OTP:', otp);
  //     console.log('Found OTP record:', existingOtp);

  //     localStorage.setItem('authToken', res.data.token);
  //     localStorage.setItem('committeeId', res.data.committeeId);
  //     console.log(res.data.committeeId);
  //     alert('OTP verified successfully!');
  //     navigate('/admin/dashboard/' + res.data.committeeId);

  //   } catch (err) {
  //     alert(err.response?.data?.msg || 'OTP verification failed');
  //   }
  // };
  const handleVerify = async () => {
    try {
      const payload = { ...formData, otp };

      const res = await axios.post(`${API}/api/auth/verify-otp`, payload);
      
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('committeeId', res.data.committeeId);
      
      console.log(res.data.committeeId);
      if (res.status === 201) {
        alert('OTP Verified! Registration successful.');
        navigate('/admin/dashboard/' + res.data.committeeId); // or login page
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.msg || 'OTP verification failed');
    }
  };
  const handleResendOtp = async () => {
    try {
      await axios.post(`${API}/api/auth/resend-otp`, { facultyEmail: formData.facultyEmail });
      alert('New OTP sent successfully!');
      setTimer(90);
      setResendEnabled(false);
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.msg || 'Failed to resend OTP');
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
        <h2 className="text-xl font-bold mb-4 text-center">Verify OTP</h2>
        <p className="text-sm mb-6 text-center">Enter the OTP sent to your faculty email</p>

        <input
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-2 border rounded mb-4"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Verify OTP
        </button>

        <div className="mt-4 text-center text-sm text-gray-600">
          {resendEnabled ? (
            <button
              onClick={handleResendOtp}
              className="text-blue-600 hover:underline font-medium"
            >
              Resend OTP
            </button>
          ) : (
            <p>Resend available in {timer}s</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VerifyOtp;
