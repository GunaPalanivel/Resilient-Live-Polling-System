import { VoteService } from '../../services/VoteService';
import { PollService } from '../../services/PollService';

describe('VoteService', () => {
  let voteService: VoteService;
  let pollService: PollService;

  beforeEach(() => {
    voteService = new VoteService();
    pollService = new PollService();
  });

  describe('submitVote - Basic Functionality', () => {
    it('should submit vote successfully', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B'], 60);

      const vote = await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'session-123',
        'Alice'
      );

      expect(vote.studentSessionId).toBe('session-123');
      expect(vote.studentName).toBe('Alice');
      expect(vote.optionId).toBe(poll.options[0].id);
    });

    it('should allow different students to vote', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const vote1 = await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'session-1',
        'Alice'
      );

      const vote2 = await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'session-2',
        'Bob'
      );

      expect(vote1._id).not.toEqual(vote2._id);
    });
  });

  describe('submitVote - Conflict Detection (409)', () => {
    it('should reject duplicate vote from same session', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'session-123',
        'Alice'
      );

      await expect(
        voteService.submitVote(
          poll._id.toString(),
          poll.options[0].id,
          'session-123',
          'Alice'
        )
      ).rejects.toThrow('DUPLICATE_VOTE');
    });

    it('should still reject even when voting for different option', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B', 'C'], 60);

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'session-123',
        'Alice'
      );

      await expect(
        voteService.submitVote(
          poll._id.toString(),
          poll.options[1].id,
          'session-123',
          'Alice'
        )
      ).rejects.toThrow('DUPLICATE_VOTE');
    });
  });

  describe('submitVote - Error Handling', () => {
    it('should throw error if poll not found', async () => {
      await expect(
        voteService.submitVote(
          '000000000000000000000000',
          'opt-id',
          'sess-id',
          'Name'
        )
      ).rejects.toThrow('POLL_NOT_FOUND');
    });

    it('should throw error if poll not active', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.endPoll(poll._id.toString());

      await expect(
        voteService.submitVote(
          poll._id.toString(),
          poll.options[0].id,
          'sess-id',
          'Name'
        )
      ).rejects.toThrow('POLL_NOT_ACTIVE');
    });

    it('should throw error if option invalid', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await expect(
        voteService.submitVote(
          poll._id.toString(),
          'invalid-opt',
          'sess-id',
          'Name'
        )
      ).rejects.toThrow('INVALID_OPTION');
    });
  });

  describe('getVotesForPoll', () => {
    it('should return all votes for poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'sess-1',
        'Alice'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[1].id,
        'sess-2',
        'Bob'
      );

      const votes = await voteService.getVotesForPoll(poll._id.toString());

      expect(votes).toHaveLength(2);
    });
  });

  describe('hasStudentVoted', () => {
    it('should return true if voted', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'sess-123',
        'Alice'
      );

      const hasVoted = await voteService.hasStudentVoted(
        poll._id.toString(),
        'sess-123'
      );

      expect(hasVoted).toBe(true);
    });

    it('should return false if not voted', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const hasVoted = await voteService.hasStudentVoted(
        poll._id.toString(),
        'sess-123'
      );

      expect(hasVoted).toBe(false);
    });
  });

  describe('getTotalVotes', () => {
    it('should count total votes', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B', 'C'], 60);

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'sess-1',
        'U1'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[1].id,
        'sess-2',
        'U2'
      );

      const total = await voteService.getTotalVotes(poll._id.toString());

      expect(total).toBe(2);
    });
  });

  describe('getVoteResults', () => {
    it('should calculate percentages correctly', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'sess-1',
        'U1'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'sess-2',
        'U2'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[1].id,
        'sess-3',
        'U3'
      );

      const results = await voteService.getVoteResults(poll._id.toString());

      expect(results[0].count).toBe(2);
      expect(results[0].percentage).toBe(66.7);
      expect(results[1].count).toBe(1);
      expect(results[1].percentage).toBe(33.3);
    });
  });

  describe('getStudentVote', () => {
    it('should return option student voted for', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        'sess-123',
        'Alice'
      );

      const voted = await voteService.getStudentVote(
        poll._id.toString(),
        'sess-123'
      );

      expect(voted).toBe(poll.options[0].id);
    });

    it('should return null if not voted', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const voted = await voteService.getStudentVote(
        poll._id.toString(),
        'sess-123'
      );

      expect(voted).toBeNull();
    });
  });
});
