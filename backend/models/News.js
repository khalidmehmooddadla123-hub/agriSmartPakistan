const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: 300
  },
  titleUrdu: {
    type: String,
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Content is required']
  },
  contentUrdu: {
    type: String
  },
  summary: {
    type: String,
    maxlength: 500
  },
  category: {
    type: String,
    enum: ['crop_prices', 'government_policy', 'pest_disease', 'climate', 'technology', 'market_trends', 'subsidies'],
    required: true,
    index: true
  },
  source: {
    type: String,
    trim: true
  },
  sourceUrl: {
    type: String,
    trim: true
  },
  imageUrl: {
    type: String
  },
  videoUrl: {
    type: String
  },
  isVideo: {
    type: Boolean,
    default: false
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  isBreaking: {
    type: Boolean,
    default: false
  },
  publishedAt: {
    type: Date
  },
  tags: [String],
  views: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

newsSchema.index({ category: 1, publishedAt: -1 });
newsSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('News', newsSchema);
