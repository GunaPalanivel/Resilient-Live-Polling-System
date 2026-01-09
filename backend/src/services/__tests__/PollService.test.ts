import { PollService } from '../../services/PollService';

describe('PollService', () => {
  let pollService: PollService;

  beforeEach(() => {
    pollService = new PollService();
  });

  describe('createPoll', () => {
    it('should create a new poll with active status', async () => {
      const poll = await pollService.createPoll(
        'What is your favorite color?',
        ['Red', 'Blue', 'Green'],
        60
      );

      expect(poll).toBeDefined();
      expect(poll.question).toBe('What is your favorite color?');
      expect(poll.options).toHaveLength(3);
      expect(poll.status).toBe('active');
      expect(poll.duration).toBe(60);
      expect(poll.startedAt).toBeInstanceOf(Date);
    });

    it('should trim question and option text', async () => {
      const poll = await pollService.createPoll(
        '  Test Question  ',
        ['  Option 1  ', '  Option 2  '],
        30
      );

      expect(poll.question).toBe('Test Question');
      expect(poll.options[0].text).toBe('Option 1');
      expect(poll.options[1].text).toBe('Option 2');
    });

    it('should throw error if active poll exists', async () => {
      // Create first poll
      await pollService.createPoll('Question 1', ['A', 'B'], 60);

      // Try to create second poll
      await expect(
        pollService.createPoll('Question 2', ['C', 'D'], 60)
      ).rejects.toThrow('ACTIVE_POLL_EXISTS');
    });

    it('should generate unique IDs for options', async () => {
      const poll = await pollService.createPoll(
        'Test',
        ['Option 1', 'Option 2', 'Option 3'],
        45
      );

      const ids = poll.options.map((opt) => opt.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(3);
    });

    it('should support 2-10 options', async () => {
      // Test with 2 options (minimum)
      const pollMin = await pollService.createPoll('Min test', ['A', 'B'], 60);
      expect(pollMin.options).toHaveLength(2);

      // End the poll to test max
      await pollService.endPoll(pollMin._id.toString());

      // Test with 10 options (maximum)
      const pollMax = await pollService.createPoll(
        'Max test',
        ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
        60
      );
      expect(pollMax.options).toHaveLength(10);
    });
  });

  describe('getCurrentPoll', () => {
    it('should return active poll', async () => {
      const created = await pollService.createPoll(
        'Active Question',
        ['Yes', 'No'],
        60
      );

      const current = await pollService.getCurrentPoll();

      expect(current).toBeDefined();
      expect(current?._id.toString()).toBe(created._id.toString());
      expect(current?.status).toBe('active');
    });

    it('should return null when no active poll exists', async () => {
      const current = await pollService.getCurrentPoll();
      expect(current).toBeNull();
    });

    it('should return null when active poll has ended', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.endPoll(poll._id.toString());

      const current = await pollService.getCurrentPoll();
      expect(current).toBeNull();
    });
  });

  describe('getPollById', () => {
    it('should return poll by ID', async () => {
      const created = await pollService.createPoll('Test', ['A', 'B'], 60);
      const retrieved = await pollService.getPollById(created._id.toString());

      expect(retrieved).toBeDefined();
      expect(retrieved?._id.toString()).toBe(created._id.toString());
    });

    it('should return null for non-existent poll', async () => {
      const retrieved = await pollService.getPollById(
        '000000000000000000000000'
      );
      expect(retrieved).toBeNull();
    });
  });

  describe('endPoll', () => {
    it('should end active poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      const ended = await pollService.endPoll(poll._id.toString());

      expect(ended.status).toBe('ended');
      expect(ended.endedAt).toBeInstanceOf(Date);
    });

    it('should throw error if poll not found', async () => {
      await expect(
        pollService.endPoll('000000000000000000000000')
      ).rejects.toThrow('POLL_NOT_FOUND');
    });

    it('should throw error if poll not active', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.endPoll(poll._id.toString());

      await expect(pollService.endPoll(poll._id.toString())).rejects.toThrow(
        'POLL_NOT_ACTIVE'
      );
    });
  });

  describe('expirePoll', () => {
    it('should expire active poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      const expired = await pollService.expirePoll(poll._id.toString());

      expect(expired.status).toBe('expired');
      expect(expired.endedAt).toBeInstanceOf(Date);
    });

    it('should throw error if poll not found', async () => {
      await expect(
        pollService.expirePoll('000000000000000000000000')
      ).rejects.toThrow('POLL_NOT_FOUND');
    });

    it('should throw error if poll not active', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.expirePoll(poll._id.toString());

      await expect(pollService.expirePoll(poll._id.toString())).rejects.toThrow(
        'POLL_NOT_ACTIVE'
      );
    });
  });

  describe('getPollHistory', () => {
    it('should return completed polls', async () => {
      // Create and end first poll
      const poll1 = await pollService.createPoll('Q1', ['A', 'B'], 60);
      await pollService.endPoll(poll1._id.toString());

      // Create and expire second poll
      const poll2 = await pollService.createPoll('Q2', ['C', 'D'], 60);
      await pollService.expirePoll(poll2._id.toString());

      const history = await pollService.getPollHistory();

      expect(history).toHaveLength(2);
      expect(history[0]._id.toString()).toBe(poll2._id.toString()); // Most recent first
      expect(history[1]._id.toString()).toBe(poll1._id.toString());
    });

    it('should not include active polls in history', async () => {
      // Create a completed poll first
      const completedPoll = await pollService.createPoll(
        'Completed',
        ['C', 'D'],
        60
      );
      await pollService.endPoll(completedPoll._id.toString());

      // Then create a new active poll
      await pollService.createPoll('Active', ['A', 'B'], 60);

      const history = await pollService.getPollHistory();

      expect(history).toHaveLength(1);
      expect(history[0]._id.toString()).toBe(completedPoll._id.toString());
    });

    it('should be empty when only active polls exist', async () => {
      // Create and don't end so it remains active
      await pollService.createPoll('Active', ['A', 'B'], 60);

      const history = await pollService.getPollHistory();

      expect(history).toHaveLength(0);
    });
  });
});
