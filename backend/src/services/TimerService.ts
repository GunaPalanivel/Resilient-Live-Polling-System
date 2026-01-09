import { PollModel } from '../models/Poll';

export interface TimerState {
  remaining: number;
  serverTime: Date;
  expired: boolean;
  pollId: string;
}

export class TimerService {
  async getRemainingTime(pollId: string): Promise<number> {
    const poll = await PollModel.findById(pollId);

    if (!poll || poll.status !== 'active') {
      return 0;
    }

    const elapsed = Date.now() - poll.startedAt.getTime();
    const remaining = poll.duration - Math.floor(elapsed / 1000);
    return Math.max(0, remaining);
  }

  /**
   * Get server-authoritative timer state for client sync
   * Used for late joiners and drift correction
   */
  async getTimerState(pollId: string): Promise<TimerState> {
    const poll = await PollModel.findById(pollId);

    if (!poll || poll.status !== 'active') {
      return {
        remaining: 0,
        serverTime: new Date(),
        expired: true,
        pollId,
      };
    }

    const elapsed = Date.now() - poll.startedAt.getTime();
    const remaining = Math.max(0, poll.duration - Math.floor(elapsed / 1000));
    const expired = remaining === 0;

    return {
      remaining,
      serverTime: new Date(),
      expired,
      pollId,
    };
  }

  async isExpired(pollId: string): Promise<boolean> {
    const remaining = await this.getRemainingTime(pollId);
    return remaining === 0;
  }

  async getExpiryTime(pollId: string): Promise<Date | null> {
    const poll = await PollModel.findById(pollId);

    if (!poll || poll.status !== 'active') {
      return null;
    }

    return new Date(poll.startedAt.getTime() + poll.duration * 1000);
  }
}

export const timerService = new TimerService();
