import { VoteModel } from '../models/Vote';
import { PollModel } from '../models/Poll';
import { Vote, VoteResult, DetailedVote } from '../types';

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
      throw new Error('POLL_NOT_FOUND');
    }

    if (poll.status !== 'active') {
      throw new Error('POLL_NOT_ACTIVE');
    }

    // Verify option exists
    const option = poll.options.find((opt) => opt.id === optionId);
    if (!option) {
      throw new Error('INVALID_OPTION');
    }

    // Check for duplicate vote (race condition protection)
    const existingVote = await VoteModel.findOne({
      pollId,
      studentSessionId,
    });

    if (existingVote) {
      throw new Error('DUPLICATE_VOTE');
    }

    const vote = new VoteModel({
      pollId,
      optionId,
      studentSessionId,
      studentName,
      votedAt: new Date(),
    });

    await vote.save();
    return vote.toObject();
  }

  async getVotesForPoll(pollId: string): Promise<Vote[]> {
    const votes = await VoteModel.find({ pollId }).sort({ votedAt: 1 });
    return votes.map((vote) => vote.toObject());
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
