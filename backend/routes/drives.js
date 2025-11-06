import express from 'express';
import { protect } from '../middleware/auth.js';
import CompanyDrive from '../models/CompanyDrive.js';
import Application from '../models/Application.js';

const router = express.Router();

// @desc    Get all company drives
// @route   GET /api/drives
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    if (search) {
      query.$or = [
        { company: { $regex: search, $options: 'i' } },
        { role: { $regex: search, $options: 'i' } },
        { requirements: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const drives = await CompanyDrive.find(query)
      .sort({ featured: -1, deadline: 1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CompanyDrive.countDocuments(query);

    res.json({
      drives,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get drives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Get single drive
// @route   GET /api/drives/:id
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const drive = await CompanyDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ message: 'Company drive not found' });
    }

    res.json(drive);
  } catch (error) {
    console.error('Get drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @desc    Apply for company drive
// @route   POST /api/drives/:id/apply
// @access  Private
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const drive = await CompanyDrive.findById(req.params.id);
    
    if (!drive) {
      return res.status(404).json({ message: 'Company drive not found' });
    }

    // Check if already applied
    const existingApplication = await Application.findOne({
      userId: req.user._id,
      driveId: drive._id
    });

    if (existingApplication) {
      return res.status(400).json({ message: 'Already applied for this drive' });
    }

    // Create application with process stage tracking
    const processStageIndex = 0; // Starting at first stage
    const nextStepIndex = processStageIndex + 1;
    const nextStep = nextStepIndex < drive.process.length ? drive.process[nextStepIndex] : 'Completed';

    const application = await Application.create({
      userId: req.user._id,
      driveId: drive._id,
      status: 'applied',
      currentStage: drive.process[processStageIndex] || 'Applied',
      processStageIndex: processStageIndex,
      nextStep: nextStep
    });

    // Increment applicants count
    drive.applicants += 1;
    await drive.save();

    res.status(201).json(application);
  } catch (error) {
    console.error('Apply for drive error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;