import { Request, Response, NextFunction } from 'express';
import { studentService } from '../services/StudentService';

export const validateStudent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const studentSessionId = req.headers['x-student-session-id'] as string;

  if (!studentSessionId) {
    return res.status(400).json({
      success: false,
      error: 'Student session ID is required',
    });
  }

  try {
    const isBlocked = await studentService.isStudentBlocked(studentSessionId);
    
    if (isBlocked) {
      return res.status(403).json({
        success: false,
        error: 'You have been removed from this poll',
      });
    }

    next();
  } catch (error) {
    next(error);
  }
};
