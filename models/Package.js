const mongoose = require('mongoose');

const PackageSchema = new mongoose.Schema({
  destination: {
    type: String,
    required: true
  },
  images: [{
    type: String
  }],
  duration: {
    type: String, // Changed from String to Number for consistency
    required: true
  },
  pax: {
    type: String, // Changed from String to Number for consistency
    required: true
  },
  fixedDeparture: {
    type: String, // Changed from String to Number for consistency
  },
  price: {
    type: String, // Changed from String to Number for consistency
    required: true
  },
  valid: {
    type: String, // Changed from String to Number for consistency
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['international', 'local', 'fixedDeparture','event']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add virtual id field for URL consistency
PackageSchema.virtual('id').get(function() {
  return this._id.toString();
});

// Ensure virtuals are included when converting to JSON
PackageSchema.set('toJSON', { virtuals: true });
PackageSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Package', PackageSchema);