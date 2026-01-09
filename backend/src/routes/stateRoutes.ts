import { Router } from 'express';
import { stateRecoveryService } from '../services/StateRecoveryService';
import { logger } from '../utils/logger';

const router = Router();

/**
 * GET /api/state/current?role=teacher|student&sessionId=xxx
 * Returns current state snapshot for recovery
 */
router.get('/current', async (req, res) => {
  try {
    const role = (req.query.role as string) || 'student';
    const sessionId = req.query.sessionId as string;

    if (role === 'teacher') {
      const state = await stateRecoveryService.getTeacherState();
      res.json({ success: true, data: state });
    } else if (role === 'student' && sessionId) {
      const state = await stateRecoveryService.getStudentState(sessionId);
      res.json({ success: true, data: state });
    } else {
      res.status(400).json({
        success: false,
        error: 'Invalid role or missing sessionId for student',
      });
    }
  } catch (error) {
    logger.error('Error fetching current state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch state',
    });
  }
});

/**
 * GET /api/state/student/:sessionId
 * Get state for a specific student (for reconnection)
 */
router.get('/student/:sessionId', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const state = await stateRecoveryService.getStudentState(sessionId);
    res.json({ success: true, data: state });
  } catch (error) {
    logger.error('Error fetching student state:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch student state',
    });
  }
});

/**
 * POST /api/state/restore
 * Restore session on reconnect
 */
router.post('/restore', async (req, res) => {
  try {
    const { sessionId } = req.body;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'sessionId required',
      });
    }

    const session = await stateRecoveryService.restoreSession(sessionId);

    if (!session) {
      return res.status(404).json({
        success: false,
        error: 'Session not found or blocked',
      });
    }

    res.json({ success: true, data: session });
  } catch (error) {
    logger.error('Error restoring session:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to restore session',
    });
  }
});

export default router;
