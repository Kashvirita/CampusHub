const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
require('dotenv').config();

const sendOtp = async (email) => {
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Save OTP to DB
  await Otp.create({ email, otp });

  // Configure mail
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Your CampusHub OTP',
    text: `Your OTP is ${otp}`,
  };

  await transporter.sendMail(mailOptions);
  return otp;
};

module.exports = sendOtp;
