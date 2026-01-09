import { pollService } from '../services/PollService';
import { voteService } from '../services/VoteService';
import { PollModel } from '../models/Poll';
import { VoteModel } from '../models/Vote';

describe('Poll Lifecycle Integration Tests', () => {
  beforeEach(async () => {
    // Clean up database
    await PollModel.deleteMany({});
    await VoteModel.deleteMany({});
  });

  describe('Complete Poll Workflow', () => {
    it('should create a poll with proper structure', async () => {
      const poll = await pollService.createPoll(
        'What is your favorite programming language?',
        ['JavaScript', 'Python', 'Java'],
        60
      );

      expect(poll).toBeDefined();
      expect(poll.question).toBe('What is your favorite programming language?');
      expect(poll.options).toHaveLength(3);
      expect(poll.status).toBe('active');
      expect(poll.totalVotes).toBe(0);
      expect(poll.duration).toBe(60);
    });

    it('should submit votes and update totals', async () => {
      const poll = await pollService.createPoll(
        'Test question?',
        ['Option A', 'Option B', 'Option C'],
        60
      );

      const optionIds = poll.options.map((opt) => opt.id);

      // Submit votes
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[0],
        'Alice',
        'session-1'
      );
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[1],
        'Bob',
        'session-2'
      );
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[0],
        'Charlie',
        'session-3'
      );

      // Get updated poll
      const updatedPoll = await pollService.getCurrentPoll();

      expect(updatedPoll?.totalVotes).toBe(3);

      // Check vote counts per option
      const optionA = updatedPoll?.options.find(
        (opt) => opt.id === optionIds[0]
      );
      expect(optionA?.voteCount).toBe(2);

      const optionB = updatedPoll?.options.find(
        (opt) => opt.id === optionIds[1]
      );
      expect(optionB?.voteCount).toBe(1);

      const optionC = updatedPoll?.options.find(
        (opt) => opt.id === optionIds[2]
      );
      expect(optionC?.voteCount).toBe(0);
    });

    it('should prevent duplicate votes from same student', async () => {
      const poll = await pollService.createPoll(
        'Test question?',
        ['Option A', 'Option B'],
        60
      );

      const optionIds = poll.options.map((opt) => opt.id);

      // Submit first vote
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[0],
        'Alice',
        'session-1'
      );

      // Try to submit second vote (should fail)
      await expect(
        voteService.submitVote(
          poll._id.toString(),
          optionIds[1],
          'Alice',
          'session-1'
        )
      ).rejects.toThrow('DUPLICATE_VOTE');

      // Verify only one vote was recorded
      const updatedPoll = await pollService.getCurrentPoll();
      expect(updatedPoll?.totalVotes).toBe(1);
    });

    it('should end poll and mark as completed', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B'], 60);

      const endedPoll = await pollService.endPoll(poll._id.toString());

      expect(endedPoll.status).toBe('ended');
      expect(endedPoll.endedAt).toBeDefined();
      expect(endedPoll.endedAt).toBeInstanceOf(Date);
    });

    it('should track current active poll correctly', async () => {
      // Create first poll
      const poll1 = await pollService.createPoll('Question 1?', ['A', 'B'], 60);
      const currentPoll1 = await pollService.getCurrentPoll();
      expect(currentPoll1?._id.toString()).toBe(poll1._id.toString());

      // End first poll
      await pollService.endPoll(poll1._id.toString());

      // Create second poll
      const poll2 = await pollService.createPoll('Question 2?', ['C', 'D'], 60);
      const currentPoll2 = await pollService.getCurrentPoll();
      expect(currentPoll2?._id.toString()).toBe(poll2._id.toString());
    });

    it('should retrieve poll history correctly', async () => {
      // Create and end polls
      const poll1 = await pollService.createPoll('Question 1?', ['A', 'B'], 60);
      await pollService.endPoll(poll1._id.toString());

      const poll2 = await pollService.createPoll('Question 2?', ['C', 'D'], 60);
      await pollService.endPoll(poll2._id.toString());

      // Active poll should not be in history
      await pollService.createPoll('Question 3?', ['E', 'F'], 60);

      // Get history
      const history = await pollService.getPollHistory();

      const endedPolls = history.filter((p) => p.status === 'ended');
      expect(endedPolls).toHaveLength(2);
      expect(endedPolls[0].question).toBe('Question 2?'); // Most recent first
      expect(endedPolls[1].question).toBe('Question 1?');
    });

    it('should handle multiple students voting', async () => {
      const poll = await pollService.createPoll(
        'Popular vote?',
        ['Red', 'Blue', 'Green'],
        60
      );

      const optionIds = poll.options.map((opt) => opt.id);

      // Simulate 5 students voting
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[0],
        'Student1',
        's1'
      );
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[0],
        'Student2',
        's2'
      );
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[1],
        'Student3',
        's3'
      );
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[2],
        'Student4',
        's4'
      );
      await voteService.submitVote(
        poll._id.toString(),
        optionIds[0],
        'Student5',
        's5'
      );

      const updatedPoll = await pollService.getCurrentPoll();
      expect(updatedPoll?.totalVotes).toBe(5);

      const redVotes = updatedPoll?.options.find(
        (opt) => opt.id === optionIds[0]
      );
      expect(redVotes?.voteCount).toBe(3);
    });

    it('should validate poll creation requirements', async () => {
      // Should fail with empty question
      await expect(
        pollService.createPoll('', ['A', 'B'], 60)
      ).rejects.toThrow();

      // Should fail with < 2 options
      await expect(
        pollService.createPoll('Test?', ['Only One'], 60)
      ).rejects.toThrow();

      // Should fail with > 10 options
      await expect(
        pollService.createPoll(
          'Too many?',
          ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11'],
          60
        )
      ).rejects.toThrow();
    });
  });
});
