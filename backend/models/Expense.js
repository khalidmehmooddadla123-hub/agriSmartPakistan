const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cropID: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
  cropName: String,
  season: { type: String, enum: ['Rabi', 'Kharif'], required: true },
  year: { type: Number, default: () => new Date().getFullYear() },

  category: {
    type: String,
    required: true,
    enum: ['seed', 'fertilizer', 'pesticide', 'labor', 'irrigation', 'fuel', 'machinery', 'transport', 'other']
  },
  description: String,
  amountPKR: { type: Number, required: true, min: 0 },
  date: { type: Date, default: Date.now, index: true },
  areaAcres: Number,

  // Revenue tracking
  isRevenue: { type: Boolean, default: false },
  quantityMaunds: Number,
  pricePerMaund: Number
}, { timestamps: true });

expenseSchema.index({ userID: 1, season: 1, year: 1 });

module.exports = mongoose.model('Expense', expenseSchema);
