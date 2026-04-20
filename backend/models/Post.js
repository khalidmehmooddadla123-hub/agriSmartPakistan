const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  userName: String,
  content: { type: String, required: true, maxlength: 2000 },
  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isAcceptedAnswer: { type: Boolean, default: false }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userID: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  userName: String,

  title: { type: String, required: true, maxlength: 250 },
  content: { type: String, required: true, maxlength: 3000 },

  category: {
    type: String,
    enum: ['disease_pest', 'irrigation', 'fertilizer', 'market', 'machinery', 'weather', 'general'],
    default: 'general',
    index: true
  },
  tags: [String],
  crop: String,
  province: String,

  upvotes: { type: Number, default: 0 },
  upvotedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  views: { type: Number, default: 0 },
  comments: [commentSchema],

  isResolved: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  images: [String]
}, { timestamps: true });

postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ category: 1, createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);
