import { TimerService } from '../../services/TimerService';
import { PollService } from '../../services/PollService';

describe('TimerService', () => {
  let timerService: TimerService;
  let pollService: PollService;

  beforeEach(() => {
    timerService = new TimerService();
    pollService = new PollService();
  });

  describe('getRemainingTime', () => {
    it('should return remaining time for active poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const remaining = await timerService.getRemainingTime(
        poll._id.toString()
      );

      expect(remaining).toBeGreaterThan(55);
      expect(remaining).toBeLessThanOrEqual(60);
    });

    it('should return 0 for non-existent poll', async () => {
      const remaining = await timerService.getRemainingTime(
        '000000000000000000000000'
      );

      expect(remaining).toBe(0);
    });

    it('should return 0 for ended poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.endPoll(poll._id.toString());

      const remaining = await timerService.getRemainingTime(
        poll._id.toString()
      );

      expect(remaining).toBe(0);
    });

    it('should return 0 for expired poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.expirePoll(poll._id.toString());

      const remaining = await timerService.getRemainingTime(
        poll._id.toString()
      );

      expect(remaining).toBe(0);
    });

    it('should decrease over time', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const time1 = await timerService.getRemainingTime(poll._id.toString());
      await new Promise((resolve) => setTimeout(resolve, 1100)); // Wait > 1 second
      const time2 = await timerService.getRemainingTime(poll._id.toString());

      expect(time2).toBeLessThan(time1);
      expect(time1 - time2).toBeGreaterThanOrEqual(1);
    });

    it('should never return negative time', async () => {
      // Create poll with 10 second duration (minimum allowed)
      const poll = await pollService.createPoll('Test', ['A', 'B'], 10);

      // Wait for it to expire
      await new Promise((resolve) => setTimeout(resolve, 11000));

      const remaining = await timerService.getRemainingTime(
        poll._id.toString()
      );

      expect(remaining).toBe(0);
    }, 15000);
  });

  describe('getTimerState', () => {
    it('should return full timer state for active poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const state = await timerService.getTimerState(poll._id.toString());

      expect(state.pollId).toBe(poll._id.toString());
      expect(state.remaining).toBeGreaterThan(55);
      expect(state.remaining).toBeLessThanOrEqual(60);
      expect(state.expired).toBe(false);
      expect(state.serverTime).toBeInstanceOf(Date);
    });

    it('should indicate expired for non-existent poll', async () => {
      const state = await timerService.getTimerState(
        '000000000000000000000000'
      );

      expect(state.expired).toBe(true);
      expect(state.remaining).toBe(0);
    });

    it('should indicate expired for ended poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.endPoll(poll._id.toString());

      const state = await timerService.getTimerState(poll._id.toString());

      expect(state.expired).toBe(true);
      expect(state.remaining).toBe(0);
    });

    it('should indicate expired when time reaches 0', async () => {
      // Create poll with 10 second duration (minimum allowed)
      const poll = await pollService.createPoll('Test', ['A', 'B'], 10);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 11000));

      const state = await timerService.getTimerState(poll._id.toString());

      expect(state.expired).toBe(true);
      expect(state.remaining).toBe(0);
    }, 15000);

    it('should provide server time for synchronization', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      const before = Date.now();

      const state = await timerService.getTimerState(poll._id.toString());

      const after = Date.now();

      expect(state.serverTime.getTime()).toBeGreaterThanOrEqual(before);
      expect(state.serverTime.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('isExpired', () => {
    it('should return false for active poll with time remaining', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const expired = await timerService.isExpired(poll._id.toString());

      expect(expired).toBe(false);
    });

    it('should return true for ended poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.endPoll(poll._id.toString());

      const expired = await timerService.isExpired(poll._id.toString());

      expect(expired).toBe(true);
    });

    it('should return true for non-existent poll', async () => {
      const expired = await timerService.isExpired('000000000000000000000000');

      expect(expired).toBe(true);
    });

    it('should return true when time runs out', async () => {
      // Create poll with 10 second duration (minimum allowed)
      const poll = await pollService.createPoll('Test', ['A', 'B'], 10);

      // Wait for expiry
      await new Promise((resolve) => setTimeout(resolve, 11000));

      const expired = await timerService.isExpired(poll._id.toString());

      expect(expired).toBe(true);
    }, 15000);
  });

  describe('getExpiryTime', () => {
    it('should return expiry timestamp for active poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const expiryTime = await timerService.getExpiryTime(poll._id.toString());

      expect(expiryTime).toBeInstanceOf(Date);

      // Should be approximately 60 seconds from now
      const expectedExpiry = poll.startedAt.getTime() + 60 * 1000;
      expect(expiryTime?.getTime()).toBe(expectedExpiry);
    });

    it('should return null for non-existent poll', async () => {
      const expiryTime = await timerService.getExpiryTime(
        '000000000000000000000000'
      );

      expect(expiryTime).toBeNull();
    });

    it('should return null for ended poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.endPoll(poll._id.toString());

      const expiryTime = await timerService.getExpiryTime(poll._id.toString());

      expect(expiryTime).toBeNull();
    });

    it('should return null for expired poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await pollService.expirePoll(poll._id.toString());

      const expiryTime = await timerService.getExpiryTime(poll._id.toString());

      expect(expiryTime).toBeNull();
    });

    it('should calculate correct expiry for different durations', async () => {
      const poll30 = await pollService.createPoll('Test 30s', ['A', 'B'], 30);
      await pollService.endPoll(poll30._id.toString());

      const poll120 = await pollService.createPoll(
        'Test 120s',
        ['C', 'D'],
        120
      );

      const expiry120 = await timerService.getExpiryTime(
        poll120._id.toString()
      );

      expect(expiry120).toBeInstanceOf(Date);

      const expectedExpiry = poll120.startedAt.getTime() + 120 * 1000;
      expect(expiry120?.getTime()).toBe(expectedExpiry);
    });
  });
});
