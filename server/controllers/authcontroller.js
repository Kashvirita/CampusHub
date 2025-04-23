const Committee = require('../models/Committee');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const sendOtp = require('../utils/sendOtp');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

exports.register = async (req, res) => {
  const { committeeName, email, facultyEmail, password } = req.body;
  try {
    const existing = await Committee.findOne({ email });
    if (existing) return res.status(400).json({ msg: 'User already exists' });

    await sendOtp(facultyEmail);
    res.status(200).json({ msg: 'OTP sent to faculty email' });
  } catch (error) {
    res.status(500).json({ msg: 'Server Error', error });
  }
};
exports.verifyOtpAndCreate = async (req, res) => {
  const { committeeName, email, facultyEmail, password, otp } = req.body;

  try {
    // 🕵️‍♂️ Step 1: Get the latest OTP for the email (still valid, not expired)
    const existingOtp = await Otp.findOne({ email: facultyEmail }).sort({ createdAt: -1 });

    console.log('📬 Latest Stored OTP:', existingOtp?.otp || 'None found');
    console.log('📝 Received OTP:', otp);

    // ❌ Step 2: Check if OTP is invalid or expired
    if (!existingOtp || existingOtp.otp !== otp) {
      return res.status(400).json({ msg: 'Invalid or expired OTP' });
    }

    // ✅ Step 3: Create committee using pre-save hook to hash password
    const newCommittee = new Committee({
      committeeName,
      email,
      facultyEmail,
      password,
    });

    await newCommittee.save();

    // 🧹 Step 4: Clean up OTPs (optional)
    await Otp.deleteMany({ email: facultyEmail });

    // 🎉 Step 5: Respond
    res.status(201).json({ msg: 'Registration successful' });

  } catch (err) {
    console.error('❌ Error during verification:', err);
    res.status(500).json({ msg: 'Server error during OTP verification' });
  }
};


exports.resendOtp = async (req, res) => {
  const { facultyEmail } = req.body;

  if (!facultyEmail) {
    return res.status(400).json({ msg: 'Faculty email is required' });
  }

  try {
    // Generate and send a new OTP
    const newOtp = await sendOtp(facultyEmail);

    console.log(`📤 OTP resent to ${facultyEmail}: ${newOtp}`);

    res.status(200).json({ msg: 'OTP resent successfully' });
  } catch (error) {
    console.error('❌ Failed to resend OTP:', error);
    res.status(500).json({ msg: 'Failed to resend OTP', error });
  }
};
exports.login = async (req, res) => {
  console.log('📥 Login request received');
  console.log('🧾 Body:', req.body);

  const { committeeName, facultyEmail, password } = req.body;

  try {
    const user = await Committee.findOne({ facultyEmail, committeeName });

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ msg: 'Invalid credentials' });
    }

    console.log(`Sending OTP to ${facultyEmail}`);
    await sendOtp(facultyEmail);  // Log if this line is executed
    console.log('OTP sent successfully');
    
    res.status(200).json({ msg: 'OTP sent successfully' });
  } catch (err) {
    console.error('❌ Server Error:', err);
    res.status(500).json({ msg: 'Server error during OTP verification' });
  }
};
exports.verifyOtpAfterLogin = async (req, res) => {
  const { facultyEmail, otp } = req.body;

  try {
    const user = await Committee.findOne({ facultyEmail });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Verify OTP here (your OTP validation logic)

    // Generate token
    const token = jwt.sign({ email: user.facultyEmail, committeeId: user._id }, JWT_SECRET, {
      expiresIn: '4h',
    });
    console.log(`Generated token: ${token}`);

    // Send the token in the response body instead of setting a cookie
    res.json({
      msg: 'OTP verified successfully',
      token,                 // Send the token in the response
      committeeId: user._id,
      facultyEmail: user.facultyEmail,
      committeeName: user.name || 'Committee'  // Include other relevant data
    });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
exports.logout = (req, res) => {
  res.clearCookie('token');
  res.json({ msg: 'Logged out successfully' });
};