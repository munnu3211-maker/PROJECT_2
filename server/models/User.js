const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Auth fields
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    minlength: 6,
    select: false, // Don't return password by default
  },
  googleId: {
    type: String,
    sparse: true,
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local',
  },
  avatar: {
    type: String,
    default: '',
  },

  // Profile fields
  name: {
    type: String,
    required: true,
    trim: true,
  },
  age: {
    type: Number,
    min: 17,
    max: 120,
  },
  state: {
    type: String,
    trim: true,
    default: '',
  },
  constituency: {
    type: String,
    trim: true,
    default: '',
  },
  voterStatus: {
    type: String,
    enum: ['registered', 'not_registered', 'applied', 'unknown'],
    default: 'unknown',
  },
  hasVoterId: {
    type: Boolean,
    default: false,
  },
  isFirstTimeVoter: {
    type: Boolean,
    default: false,
  },
  pincode: {
    type: String,
    trim: true,
    default: '',
  },
  readinessScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  profileCompleted: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
