import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    logger.error(`AppError: ${err.message}`, {
      statusCode: err.statusCode,
      path: req.path,
    });

    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Check for custom statusCode on error (from service layer)
  if ((err as any).statusCode) {
    return res.status((err as any).statusCode).json({
      success: false,
      error: err.message,
    });
  }

  // Handle known service errors
  if (err.message === 'ACTIVE_POLL_EXISTS') {
    return res.status(409).json({
      success: false,
      error: 'An active poll already exists. End it before creating a new one.',
    });
  }

  if (err.message === 'POLL_NOT_FOUND') {
    return res.status(404).json({
      success: false,
      error: 'Poll not found',
    });
  }

  if (err.message === 'POLL_NOT_ACTIVE') {
    return res.status(400).json({
      success: false,
      error: 'Poll is not active',
    });
  }

  if (err.message === 'DUPLICATE_VOTE') {
    return res.status(409).json({
      success: false,
      error: 'You have already voted in this poll',
    });
  }

  if (err.message === 'INVALID_OPTION') {
    return res.status(400).json({
      success: false,
      error: 'Invalid poll option',
    });
  }

  if (err.message === 'STUDENT_BLOCKED') {
    return res.status(403).json({
      success: false,
      error: 'You have been removed from this poll',
    });
  }

  // Log unexpected errors
  logger.error('Unexpected error:', err);

  return res.status(500).json({
    success: false,
    error: 'An unexpected error occurred',
  });
};
