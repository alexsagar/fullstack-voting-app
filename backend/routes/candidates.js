import express from 'express';
import { body, validationResult } from 'express-validator';
import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Get candidates for an election
router.get('/election/:electionId', protect, async (req, res) => {
  try {
    const candidates = await Candidate.find({ electionId: req.params.electionId })
      .sort({ createdAt: 1 });

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create candidate (Admin only)
router.post('/', [protect, admin], [
  body('name').notEmpty().withMessage('Candidate name is required'),
  body('electionId').notEmpty().withMessage('Election ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, description, electionId } = req.body;

    // Check if election exists
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    const candidate = await Candidate.create({
      name,
      description,
      electionId
    });

    res.status(201).json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update candidate (Admin only)
router.put('/:id', [protect, admin], async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    const updatedCandidate = await Candidate.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: updatedCandidate
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete candidate (Admin only)
router.delete('/:id', [protect, admin], async (req, res) => {
  try {
    const candidate = await Candidate.findById(req.params.id);

    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    await Candidate.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Candidate deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;