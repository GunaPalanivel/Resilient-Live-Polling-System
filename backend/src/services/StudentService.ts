import { StudentSessionModel } from '../models/StudentSession';
import { StudentSession } from '../types';

export class StudentService {
  async createSession(
    sessionId: string,
    pollId: string,
    studentName: string
  ): Promise<StudentSession> {
    // Check if session already exists
    let session = await StudentSessionModel.findOne({ sessionId });

    if (session) {
      // Update existing session
      session.pollId = pollId;
      session.studentName = studentName;
      session.lastHeartbeat = new Date();
      session.isActive = true;
      await session.save();
      return session.toObject();
    }

    // Create new session
    session = new StudentSessionModel({
      sessionId,
      pollId,
      studentName,
      isActive: true,
      isBlocked: false,
      lastHeartbeat: new Date(),
    });

    await session.save();
    return session.toObject();
  }

  async getSession(sessionId: string): Promise<StudentSession | null> {
    const session = await StudentSessionModel.findOne({ sessionId });
    return session ? session.toObject() : null;
  }

  async updateHeartbeat(sessionId: string): Promise<void> {
    await StudentSessionModel.findOneAndUpdate(
      { sessionId },
      { lastHeartbeat: new Date(), isActive: true }
    );
  }

  async getActiveStudents(pollId: string): Promise<StudentSession[]> {
    const sessions = await StudentSessionModel.find({
      pollId,
      isActive: true,
      isBlocked: false,
    }).sort({ createdAt: 1 });

    return sessions.map((session) => session.toObject());
  }

  async removeStudent(sessionId: string): Promise<void> {
    await StudentSessionModel.findOneAndUpdate(
      { sessionId },
      { isActive: false, isBlocked: true }
    );
  }

  async disconnectStudent(sessionId: string): Promise<void> {
    await StudentSessionModel.findOneAndUpdate(
      { sessionId },
      { isActive: false }
    );
  }

  async isStudentBlocked(sessionId: string): Promise<boolean> {
    const session = await StudentSessionModel.findOne({ sessionId });
    return session ? session.isBlocked : false;
  }
}

export const studentService = new StudentService();
