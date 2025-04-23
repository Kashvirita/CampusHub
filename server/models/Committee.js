const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const committeeSchema = new mongoose.Schema({
  committeeName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: false,
  },
  facultyEmail: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

committeeSchema.pre('save', async function (next) {
  // Only hash if the password is new or modified
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    return next();
  } catch (err) {
    return next(err);
  }
});

// Add pre-save validation to ensure that the email is not already in the database if it is set as unique
// committeeSchema.pre('save', async function (next) {
//   try {
//     const existingFaculty = await mongoose.model('Committee').findOne({ facultyEmail: this.facultyEmail });
//     if (existingFaculty) {
//       const err = new Error('Faculty Email already exists');
//       return next(err);
//     }
//     next();
//   } catch (err) {
//     return next(err);
//   }
// });

module.exports = mongoose.model('Committee', committeeSchema);