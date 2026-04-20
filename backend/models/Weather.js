const mongoose = require('mongoose');

const forecastDaySchema = new mongoose.Schema({
  date: Date,
  tempMin: Number,
  tempMax: Number,
  humidity: Number,
  windSpeed: Number,
  description: String,
  icon: String,
  precipitation: Number,
  advisory: String
}, { _id: false });

const weatherSchema = new mongoose.Schema({
  locationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true
  },
  temperature: {
    type: Number,
    required: true
  },
  feelsLike: Number,
  humidity: {
    type: Number,
    required: true
  },
  windSpeed: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  icon: String,
  pressure: Number,
  visibility: Number,
  forecast: [forecastDaySchema],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Weather', weatherSchema);
