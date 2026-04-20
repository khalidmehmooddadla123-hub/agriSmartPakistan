const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: [true, 'Crop name is required'],
    unique: true,
    trim: true,
    index: true
  },
  cropNameUrdu: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['grain', 'vegetable', 'fruit', 'fiber', 'oilseed', 'spice', 'other'],
    index: true
  },
  unit: {
    type: String,
    required: [true, 'Unit is required'],
    default: 'Maund'
  },
  description: {
    type: String,
    trim: true
  },
  descriptionUrdu: {
    type: String,
    trim: true
  },
  image: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Crop', cropSchema);
