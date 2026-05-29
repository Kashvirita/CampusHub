import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion } from 'framer-motion';
import Navbar from '../components/Navbar';
const API = import.meta.env.VITE_API_BASE_URL;

const Login = () => {
  const [committeeName, setCommitteeName] = useState('');
  const [facultyEmail, setFacultyEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await axios.post(`${API}/api/auth/login`, { committeeName, facultyEmail, password });
      navigate('/admin/login/verify-otp', { state: { facultyEmail } });
    } catch (err) {
      setError(err.response?.data?.msg || 'Login failed. Check your details.');
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
              Welcome back
            </h1>
            <p className="text-sm text-slate-500">Log in to manage your committee events</p>
          </div>

          <form
            onSubmit={handleLogin}
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

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Committee name
              </label>
              <input
                type="text"
                placeholder="e.g. Tech Society"
                value={committeeName}
                onChange={(e) => setCommitteeName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Faculty email
              </label>
              <input
                type="email"
                placeholder="faculty@university.edu"
                value={facultyEmail}
                onChange={(e) => setFacultyEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:border-[#2E5AA7] focus:ring-1 focus:ring-[#2E5AA7] transition"
                required
              />
            </div>

            <motion.button
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E5AA7] hover:bg-[#244a8c] text-white font-medium py-2.5 rounded-lg disabled:opacity-60 disabled:cursor-not-allowed transition-colors mt-2"
            >
              {loading ? 'Sending OTP…' : 'Continue with OTP'}
            </motion.button>
          </form>

          <p className="text-center text-sm text-slate-500 mt-6">
            New here?{' '}
            <Link to="/admin/register" className="text-[#2E5AA7] font-medium hover:underline">
              Create an account
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
