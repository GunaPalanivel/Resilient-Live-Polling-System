import { Router } from 'express';
import { voteService } from '../services/VoteService';
import { validateStudent } from '../middleware/validateStudent';

const router = Router();

// Submit vote
router.post('/', validateStudent, async (req, res, next) => {
  try {
    const { pollId, optionId, studentName } = req.body;
    const studentSessionId = req.headers['x-student-session-id'] as string;

    if (!pollId || !optionId || !studentName || !studentSessionId) {
      return res.status(400).json({
        success: false,
        error: 'Poll ID, option ID, student name, and session ID are required',
      });
    }

    const vote = await voteService.submitVote(
      pollId,
      optionId,
      studentSessionId,
      studentName
    );

    res.status(201).json({
      success: true,
      data: vote,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
