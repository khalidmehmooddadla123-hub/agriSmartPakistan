const mongoose = require('mongoose');

const cropLossSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farmID: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true },

  cropName: { type: String, required: true },
  cropID: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },

  damageDate: { type: Date, required: true },
  reportedAt: { type: Date, default: Date.now },

  // Cause of loss
  cause: {
    type: String,
    required: true,
    enum: ['flood', 'drought', 'hailstorm', 'pest', 'disease', 'fire', 'frost', 'wind_storm', 'lightning', 'rodents', 'theft', 'other']
  },
  causeDescription: String,

  // Damage assessment
  affectedAreaAcres: { type: Number, required: true, min: 0 },
  damagePercent: { type: Number, min: 0, max: 100 },
  estimatedLossPKR: Number,

  // Photographic evidence (GPS-stamped)
  photos: [{
    url: String,
    latitude: Number,
    longitude: Number,
    capturedAt: { type: Date, default: Date.now }
  }],

  // GPS for the affected area
  latitude: Number,
  longitude: Number,

  // Insurance claim tracking
  insuranceCompany: String,
  policyNumber: String,
  claimStatus: {
    type: String,
    enum: ['not_filed', 'documented', 'submitted', 'under_review', 'approved', 'rejected', 'paid'],
    default: 'documented'
  },
  claimAmount: Number,
  claimDate: Date,
  rejectionReason: String,

  notes: String
}, { timestamps: true });

cropLossSchema.index({ userID: 1, damageDate: -1 });
cropLossSchema.index({ farmID: 1, claimStatus: 1 });

module.exports = mongoose.model('CropLoss', cropLossSchema);
