import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters.');
    if (form.password !== form.confirmPassword) return setError('Passwords do not match.');

    setLoading(true);
    try {
      const res = await axios.post(`${API}/api/auth/register`, {
        committeeName: form.committeeName,
        email: form.email,
        facultyEmail: form.facultyEmail,
        password: form.password,
      });
      if (res.status === 200) navigate('/admin/verify-otp', { state: form });
    } catch (err) {
      setError(err.response?.data?.msg || 'Error sending OTP. Please try again.');
    } finally {
      setLoading(false);
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
            <p className="text-xs font-medium uppercase tracking-wider text-[#FFA628] mb-2">Admin</p>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
              Create your account
            </h1>
            <p className="text-sm text-slate-500">Register your committee to start managing events</p>
          </div>

          <form
            onSubmit={handleSendOtp}
            className="bg-white rounded-2xl border border-slate-200 p-8 space-y-4 shadow-sm"
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Committee name</label>
              <input
                type="text"
                name="committeeName"
                value={form.committeeName}
                onChange={handleChange}
                placeholder="e.g. Tech Society"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Committee email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="committee@university.edu"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Faculty email <span className="text-slate-400 font-normal">— receives OTP</span>
              </label>
              <input
                type="email"
                name="facultyEmail"
                value={form.facultyEmail}
                onChange={handleChange}
                placeholder="faculty@university.edu"
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="6+ chars"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Confirm</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter"
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                  required
                />
              </div>
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? 'Sending OTP…' : 'Send OTP'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            Already registered?{' '}
            <Link to="/admin/login" className="text-[#2E5AA7] font-medium hover:underline">
              Log in
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default Register;
