import React, { useState } from 'react';
import api from '../api';

function Admin() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    email: '', facultyEmail: '', password: '', otp: '', token: ''
  });

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const requestOtp = () => {
    api.post('/auth/signup', form)
      .then(() => setStep(2));
  };

  const verifyOtp = () => {
    api.post('/auth/verify', form)
      .then(res => {
        localStorage.setItem('token', res.data.token);
        setStep(3);
      });
  };

  const createEvent = () => {
    api.post('/events', {
      title: prompt('Event Title'),
      committeeName: prompt('Committee Name'),
      date: prompt('Date (YYYY-MM-DD)'),
      description: prompt('Full Description'),
      imageUrl: prompt('Image URL')
    }, {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
    }).then(() => alert('Event added!'));
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-4">
      {step === 1 && (
        <>
          <h2 className="text-xl font-bold">Committee Signup</h2>
          <input type="email" name="email" placeholder="Committee Email" onChange={handleChange} className="input" />
          <input type="email" name="facultyEmail" placeholder="Faculty Email" onChange={handleChange} className="input" />
          <input type="password" name="password" placeholder="Password" onChange={handleChange} className="input" />
          <button onClick={requestOtp} className="btn">Send OTP</button>
        </>
      )}
      {step === 2 && (
        <>
          <h2 className="text-xl font-bold">Enter OTP</h2>
          <input type="text" name="otp" placeholder="OTP" onChange={handleChange} className="input" />
          <button onClick={verifyOtp} className="btn">Verify & Register</button>
        </>
      )}
      {step === 3 && (
        <>
          <h2 className="text-xl font-bold">Welcome, Admin!</h2>
          <button onClick={createEvent} className="btn">Add New Event</button>
        </>
      )}
    </div>
  );
}

export default Admin;