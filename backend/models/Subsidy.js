const mongoose = require('mongoose');

const subsidySchema = new mongoose.Schema({
  schemeKey: {
    type: String,
    required: true,
    unique: true,
    index: true,
    trim: true
  },
  name: { type: String, required: true, trim: true },
  nameUrdu: { type: String, trim: true },
  category: {
    type: String,
    enum: ['subsidy', 'loan', 'insurance', 'scheme'],
    required: true,
    index: true
  },
  provider: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  descriptionUrdu: { type: String },
  eligibility: {
    maxLandAcres: { type: Number, default: null },
    requiresCNIC: { type: Boolean, default: true },
    province: { type: String, default: null },
    needsBISP: { type: Boolean, default: false }
  },
  benefits: { type: String, required: true },
  benefitsUrdu: { type: String },
  link: { type: String, required: true },
  emoji: { type: String, default: '📋' },
  isActive: { type: Boolean, default: true, index: true },
  lastVerifiedAt: { type: Date, default: Date.now },
  source: { type: String, default: 'manual' }
}, { timestamps: true });

module.exports = mongoose.model('Subsidy', subsidySchema);
