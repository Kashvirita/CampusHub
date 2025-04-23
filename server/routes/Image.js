const express = require('express');
const router = express.Router();
const multer = require('multer');
const { storage } = require('../cloudinary'); // path to cloudinary.js
const authMiddleware = require('../middleware/authMiddleware');

const upload = multer({ storage });

router.post('/',authMiddleware, upload.single('image'), (req, res) => {
    // console.log(req.file);
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'Image upload failed' });
  }

  const imageUrl = req.file.path;
  res.status(200).json({ imageUrl: req.file.path });
 // Return the Cloudinary URL
});

module.exports = router;
