import { VoteModel } from '../models/Vote';
import { PollModel } from '../models/Poll';
import { Vote, VoteResult, DetailedVote } from '../types';
import { logger } from '../utils/logger';

export class VoteService {
  async submitVote(
    pollId: string,
    optionId: string,
    studentSessionId: string,
    studentName: string
  ): Promise<Vote> {
    // Check if poll exists and is active
    const poll = await PollModel.findById(pollId);
    if (!poll) {
      const error = new Error('POLL_NOT_FOUND');
      (error as any).statusCode = 400;
      throw error;
    }

    if (poll.status !== 'active') {
      const error = new Error('POLL_NOT_ACTIVE');
      (error as any).statusCode = 400;
      throw error;
    }

    // Verify option exists
    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      const error = new Error('INVALID_OPTION');
      (error as any).statusCode = 400;
      throw error;
    }

    // Atomic vote submission with race condition protection
    // If vote already exists (duplicate key), this will throw MongoServerError with code 11000
    try {
      // Fast path to reject repeat votes before attempting insert
      const existingVote = await VoteModel.findOne({
        pollId,
        studentSessionId,
      });
      if (existingVote) {
        const duplicateError = new Error('DUPLICATE_VOTE');
        (duplicateError as any).statusCode = 409;
        logger.warn(
          `Duplicate vote attempt: ${studentSessionId} on poll ${pollId}`
        );
        throw duplicateError;
      }

      const vote = new VoteModel({
        pollId,
        optionId,
        studentSessionId,
        studentName,
        votedAt: new Date(),
      });

      await vote.save();

      // Atomically increment vote count in poll
      await PollModel.updateOne(
        { _id: pollId, 'options.id': optionId },
        {
          $inc: {
            'options.$.voteCount': 1,
            totalVotes: 1,
          },
        }
      );

      logger.info(`Vote submitted: ${vote._id} - student: ${studentName}`);
      const voteObj = vote.toObject();
      return {
        ...voteObj,
        _id: vote._id.toString(),
        pollId: vote.pollId.toString(),
      } as Vote;
    } catch (error: any) {
      // Handle duplicate key error (race condition)
      if (error.code === 11000) {
        const duplicateError = new Error('DUPLICATE_VOTE');
        (duplicateError as any).statusCode = 409; // Conflict
        logger.warn(
          `Duplicate vote attempt: ${studentSessionId} on poll ${pollId}`
        );
        throw duplicateError;
      }

      // Re-throw other errors
      throw error;
    }
  }

  async getVotesForPoll(pollId: string): Promise<Vote[]> {
    const votes = await VoteModel.find({ pollId }).sort({ votedAt: 1 });
    return votes.map(
      (vote) =>
        ({
          ...vote.toObject(),
          _id: vote._id.toString(),
          pollId: vote.pollId.toString(),
        }) as Vote
    );
  }

  async hasStudentVoted(
    pollId: string,
    studentSessionId: string
  ): Promise<boolean> {
    const vote = await VoteModel.findOne({ pollId, studentSessionId });
    return !!vote;
  }

  async getVoteResults(pollId: string): Promise<VoteResult[]> {
    const poll = await PollModel.findById(pollId);
    if (!poll) {
      throw new Error('POLL_NOT_FOUND');
    }

    const votes = await VoteModel.find({ pollId });
    const totalVotes = votes.length;

    const results: VoteResult[] = poll.options.map((option) => {
      const count = votes.filter((v) => v.optionId === option.id).length;
      const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

      return {
        optionId: option.id,
        optionText: option.text,
        count,
        percentage: Math.round(percentage * 10) / 10,
      };
    });

    return results;
  }

  async getDetailedVotes(pollId: string): Promise<DetailedVote[]> {
    const poll = await PollModel.findById(pollId);
    if (!poll) {
      throw new Error('POLL_NOT_FOUND');
    }

    const votes = await VoteModel.find({ pollId }).sort({ votedAt: 1 });

    return votes.map((vote) => {
      const option = poll.options.find((opt) => opt.id === vote.optionId);
      return {
        studentName: vote.studentName,
        optionText: option?.text || 'Unknown',
        votedAt: vote.votedAt,
      };
    });
  }

  async getTotalVotes(pollId: string): Promise<number> {
    return await VoteModel.countDocuments({ pollId });
  }

  async getStudentVote(
    pollId: string,
    studentSessionId: string
  ): Promise<string | null> {
    const vote = await VoteModel.findOne({ pollId, studentSessionId });
    return vote ? vote.optionId : null;
  }
}

export const voteService = new VoteService();
