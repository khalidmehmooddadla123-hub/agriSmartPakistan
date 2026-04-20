const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');
const User = require('../models/User');

// List posts with filters
router.get('/', async (req, res, next) => {
  try {
    const { category, search, crop, province, sort = 'recent', page = 1, limit = 20 } = req.query;
    const filter = {};
    if (category) filter.category = category;
    if (crop) filter.crop = crop;
    if (province) filter.province = province;
    if (search) filter.$text = { $search: search };

    const sortOpt = sort === 'popular' ? { upvotes: -1, createdAt: -1 } :
                    sort === 'unresolved' ? { isResolved: 1, createdAt: -1 } :
                    { isPinned: -1, createdAt: -1 };

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Post.countDocuments(filter);

    const posts = await Post.find(filter)
      .populate('userID', 'fullName')
      .select('-comments') // don't send comments in list
      .sort(sortOpt)
      .skip(skip)
      .limit(parseInt(limit));

    res.json({
      success: true,
      count: posts.length,
      total,
      pages: Math.ceil(total / parseInt(limit)),
      data: posts
    });
  } catch (error) { next(error); }
});

// Get single post with comments
router.get('/:id', async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    )
      .populate('userID', 'fullName role')
      .populate('comments.userID', 'fullName role');

    if (!post) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: post });
  } catch (error) { next(error); }
});

// Create post
router.post('/', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('locationID');
    const post = await Post.create({
      ...req.body,
      userID: req.user.id,
      userName: user.fullName,
      province: req.body.province || user.locationID?.province
    });
    res.status(201).json({ success: true, data: post });
  } catch (error) { next(error); }
});

// Add comment
router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });

    post.comments.push({
      userID: req.user.id,
      userName: user.fullName,
      content: req.body.content
    });
    await post.save();

    await post.populate('comments.userID', 'fullName role');
    res.json({ success: true, data: post.comments[post.comments.length - 1] });
  } catch (error) { next(error); }
});

// Upvote post
router.post('/:id/upvote', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Not found' });

    const uid = req.user.id;
    const hasVoted = post.upvotedBy.some(u => u.toString() === uid);

    if (hasVoted) {
      post.upvotedBy = post.upvotedBy.filter(u => u.toString() !== uid);
      post.upvotes = Math.max(0, post.upvotes - 1);
    } else {
      post.upvotedBy.push(uid);
      post.upvotes += 1;
    }
    await post.save();
    res.json({ success: true, data: { upvotes: post.upvotes, voted: !hasVoted } });
  } catch (error) { next(error); }
});

// Mark as resolved (only post owner)
router.put('/:id/resolve', protect, async (req, res, next) => {
  try {
    const post = await Post.findOneAndUpdate(
      { _id: req.params.id, userID: req.user.id },
      { isResolved: true },
      { new: true }
    );
    if (!post) return res.status(404).json({ success: false, message: 'Not found or not authorized' });
    res.json({ success: true, data: post });
  } catch (error) { next(error); }
});

// Delete own post
router.delete('/:id', protect, async (req, res, next) => {
  try {
    const result = await Post.findOneAndDelete({ _id: req.params.id, userID: req.user.id });
    if (!result) return res.status(404).json({ success: false, message: 'Not found or not authorized' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) { next(error); }
});

module.exports = router;
