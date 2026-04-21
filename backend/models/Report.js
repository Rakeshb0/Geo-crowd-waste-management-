const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedMunicipality: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  image: {
    url: { type: String, required: true },
    public_id: { type: String }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
    },
    address: { type: String }
  },
  description: {
    type: String,
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'assigned', 'in-progress', 'completed', 'rejected'],
    default: 'pending',
  },
  aiData: {
    category: { type: String, default: 'General Waste' },
    confidence: { type: Number, default: 0 },
  },
  feedback: {
    rating: { type: Number, min: 1, max: 5 },
    comment: String
  }
}, { timestamps: true });

// Create a 2dsphere index on the location field for geospatial queries
reportSchema.index({ location: '2dsphere' });

const Report = mongoose.model('Report', reportSchema);

module.exports = Report;
