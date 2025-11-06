import express from 'express';
import { protect } from '../middleware/auth.js';
import Event from '../models/Event.js';

const router = express.Router();

// @desc    Get all events
// @route   GET /api/events
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type, upcoming = true, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (type) {
      query.type = type;
    }

    if (upcoming === 'true') {
      query.date = { $gte: new Date() };
      query.status = 'scheduled';
    }

    const events = await Event.find(query)
      .sort({ date: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await Event.countDocuments(query);

    res.json({
      events,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Register for event
// @route   POST /api/events/:id/register
// @access  Private
router.post('/:id/register', protect, async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if already registered
    const alreadyRegistered = event.attendees.some(
      attendee => attendee.userId.toString() === req.user._id.toString()
    );

    if (alreadyRegistered) {
      return res.status(400).json({ message: 'Already registered for this event' });
    }

    // Check if event is full
    if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
      return res.status(400).json({ message: 'Event is full' });
    }

    event.attendees.push({
      userId: req.user._id,
      status: 'registered'
    });

    await event.save();

    res.json({ message: 'Successfully registered for event', event });
  } catch (error) {
    console.error('Register for event error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;