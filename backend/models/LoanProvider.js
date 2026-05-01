const mongoose = require('mongoose');

const loanProviderSchema = new mongoose.Schema({
  providerKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: { type: String, required: true, trim: true },
  rate: {
    type: Number,
    required: true,
    min: [0, 'Rate cannot be negative'],
    max: [50, 'Rate must be realistic']
  },
  maxYears: {
    type: Number,
    required: true,
    min: [0.5, 'Tenure must be at least 0.5 years']
  },
  descriptionEn: { type: String, required: true },
  descriptionUrdu: { type: String },
  bankUrl: { type: String, default: '' },
  isActive: { type: Boolean, default: true, index: true },
  lastVerifiedAt: { type: Date, default: Date.now },
  source: { type: String, default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('LoanProvider', loanProviderSchema);
