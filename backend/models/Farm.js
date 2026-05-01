const mongoose = require('mongoose');

const cropOnFarmSchema = new mongoose.Schema({
  cropID: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
  variety: String,
  areaAcres: Number,
  sowDate: Date,
  expectedHarvestDate: Date,
  status: {
    type: String,
    enum: ['planned', 'sown', 'growing', 'harvested', 'failed'],
    default: 'planned'
  },
  expectedYieldMaunds: Number,
  actualYieldMaunds: Number,
  notes: String
}, { timestamps: true, _id: true });

const farmSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId, ref: 'User',
    required: true, index: true
  },
  name: { type: String, required: true, maxlength: 100 },
  nameUrdu: String,

  locationID: { type: mongoose.Schema.Types.ObjectId, ref: 'Location' },
  city: String,
  province: String,
  village: String,
  // Optional precise GPS
  latitude: Number,
  longitude: Number,

  totalAreaAcres: { type: Number, required: true, min: 0 },
  soilType: {
    type: String,
    enum: ['sandy', 'loamy', 'clay', 'silty', 'sandy_loam', 'clay_loam', 'unknown'],
    default: 'loamy'
  },
  irrigationSource: {
    type: String,
    enum: ['canal', 'tubewell', 'rain_fed', 'mixed', 'drip'],
    default: 'canal'
  },

  // Optional ownership
  ownership: {
    type: String,
    enum: ['owned', 'leased', 'shared', 'family'],
    default: 'owned'
  },

  // Active crops on this farm
  crops: [cropOnFarmSchema],

  notes: String,
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

farmSchema.index({ userID: 1, isActive: 1 });

module.exports = mongoose.model('Farm', farmSchema);
