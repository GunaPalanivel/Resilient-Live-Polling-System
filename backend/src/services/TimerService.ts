import { PollModel } from '../models/Poll';

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
