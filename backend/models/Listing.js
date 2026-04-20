const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  sellerID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cropID: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  cropName: { type: String, required: true },
  cropNameUrdu: String,

  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, maxlength: 2000 },

  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, enum: ['Maund', 'KG', 'Ton', 'Quintal'], default: 'Maund' },
  pricePerUnit: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'PKR' },

  locationID: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  city: String,
  province: String,

  quality: { type: String, enum: ['premium', 'standard', 'regular'], default: 'standard' },
  harvestDate: Date,
  readyBy: Date,

  images: [String],

  status: { type: String, enum: ['active', 'sold', 'expired', 'paused'], default: 'active', index: true },
  views: { type: Number, default: 0 },
  inquiries: { type: Number, default: 0 },

  contactPreference: { type: String, enum: ['phone', 'email', 'chat', 'all'], default: 'all' }
}, { timestamps: true });

listingSchema.index({ status: 1, createdAt: -1 });
listingSchema.index({ cropName: 'text', title: 'text', description: 'text' });

module.exports = mongoose.model('Listing', listingSchema);
