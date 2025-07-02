import express from 'express';
import { body, validationResult } from 'express-validator';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get all elections
router.get('/', protect, async (req, res) => {
  try {
    const elections = await Election.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: elections
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single election with candidates
router.get('/:id', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id)
      .populate('createdBy', 'name email');

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidates = await Candidate.find({ electionId: req.params.id });

    res.json({
      success: true,
      data: {
        ...election.toObject(),
        candidates
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create election (Admin only)
router.post('/', [protect, admin], [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('endDate').isISO8601().withMessage('Valid end date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, description, startDate, endDate, allowResultsViewing } = req.body;

    // Validate dates
    if (new Date(startDate) >= new Date(endDate)) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    const election = await Election.create({
      title,
      description,
      startDate,
      endDate,
      allowResultsViewing: allowResultsViewing || false,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      data: election
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update election (Admin only)
router.put('/:id', [protect, admin], async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const updatedElection = await Election.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedElection
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete election (Admin only)
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Delete all candidates for this election
    await Candidate.deleteMany({ electionId: req.params.id });

    // Delete the election
    await Election.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Election deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get election results
router.get('/:id/results', protect, async (req, res) => {
  try {
    const election = await Election.findById(req.params.id);

    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    // Check if results viewing is allowed or if user is admin
    if (!election.allowResultsViewing && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Results not available yet' });
    }

    const candidates = await Candidate.find({ electionId: req.params.id })
      .sort({ votes: -1 });

    res.json({
      success: true,
      data: {
        election,
        candidates,
        totalVotes: election.totalVotes
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;