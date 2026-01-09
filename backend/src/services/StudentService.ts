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
      const obj = session.toObject();
      return { ...obj, _id: session._id.toString() } as StudentSession;
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
    const obj = session.toObject();
    return { ...obj, _id: session._id.toString() } as StudentSession;
  }

  async getSession(sessionId: string): Promise<StudentSession | null> {
    const session = await StudentSessionModel.findOne({ sessionId });
    if (!session) return null;
    const obj = session.toObject();
    return { ...obj, _id: session._id.toString() } as StudentSession;
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

    return sessions.map((session) => {
      const obj = session.toObject();
      return { ...obj, _id: session._id.toString() } as StudentSession;
    });
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
