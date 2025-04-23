const express = require('express');
const router = express.Router();
const { register, verifyOtpAndCreate,login,resendOtp,verifyOtpAfterLogin,logout } = require('../controllers/authcontroller');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register); // send OTP
router.post('/verify-otp', verifyOtpAndCreate); // verify + create
router.post('/resend-otp', resendOtp);
router.post('/login', login);
router.post('/login/verify-otp', verifyOtpAfterLogin);
router.get('/logout', logout);

router.get('/protected-data', authMiddleware, (req, res) => {
    res.json({ msg: 'You are authorized!', user: req.user });
});

module.exports = router;
