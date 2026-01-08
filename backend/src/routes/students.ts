import { Router } from 'express';
import { studentService } from '../services/StudentService';

const router = Router();

// Remove student (teacher only)
router.delete('/:sessionId', async (req, res, next) => {
  try {
    const { sessionId } = req.params;

    await studentService.removeStudent(sessionId);

    res.json({
      success: true,
      message: 'Student removed successfully',
    });
  } catch (error) {
    next(error);
  }
});

// Get active students for poll
router.get('/poll/:pollId', async (req, res, next) => {
  try {
    const { pollId } = req.params;
    const students = await studentService.getActiveStudents(pollId);

    res.json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
