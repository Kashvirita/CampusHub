const nodemailer = require('nodemailer');
const Otp = require('../models/Otp');
require('dotenv').config();

const sendOtp = async (email) => {
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    console.log("Otp being saved", otp);
    await Otp.create({ email, otp });
    console.log(`OTP saved and sent to ${email}: ${otp}`);
    console.log('Email:', process.env.EMAIL);
    console.log('Email Password:', process.env.EMAIL_PASS);
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
    console.log(`OTP successfully sent to ${email}`);
    return otp;
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

module.exports = sendOtp;
