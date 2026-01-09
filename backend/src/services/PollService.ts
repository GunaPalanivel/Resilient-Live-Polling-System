import { PollModel } from '../models/Poll';
import { Poll, PollOption } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class PollService {
  async createPoll(
    question: string,
    options: string[],
    duration: number
  ): Promise<Poll> {
    // Check for existing active poll
    const existingActivePoll = await PollModel.findOne({ status: 'active' });
    if (existingActivePoll) {
      throw new Error('ACTIVE_POLL_EXISTS');
    }

    // Create poll options with unique IDs
    const pollOptions: PollOption[] = options.map((text) => ({
      id: uuidv4(),
      text: text.trim(),
    }));

    const poll = new PollModel({
      question: question.trim(),
      options: pollOptions,
      duration,
      status: 'active',
      startedAt: new Date(),
    });

    await poll.save();
    const obj = poll.toObject();
    return { ...obj, _id: poll._id.toString() } as Poll;
  }

  async getCurrentPoll(): Promise<Poll | null> {
    const poll = await PollModel.findOne({ status: 'active' });
    return poll
      ? ({ ...poll.toObject(), _id: poll._id.toString() } as Poll)
      : null;
  }

  async getActivePoll(): Promise<Poll | null> {
    return this.getCurrentPoll();
  }

  async getPollById(pollId: string): Promise<Poll | null> {
    const poll = await PollModel.findById(pollId);
    return poll
      ? ({ ...poll.toObject(), _id: poll._id.toString() } as Poll)
      : null;
  }

  async endPoll(pollId: string): Promise<Poll> {
    const poll = await PollModel.findById(pollId);

    if (!poll) {
      throw new Error('POLL_NOT_FOUND');
    }

    if (poll.status !== 'active') {
      throw new Error('POLL_NOT_ACTIVE');
    }

    poll.status = 'ended';
    poll.endedAt = new Date();
    await poll.save();

    return { ...poll.toObject(), _id: poll._id.toString() } as Poll;
  }

  async expirePoll(pollId: string): Promise<Poll> {
    const poll = await PollModel.findById(pollId);

    if (!poll) {
      throw new Error('POLL_NOT_FOUND');
    }

    if (poll.status !== 'active') {
      throw new Error('POLL_NOT_ACTIVE');
    }

    poll.status = 'expired';
    poll.endedAt = new Date();
    await poll.save();

    return { ...poll.toObject(), _id: poll._id.toString() } as Poll;
  }

  async getPollHistory(): Promise<Poll[]> {
    const polls = await PollModel.find({ status: { $ne: 'active' } })
      .sort({ createdAt: -1 })
      .limit(50);

    return polls.map(
      (poll) => ({ ...poll.toObject(), _id: poll._id.toString() }) as Poll
    );
  }

  async checkAndExpirePolls(): Promise<void> {
    const activePolls = await PollModel.find({ status: 'active' });

    for (const poll of activePolls) {
      const elapsed = Date.now() - poll.startedAt.getTime();
      if (elapsed >= poll.duration * 1000) {
        poll.status = 'expired';
        poll.endedAt = new Date();
        await poll.save();
      }
    }
  }

  async clearActivePoll(): Promise<void> {
    // Mark all active polls as ended
    await PollModel.updateMany(
      { status: 'active' },
      {
        status: 'ended',
        endedAt: new Date(),
      }
    );
  }
}

export const pollService = new PollService();
