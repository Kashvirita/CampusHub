import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
const API = import.meta.env.VITE_API_BASE_URL;

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(90);
  const [resendEnabled, setResendEnabled] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const formData = location.state;

  useEffect(() => {
    if (!formData) navigate('/admin/register');
  }, [formData, navigate]);

  useEffect(() => {
    let countdown;
    if (timer > 0) countdown = setInterval(() => setTimer((p) => p - 1), 1000);
    else setResendEnabled(true);
    return () => clearInterval(countdown);
  }, [timer]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/verify-otp`, { ...formData, otp });
      localStorage.setItem('authToken', res.data.token);
      localStorage.setItem('committeeId', res.data.committeeId);
      if (res.status === 201) navigate('/admin/dashboard/' + res.data.committeeId);
    } catch (err) {
      setError(err.response?.data?.msg || 'OTP verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    try {
      await axios.post(`${API}/api/auth/resend-otp`, { facultyEmail: formData.facultyEmail });
      setTimer(90);
      setResendEnabled(false);
    } catch (err) {
      setError(err.response?.data?.msg || 'Failed to resend OTP.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-6 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[#FFA628]/15 mb-4">
              <span className="text-[#FFA628] text-xl">✉</span>
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              Check your email
            </h1>
            <p className="text-sm text-slate-500">
              We sent a 6-digit code to <span className="font-medium text-slate-700">{formData?.facultyEmail}</span>
            </p>
          </div>

          <form
            onSubmit={handleVerify}
            className="bg-white rounded-2xl border border-slate-200 p-8 space-y-5 shadow-sm"
          >
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-100 text-red-700 text-sm px-3 py-2.5 rounded-lg"
              >
                {error}
              </motion.div>
            )}

            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="• • • • • •"
              className="w-full px-4 py-3.5 text-center text-2xl tracking-[0.8em] font-semibold text-slate-900 bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
              required
              autoFocus
            />

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Verifying…' : 'Verify & Create Account'}
            </motion.button>

            <div className="text-center text-sm">
              {resendEnabled ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-[#2E5AA7] font-medium hover:underline"
                >
                  Resend code
                </button>
              ) : (
                <p className="text-slate-500">
                  Resend in <span className="text-slate-900 font-medium">{timer}s</span>
                </p>
              )}
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default VerifyOtp;
