import { StateRecoveryService } from '../../services/StateRecoveryService';
import { PollService } from '../../services/PollService';
import { VoteService } from '../../services/VoteService';
import { StudentService } from '../../services/StudentService';

describe('StateRecoveryService', () => {
  let stateRecoveryService: StateRecoveryService;
  let pollService: PollService;
  let voteService: VoteService;
  let studentService: StudentService;

  beforeEach(() => {
    stateRecoveryService = new StateRecoveryService();
    pollService = new PollService();
    voteService = new VoteService();
    studentService = new StudentService();
  });

  describe('getStudentState', () => {
    it('should return null poll for non-existent session', async () => {
      const state = await stateRecoveryService.getStudentState('non-existent');

      expect(state.poll).toBeNull();
      expect(state.vote.hasVoted).toBe(false);
      expect(state.remainingTime).toBe(0);
      expect(state.serverTime).toBeInstanceOf(Date);
    });

    it('should return null poll when no active poll exists', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      const session = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      // End the poll
      await pollService.endPoll(poll._id.toString());

      const state = await stateRecoveryService.getStudentState(
        session.sessionId
      );

      expect(state.poll).toBeNull();
      expect(state.vote.hasVoted).toBe(false);
    });

    it('should return active poll with vote status', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B'], 60);
      const session = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      const state = await stateRecoveryService.getStudentState(
        session.sessionId
      );

      expect(state.poll).toBeDefined();
      expect(state.poll?._id).toBe(poll._id.toString());
      expect(state.poll?.question).toBe('Test?');
      expect(state.poll?.options).toHaveLength(2);
      expect(state.poll?.status).toBe('active');
      expect(state.vote.hasVoted).toBe(false);
      expect(state.vote.votedOptionId).toBeUndefined();
    });

    it('should indicate student has voted when vote exists', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B'], 60);
      const session = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        session.sessionId,
        'Alice'
      );

      const state = await stateRecoveryService.getStudentState(
        session.sessionId
      );

      expect(state.vote.hasVoted).toBe(true);
      expect(state.vote.votedOptionId).toBe(poll.options[0].id);
    });

    it('should return correct remaining time', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B'], 60);
      const session = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      const state = await stateRecoveryService.getStudentState(
        session.sessionId
      );

      expect(state.remainingTime).toBeGreaterThan(55);
      expect(state.remainingTime).toBeLessThanOrEqual(60);
    });

    it('should include vote counts in poll options', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B'], 60);
      const session1 = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );
      const session2 = await studentService.createSession(
        'sess-002',
        poll._id.toString(),
        'Bob'
      );

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        session1.sessionId,
        'Alice'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        session2.sessionId,
        'Bob'
      );

      const state = await stateRecoveryService.getStudentState(
        session1.sessionId
      );

      expect(state.poll?.options[0].voteCount).toBe(2);
      expect(state.poll?.options[1].voteCount).toBe(0);
      expect(state.poll?.totalVotes).toBe(2);
    });
  });

  describe('getTeacherState', () => {
    it('should return null poll when no active poll exists', async () => {
      const state = await stateRecoveryService.getTeacherState();

      expect(state.poll).toBeNull();
      expect(state.remainingTime).toBe(0);
      expect(state.totalVotes).toBe(0);
      expect(state.votes).toHaveLength(0);
      expect(state.serverTime).toBeInstanceOf(Date);
    });

    it('should return active poll with all vote details', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B', 'C'], 60);
      const session1 = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );
      const session2 = await studentService.createSession(
        'sess-002',
        poll._id.toString(),
        'Bob'
      );

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        session1.sessionId,
        'Alice'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[1].id,
        session2.sessionId,
        'Bob'
      );

      const state = await stateRecoveryService.getTeacherState();

      expect(state.poll).toBeDefined();
      expect(state.poll?._id).toBe(poll._id.toString());
      expect(state.poll?.question).toBe('Test?');
      expect(state.totalVotes).toBe(2);
      expect(state.votes).toHaveLength(2);
      expect(state.votes[0].studentName).toBe('Alice');
      expect(state.votes[1].studentName).toBe('Bob');
    });

    it('should include vote counts per option', async () => {
      const poll = await pollService.createPoll('Test?', ['A', 'B'], 60);
      const session1 = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );
      const session2 = await studentService.createSession(
        'sess-002',
        poll._id.toString(),
        'Bob'
      );
      const session3 = await studentService.createSession(
        'sess-003',
        poll._id.toString(),
        'Charlie'
      );

      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        session1.sessionId,
        'Alice'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[0].id,
        session2.sessionId,
        'Bob'
      );
      await voteService.submitVote(
        poll._id.toString(),
        poll.options[1].id,
        session3.sessionId,
        'Charlie'
      );

      const state = await stateRecoveryService.getTeacherState();

      expect(state.poll?.options[0].voteCount).toBe(2);
      expect(state.poll?.options[1].voteCount).toBe(1);
      expect(state.poll?.totalVotes).toBe(3);
    });

    it('should return correct remaining time', async () => {
      await pollService.createPoll('Test?', ['A', 'B'], 60);

      const state = await stateRecoveryService.getTeacherState();

      expect(state.remainingTime).toBeGreaterThan(55);
      expect(state.remainingTime).toBeLessThanOrEqual(60);
    });

    it('should return empty votes array when no votes submitted', async () => {
      await pollService.createPoll('Test?', ['A', 'B'], 60);

      const state = await stateRecoveryService.getTeacherState();

      expect(state.votes).toHaveLength(0);
      expect(state.totalVotes).toBe(0);
      expect(state.poll?.totalVotes).toBe(0);
    });
  });

  describe('restoreSession', () => {
    it('should restore valid session', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      const restored = await stateRecoveryService.restoreSession('sess-001');

      expect(restored).toBeDefined();
      expect(restored?.sessionId).toBe('sess-001');
      expect(restored?.studentName).toBe('Alice');
      expect(restored?.isOnline).toBe(true);
      expect(restored?.joinedAt).toBeInstanceOf(Date);
    });

    it('should return null for non-existent session', async () => {
      const restored =
        await stateRecoveryService.restoreSession('non-existent');

      expect(restored).toBeNull();
    });

    it('should return null for blocked session', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      // Block the student
      await studentService.removeStudent('sess-001');

      const restored = await stateRecoveryService.restoreSession('sess-001');

      expect(restored).toBeNull();
    });

    it('should update lastHeartbeat when restoring session', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      // Wait a bit
      await new Promise((resolve) => setTimeout(resolve, 10));

      const before = await studentService.getSession('sess-001');
      await stateRecoveryService.restoreSession('sess-001');
      const after = await studentService.getSession('sess-001');

      expect(after?.lastHeartbeat.getTime()).toBeGreaterThanOrEqual(
        before!.lastHeartbeat.getTime()
      );
    });
  });
});
