const mongoose = require('mongoose');

const equipmentSchema = new mongoose.Schema({
  ownerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  type: {
    type: String,
    required: true,
    enum: ['tractor', 'thresher', 'tubewell', 'plow', 'harvester', 'seed_drill', 'sprayer', 'trolley', 'rotavator', 'cultivator', 'other'],
    index: true
  },
  brand: String,
  model: String,
  yearMade: Number,

  title: { type: String, required: true, maxlength: 200 },
  description: String,

  // Pricing
  rentMode: {
    type: String,
    enum: ['hourly', 'daily', 'per_acre', 'per_job'],
    default: 'daily'
  },
  ratePKR: { type: Number, required: true, min: 0 },

  // Availability
  available: { type: Boolean, default: true, index: true },
  availableFrom: Date,
  availableTo: Date,

  // Location
  locationID: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  city: String,
  province: String,
  village: String,

  // Specs
  horsepower: Number,
  fuelType: { type: String, enum: ['diesel', 'petrol', 'electric', 'manual', 'na'], default: 'diesel' },

  images: [String],

  contactPreference: { type: String, enum: ['phone', 'whatsapp', 'all'], default: 'all' },

  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },

  rating: { type: Number, min: 0, max: 5 },
  ratingCount: { type: Number, default: 0 }
}, { timestamps: true });

equipmentSchema.index({ available: 1, type: 1, province: 1 });
equipmentSchema.index({ title: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Equipment', equipmentSchema);
