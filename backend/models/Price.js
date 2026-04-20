const mongoose = require('mongoose');

const priceSchema = new mongoose.Schema({
  cropID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true,
    index: true
  },
  locationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    index: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  currency: {
    type: String,
    enum: ['PKR', 'USD', 'EUR'],
    default: 'PKR'
  },
  priceType: {
    type: String,
    enum: ['international', 'national', 'local'],
    required: true,
    index: true
  },
  previousPrice: {
    type: Number,
    default: null
  },
  msp: {
    type: Number,
    default: null
  },
  source: {
    type: String,
    default: 'manual'
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true
  }
}, {
  timestamps: true
});

priceSchema.index({ cropID: 1, priceType: 1, recordedAt: -1 });
priceSchema.index({ cropID: 1, locationID: 1, priceType: 1, recordedAt: -1 });

module.exports = mongoose.model('Price', priceSchema);
