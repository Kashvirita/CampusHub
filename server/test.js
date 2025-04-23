require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

const mailOptions = {
  from: process.env.EMAIL,
  to: 'kashvi.ritaa.201145@gmail.com',
  subject: 'Testing App Password',
  text: 'If you got this, app password works!',
};

transporter.sendMail(mailOptions, (err, info) => {
  if (err) {
    return console.log("❌ Failed:", err);
  }
  console.log("✅ Email sent:", info.response);
});