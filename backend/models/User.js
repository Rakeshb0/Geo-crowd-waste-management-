const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'municipality'],
    default: 'user',
  },
  // For municipalities to define their service area
  serviceArea: {
    type: {
      type: String,
      enum: ['Polygon'],
      default: undefined
    },
    coordinates: {
      type: [[[Number]]], // Array of arrays of arrays of numbers
      default: undefined
    }
  }
}, { timestamps: true });

// Pre-save hook to hash password
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for geo queries if role is municipality
userSchema.index({ serviceArea: '2dsphere' });

const User = mongoose.model('User', userSchema);

module.exports = User;
