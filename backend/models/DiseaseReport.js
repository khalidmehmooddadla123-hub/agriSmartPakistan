const mongoose = require('mongoose');

/**
 * DiseaseReport — tracks each disease detection event for outbreak analysis.
 * Used by the pest outbreak detector cron.
 */
const diseaseReportSchema = new mongoose.Schema({
  userID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  locationID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Location',
    required: true,
    index: true
  },
  diseaseID: {
    type: String,
    required: true,
    index: true
  },
  diseaseName: String,
  crop: String,
  severity: {
    type: String,
    enum: ['high', 'medium', 'low']
  },
  confidence: Number,
  source: String // 'huggingface-ml', 'keyword-fallback', etc.
}, {
  timestamps: true
});

diseaseReportSchema.index({ locationID: 1, diseaseID: 1, createdAt: -1 });

module.exports = mongoose.model('DiseaseReport', diseaseReportSchema);
