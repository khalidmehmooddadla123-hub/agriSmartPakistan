const mongoose = require('mongoose');

const soilTestSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farmID: { type: mongoose.Schema.Types.ObjectId, ref: 'Farm', required: true, index: true },

  testDate: { type: Date, required: true, default: Date.now },
  labName: String,
  reportFileUrl: String,

  // Soil chemistry
  pH: { type: Number, min: 0, max: 14 },
  ec: Number,                           // Electrical Conductivity (dS/m)
  organicMatter: Number,                // %
  nitrogenN: Number,                    // ppm or %
  phosphorusP: Number,                  // ppm
  potassiumK: Number,                   // ppm
  zinc: Number,                         // ppm
  iron: Number,                         // ppm
  manganese: Number,                    // ppm
  copper: Number,                       // ppm
  boron: Number,                        // ppm
  sulfur: Number,                       // ppm
  calcium: Number,                      // ppm
  magnesium: Number,                    // ppm

  // Soil physical
  textureClass: {
    type: String,
    enum: ['sandy', 'loamy_sand', 'sandy_loam', 'loam', 'silt_loam', 'clay_loam', 'clay', 'silty_clay']
  },

  // AI-generated assessment
  aiAssessment: String,
  aiAssessmentUrdu: String,
  recommendations: String,
  recommendationsUrdu: String,
  healthScore: { type: Number, min: 0, max: 100 },

  notes: String
}, { timestamps: true });

soilTestSchema.index({ farmID: 1, testDate: -1 });

module.exports = mongoose.model('SoilTest', soilTestSchema);
