import { Router } from 'express';
import { pollService } from '../services/PollService';
import { voteService } from '../services/VoteService';
import { TeacherPollResults, StudentPollResults } from '../types';

const router = Router();

// Create new poll (teacher only)
router.post('/', async (req, res, next) => {
  try {
    const { question, options, duration } = req.body;

    if (!question || !options || !duration) {
      return res.status(400).json({
        success: false,
        error: 'Question, options, and duration are required',
      });
    }

    if (!Array.isArray(options) || options.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 options are required',
      });
    }

    if (duration < 10 || duration > 600) {
      return res.status(400).json({
        success: false,
        error: 'Duration must be between 10 and 600 seconds',
      });
    }

    const poll = await pollService.createPoll(question, options, duration);

    res.status(201).json({
      success: true,
      data: poll,
    });
  } catch (error) {
    next(error);
  }
});

// Get current active poll
router.get('/current', async (_req, res, next) => {
  try {
    const poll = await pollService.getCurrentPoll();

    res.json({
      success: true,
      data: poll,
    });
  } catch (error) {
    next(error);
  }
});

// Get poll history (teacher only)
router.get('/history', async (_req, res, next) => {
  try {
    const polls = await pollService.getPollHistory();

    res.json({
      success: true,
      data: polls,
    });
  } catch (error) {
    next(error);
  }
});

// End poll manually (teacher only)
router.post('/:pollId/end', async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const poll = await pollService.endPoll(pollId);

    res.json({
      success: true,
      data: poll,
    });
  } catch (error) {
    next(error);
  }
});

// Get poll results (role-based data)
router.get('/:pollId/results', async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const isTeacher = req.query.role === 'teacher';
    const studentSessionId = req.headers['x-student-session-id'] as string;

    const poll = await pollService.getPollById(pollId);
    if (!poll) {
      return res.status(404).json({
        success: false,
        error: 'Poll not found',
      });
    }

    const results = await voteService.getVoteResults(pollId);
    const totalVotes = await voteService.getTotalVotes(pollId);

    if (isTeacher) {
      const detailedVotes = await voteService.getDetailedVotes(pollId);
      const teacherResults: TeacherPollResults = {
        poll,
        totalVotes,
        results,
        detailedVotes,
      };

      return res.json({
        success: true,
        data: teacherResults,
      });
    } else {
      const hasVoted = studentSessionId
        ? await voteService.hasStudentVoted(pollId, studentSessionId)
        : false;
      const userVote = studentSessionId
        ? await voteService.getStudentVote(pollId, studentSessionId)
        : null;

      const studentResults: StudentPollResults = {
        poll,
        totalVotes,
        results,
        hasVoted,
        userVote: userVote || undefined,
      };

      return res.json({
        success: true,
        data: studentResults,
      });
    }
  } catch (error) {
    next(error);
  }
});

// Admin: Clear all active polls (development only)
router.post('/admin/clear-active', async (_req, res, next) => {
  try {
    // In development, allow clearing active polls
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({
        success: false,
        error: 'This endpoint is not available in production',
      });
    }

    await pollService.clearActivePoll();

    res.json({
      success: true,
      message: 'All active polls cleared',
    });
  } catch (error) {
    next(error);
  }
});

export default router;
