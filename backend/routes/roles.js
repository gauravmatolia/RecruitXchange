import express from 'express';
import { protect } from '../middleware/auth.js';
import JobRole from '../models/JobRole.js';
import Application from '../models/Application.js';

const router = express.Router();

// @desc    Get all job roles
// @route   GET /api/roles
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { skills: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const roles = await JobRole.find(query)
      .sort({ featured: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await JobRole.countDocuments(query);

    res.json({
      roles,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get roles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single job role
// @route   GET /api/roles/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const role = await JobRole.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Job role not found' });
    }

    res.json(role);
  } catch (error) {
    console.error('Get role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Apply for job role
// @route   POST /api/roles/:id/apply
// @access  Private
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const role = await JobRole.findById(req.params.id);
    
    if (!role) {
      return res.status(404).json({ message: 'Job role not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      userId: req.user._id,
      roleId: role._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this role' });
    }

    // Create application
    const application = await Application.create({
      userId: req.user._id,
      roleId: role._id,
      status: 'applied',
      currentStage: 'Applied',
      nextStep: 'Screening'
    });

    // Increment applicants count
    role.applicants += 1;
    await role.save();

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply for role error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get role applications for user
// @route   GET /api/roles/applications/my
// @access  Private
router.get('/applications/my', protect, async (req, res) => {
  try {
    const applications = await Application.find({ userId: req.user._id })
      .populate('roleId', 'title company location salary')
      .populate('driveId', 'company role location package')
      .sort({ appliedDate: -1 });

    res.json(applications);
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;