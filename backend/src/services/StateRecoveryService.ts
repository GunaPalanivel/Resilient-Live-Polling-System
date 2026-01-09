import { PollModel } from '../models/Poll';
import { VoteModel } from '../models/Vote';
import { StudentSessionModel } from '../models/StudentSession';
import { timerService } from './TimerService';
import { logger } from '../utils/logger';

export interface PollSnapshot {
  _id: string;
  question: string;
  options: Array<{ id: string; text: string; voteCount: number }>;
  status: string;
  duration: number;
  startedAt: Date;
  totalVotes: number;
}

export interface StudentVoteStatus {
  hasVoted: boolean;
  votedOptionId?: string;
}

export interface StudentStateSnapshot {
  poll: PollSnapshot | null;
  vote: StudentVoteStatus;
  remainingTime: number;
  serverTime: Date;
}

export interface TeacherStateSnapshot {
  poll: PollSnapshot | null;
  remainingTime: number;
  totalVotes: number;
  votes: Array<{
    optionId: string;
    studentName: string;
    submittedAt: Date;
  }>;
  serverTime: Date;
}

export class StateRecoveryService {
  /**
   * Get current state for a student
   * Used for page refresh recovery and reconnection
   */
  async getStudentState(sessionId: string): Promise<StudentStateSnapshot> {
    try {
      const session = await StudentSessionModel.findOne({ sessionId });

      if (!session) {
        return {
          poll: null,
          vote: { hasVoted: false },
          remainingTime: 0,
          serverTime: new Date(),
        };
      }

      const poll = await PollModel.findOne({ status: 'active' });

      if (!poll) {
        return {
          poll: null,
          vote: { hasVoted: false },
          remainingTime: 0,
          serverTime: new Date(),
        };
      }

      // Check if student has voted on this poll
      const vote = await VoteModel.findOne({
        pollId: poll._id,
        studentSessionId: sessionId,
      });

      const timerState = await timerService.getTimerState(poll._id.toString());

      return {
        poll: {
          _id: poll._id.toString(),
          question: poll.question,
          options: poll.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            voteCount: opt.voteCount || 0,
          })),
          status: poll.status,
          duration: poll.duration,
          startedAt: poll.startedAt,
          totalVotes: poll.totalVotes || 0,
        },
        vote: {
          hasVoted: !!vote,
          votedOptionId: vote?.optionId,
        },
        remainingTime: timerState.remaining,
        serverTime: timerState.serverTime,
      };
    } catch (error) {
      logger.error('Error getting student state:', error);
      return {
        poll: null,
        vote: { hasVoted: false },
        remainingTime: 0,
        serverTime: new Date(),
      };
    }
  }

  /**
   * Get current state for a teacher
   * Used for page refresh recovery
   */
  async getTeacherState(): Promise<TeacherStateSnapshot> {
    try {
      const poll = await PollModel.findOne({ status: 'active' });

      if (!poll) {
        return {
          poll: null,
          remainingTime: 0,
          totalVotes: 0,
          votes: [],
          serverTime: new Date(),
        };
      }

      const votes = await VoteModel.find({ pollId: poll._id });
      const timerState = await timerService.getTimerState(poll._id.toString());

      return {
        poll: {
          _id: poll._id.toString(),
          question: poll.question,
          options: poll.options.map((opt) => ({
            id: opt.id,
            text: opt.text,
            voteCount: opt.voteCount || 0,
          })),
          status: poll.status,
          duration: poll.duration,
          startedAt: poll.startedAt,
          totalVotes: poll.totalVotes || 0,
        },
        remainingTime: timerState.remaining,
        totalVotes: votes.length,
        votes: votes.map((v) => ({
          optionId: v.optionId,
          studentName: v.studentName,
          submittedAt: v.submittedAt,
        })),
        serverTime: timerState.serverTime,
      };
    } catch (error) {
      logger.error('Error getting teacher state:', error);
      return {
        poll: null,
        remainingTime: 0,
        totalVotes: 0,
        votes: [],
        serverTime: new Date(),
      };
    }
  }

  /**
   * Restore or validate a student session
   */
  async restoreSession(sessionId: string): Promise<any | null> {
    try {
      const session = await StudentSessionModel.findOne({ sessionId });

      if (!session || session.isBlocked) {
        return null;
      }

      // Update lastHeartbeat to keep session alive
      session.lastHeartbeat = new Date();
      await session.save();

      return {
        sessionId: session.sessionId,
        studentName: session.studentName,
        joinedAt: session.joinedAt,
        isOnline: session.isOnline,
      };
    } catch (error) {
      logger.error('Error restoring session:', error);
      return null;
    }
  }
}

export const stateRecoveryService = new StateRecoveryService();
