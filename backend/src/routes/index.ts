import { Router } from 'express';
import pollRoutes from './polls';
import voteRoutes from './votes';
import studentRoutes from './students';
import stateRoutes from './stateRoutes';

const router = Router();

// Health check
router.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Mount routes
router.use('/polls', pollRoutes);
router.use('/votes', voteRoutes);
router.use('/students', studentRoutes);
router.use('/state', stateRoutes);

export default router;
