const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
    index: true
  },
  countryUrdu: {
    type: String,
    trim: true
  },
  province: {
    type: String,
    required: [true, 'Province is required'],
    trim: true,
    index: true
  },
  provinceUrdu: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: [true, 'City is required'],
    trim: true,
    index: true
  },
  cityUrdu: {
    type: String,
    trim: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, {
  timestamps: true
});

locationSchema.index({ country: 1, province: 1, city: 1 }, { unique: true });

module.exports = mongoose.model('Location', locationSchema);