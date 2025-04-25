const Committee = require('../models/Committee');
const Otp = require('../models/Otp');
const bcrypt = require('bcryptjs');
const sendOtp = require('../utils/sendOtp');
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'yourSecretKey';

exports.register = async (req, res) => {
  const { committeeName, email, facultyEmail, password } = req.body;
  try {
    const existing = await Committee.findOne({ email, facultyEmail });
    if (existing) return res.status(400).json({ msg: 'User already exists' });
    console.log('Sending OTP to:', facultyEmail);
    await sendOtp(facultyEmail);
    res.status(200).json({ msg: 'OTP sent to faculty email' });
  } catch (error) {
    res.status(500).json({ msg: 'Server Error', error });
  }
};
// exports.verifyOtpAndCreate = async (req, res) => {
//   const { committeeName, email, facultyEmail, password, otp } = req.body;

//   try {
//     // 1️⃣ Find the latest OTP
//     const existingOtp = await Otp.findOne({ email: facultyEmail }).sort({ createdAt: -1 });

//     // 2️⃣ Validate OTP
//     if (!existingOtp || existingOtp.otp !== otp) {
//       return res.status(400).json({ msg: 'Invalid or expired OTP' });
//     }

//     // 3️⃣ Check if committee already exists
//     const existingCommittee = await Committee.findOne({ email });
//     if (existingCommittee) {
//       return res.status(400).json({ msg: 'Committee already exists' });
//     }

//     // 4️⃣ Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // 5️⃣ Create and save new committee
//     const newCommittee = new Committee({
//       committeeName,
//       email,
//       facultyEmail,
//       password: hashedPassword,
//     });

//     await newCommittee.save();

//     // 6️⃣ Delete OTP from DB after use
//     await Otp.deleteMany({ email: facultyEmail });

//     // 7️⃣ Generate JWT token
    // const token = jwt.sign(
    //   { email: newCommittee.facultyEmail, committeeId: newCommittee._id },
    //   JWT_SECRET,
    //   { expiresIn: '4h' }
    // );

//     // 8️⃣ Send success response
//     res.json({
//       msg: 'OTP verified successfully',
//       token,
//       committeeId: newCommittee._id,
//       facultyEmail: newCommittee.facultyEmail,
//       committeeName: newCommittee.committeeName
//     });

//   } catch (err) {
//     console.error('❌ Error during verification:', err);
//     res.status(500).json({ msg: 'Server error during OTP verification' });
//   }
// };
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
  const token = jwt.sign(
    { email: newCommittee.facultyEmail, committeeId: newCommittee._id },
    JWT_SECRET,
    { expiresIn: '4h' }
  );
  // 🎉 Step 5: Respond
  res.status(201).json({ msg: 'OTP verified successfully',
          token,
          committeeId: newCommittee._id,
          facultyEmail: newCommittee.facultyEmail,
          committeeName: newCommittee.committeeName
        });

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