import express from 'express';
import { protect } from '../middleware/auth.js';
import CounselingSession from '../models/CounselingSession.js';
import User from '../models/User.js';

const router = express.Router();

// @desc    Get available counselors
// @route   GET /api/counseling/counselors
// @access  Public
router.get('/counselors', async (req, res) => {
  try {
    const counselors = await User.find({ 
      role: 'counselor',
      'profile.specialties': { $exists: true }
    }).select('name profile email');

    res.json(counselors);
  } catch (error) {
    console.error('Get counselors error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Book counseling session
// @route   POST /api/counseling/book
// @access  Private
router.post('/book', protect, async (req, res) => {
  try {
    const { counselorId, type, scheduledDate, duration, mode, notes } = req.body;

    const session = new CounselingSession({
      studentId: req.user._id,
      counselorId,
      type,
      scheduledDate,
      duration: duration || 60,
      mode: mode || 'Video Call',
      notes,
      status: 'scheduled'
    });

    await session.save();
    
    // Populate counselor details in response
    await session.populate('counselorId', 'name profile');

    res.status(201).json(session);
  } catch (error) {
    console.error('Book session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get user's counseling sessions
// @route   GET /api/counseling/sessions
// @access  Private
router.get('/sessions', protect, async (req, res) => {
  try {
    const sessions = await CounselingSession.find({
      $or: [
        { studentId: req.user._id },
        { counselorId: req.user._id }
      ]
    })
    .populate('studentId', 'name profile')
    .populate('counselorId', 'name profile')
    .sort({ scheduledDate: -1 });

    res.json(sessions);
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Update session status
// @route   PUT /api/counseling/sessions/:id
// @access  Private
router.put('/sessions/:id', protect, async (req, res) => {
  try {
    const { status, feedback, meetingLink } = req.body;
    
    const session = await CounselingSession.findById(req.params.id);
    
    if (!session) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Check if user is authorized to update this session
    if (session.studentId.toString() !== req.user._id.toString() && 
        session.counselorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this session' });
    }

    if (status) session.status = status;
    if (feedback) session.feedback = feedback;
    if (meetingLink) session.meetingLink = meetingLink;

    await session.save();
    res.json(session);
  } catch (error) {
    console.error('Update session error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;