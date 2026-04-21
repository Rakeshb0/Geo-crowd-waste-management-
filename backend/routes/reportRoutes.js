const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const User = require('../models/User');
const { protect, admin, municipality } = require('../middleware/authMiddleware');

// Mock AI Verification Function
const mockAIVerification = async (description) => {
  const desc = (description || '').toLowerCase();
  let aiCategory = 'General Waste';
  let aiConfidence = Math.floor(Math.random() * 15) + 85;

  if (desc.includes('plastic') || desc.includes('bottle') || desc.includes('can')) {
    aiCategory = 'Recyclable Plastics';
  } else if (desc.includes('food') || desc.includes('leaf') || desc.includes('organic')) {
    aiCategory = 'Organic Waste';
  } else if (desc.includes('battery') || desc.includes('chemical') || desc.includes('paint') || desc.includes('glass')) {
    aiCategory = 'Hazardous Waste';
  }

  return {
    category: aiCategory,
    confidence: aiConfidence
  };
};

// @desc    Create a new report
// @route   POST /api/reports
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { imageUrl, longitude, latitude, address, description } = req.body;

    console.log('--- New Report Attempt ---');
    console.log('User:', req.user._id);
    console.log('Image URL:', imageUrl);
    console.log('Location:', { longitude, latitude, address });

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required' });
    }

    if (longitude === undefined || latitude === undefined) {
      return res.status(400).json({ message: 'GPS Coordinates are required' });
    }

    // 1. Mock AI Verification
    const aiResult = await mockAIVerification(description);

    // 2. Find nearest municipality
    const nearestMunicipality = await User.findOne({ role: 'municipality' });

    const report = new Report({
      user: req.user._id,
      assignedMunicipality: nearestMunicipality ? nearestMunicipality._id : null,
      image: { url: imageUrl, public_id: 'mock_id' },
      location: {
        type: 'Point',
        coordinates: [Number(longitude), Number(latitude)],
        address
      },
      description,
      status: 'assigned',
      aiData: aiResult
    });

    const createdReport = await report.save();
    console.log('Report created successfully:', createdReport._id);
    res.status(201).json(createdReport);
  } catch (error) {
    console.error('Report Creation Error:', error);
    res.status(400).json({ message: error.message }); // Changed to 400 to show validation errors clearly
  }
});

// @desc    Get logged in user's reports
// @route   GET /api/reports/myreports
// @access  Private
router.get('/myreports', protect, async (req, res) => {
  try {
    const reports = await Report.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get reports assigned to municipality
// @route   GET /api/reports/assigned
// @access  Private/Municipality
router.get('/assigned', protect, municipality, async (req, res) => {
  try {
    const reports = await Report.find({ assignedMunicipality: req.user._id }).populate('user', 'name').sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Get all reports
// @route   GET /api/reports
// @access  Private/Admin
router.get('/', protect, admin, async (req, res) => {
  try {
    const reports = await Report.find({}).populate('user', 'name').populate('assignedMunicipality', 'name').sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// @desc    Update report status
// @route   PUT /api/reports/:id/status
// @access  Private/Municipality/Admin
router.put('/:id/status', protect, municipality, async (req, res) => {
  try {
    const { status } = req.body;
    const report = await Report.findById(req.params.id);

    if (report) {
      report.status = status;
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
