const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const { getUserCalendar } = require('../services/cropCalendarService');

/**
 * Get user's full crop calendar (across all farms)
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const events = await getUserCalendar(req.user.id);
    res.json({ success: true, count: events.length, data: events });
  } catch (error) { next(error); }
});

module.exports = router;
