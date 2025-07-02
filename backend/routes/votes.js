import express from 'express';
import { body, validationResult } from 'express-validator';
import Vote from '../models/Vote.js';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Cast vote
router.post('/', protect, [
  body('electionId').notEmpty().withMessage('Election ID is required'),
  body('candidateId').notEmpty().withMessage('Candidate ID is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { electionId, candidateId } = req.body;
    const userId = req.user._id;

    // Check if election exists and is active
    const election = await Election.findById(electionId);
    if (!election) {
      return res.status(404).json({ message: 'Election not found' });
    }

    if (election.status !== 'active') {
      return res.status(400).json({ message: 'Election is not active' });
    }

    // Check if candidate exists and belongs to this election
    const candidate = await Candidate.findOne({ _id: candidateId, electionId });
    if (!candidate) {
      return res.status(404).json({ message: 'Candidate not found' });
    }

    // Check if user has already voted in this election
    const existingVote = await Vote.findOne({ userId, electionId });
    if (existingVote) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    // Create the vote
    const vote = await Vote.create({
      userId,
      electionId,
      candidateId
    });

    // Update candidate vote count
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { votes: 1 } });

    // Update election total votes
    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });

    // Update user's hasVoted array
    await User.findByIdAndUpdate(userId, {
      $push: { hasVoted: { electionId } }
    });

    res.status(201).json({
      success: true,
      message: 'Vote cast successfully',
      data: vote
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check if user has voted in an election
router.get('/check/:electionId', protect, async (req, res) => {
  try {
    const vote = await Vote.findOne({
      userId: req.user._id,
      electionId: req.params.electionId
    });

    res.json({
      success: true,
      hasVoted: !!vote,
      vote: vote || null
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user's voting history
router.get('/history', protect, async (req, res) => {
  try {
    const votes = await Vote.find({ userId: req.user._id })
      .populate('electionId', 'title description')
      .populate('candidateId', 'name')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: votes
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;