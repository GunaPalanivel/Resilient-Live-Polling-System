import { StudentService } from '../../services/StudentService';
import { PollService } from '../../services/PollService';

describe('StudentService', () => {
  let studentService: StudentService;
  let pollService: PollService;

  beforeEach(() => {
    studentService = new StudentService();
    pollService = new PollService();
  });

  describe('createSession', () => {
    it('should create a new student session', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const session = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      expect(session).toBeDefined();
      expect(session.sessionId).toBe('sess-001');
      expect(session.studentName).toBe('Alice');
      expect(session.pollId).toBe(poll._id.toString());
      expect(session.isActive).toBe(true);
      expect(session.isBlocked).toBe(false);
    });

    it('should update existing session if sessionId already exists', async () => {
      const poll1 = await pollService.createPoll('Test 1', ['A', 'B'], 60);

      // Create initial session
      await studentService.createSession(
        'sess-001',
        poll1._id.toString(),
        'Alice'
      );

      // End first poll to create second
      await pollService.endPoll(poll1._id.toString());

      const poll2 = await pollService.createPoll('Test 2', ['C', 'D'], 60);

      // Update to new poll with same sessionId
      const updated = await studentService.createSession(
        'sess-001',
        poll2._id.toString(),
        'Alice Updated'
      );

      expect(updated.sessionId).toBe('sess-001');
      expect(updated.pollId).toBe(poll2._id.toString());
      expect(updated.studentName).toBe('Alice Updated');
      expect(updated.isActive).toBe(true);
    });

    it('should trim student names', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const session = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        '  Alice  '
      );

      expect(session.studentName).toBe('Alice');
    });
  });

  describe('getSession', () => {
    it('should return session by sessionId', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      const session = await studentService.getSession('sess-001');

      expect(session).toBeDefined();
      expect(session?.sessionId).toBe('sess-001');
    });

    it('should return null for non-existent session', async () => {
      const session = await studentService.getSession('non-existent');
      expect(session).toBeNull();
    });
  });

  describe('updateHeartbeat', () => {
    it('should update lastHeartbeat timestamp', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      const created = await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      // Wait a bit before updating
      await new Promise((resolve) => setTimeout(resolve, 10));

      await studentService.updateHeartbeat('sess-001');

      const session = await studentService.getSession('sess-001');
      expect(session?.lastHeartbeat.getTime()).toBeGreaterThan(
        created.lastHeartbeat.getTime()
      );
    });

    it('should set isActive to true when updating heartbeat', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      // Disconnect student
      await studentService.disconnectStudent('sess-001');

      // Update heartbeat should reactivate
      await studentService.updateHeartbeat('sess-001');

      const session = await studentService.getSession('sess-001');
      expect(session?.isActive).toBe(true);
    });
  });

  describe('getActiveStudents', () => {
    it('should return all active students for a poll', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );
      await studentService.createSession(
        'sess-002',
        poll._id.toString(),
        'Bob'
      );
      await studentService.createSession(
        'sess-003',
        poll._id.toString(),
        'Charlie'
      );

      const activeStudents = await studentService.getActiveStudents(
        poll._id.toString()
      );

      expect(activeStudents).toHaveLength(3);
      expect(activeStudents.map((s) => s.studentName)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ]);
    });

    it('should exclude blocked students', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );
      await studentService.createSession(
        'sess-002',
        poll._id.toString(),
        'Bob'
      );

      // Block Bob
      await studentService.removeStudent('sess-002');

      const activeStudents = await studentService.getActiveStudents(
        poll._id.toString()
      );

      expect(activeStudents).toHaveLength(1);
      expect(activeStudents[0].studentName).toBe('Alice');
    });

    it('should exclude inactive students', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );
      await studentService.createSession(
        'sess-002',
        poll._id.toString(),
        'Bob'
      );

      // Disconnect Bob
      await studentService.disconnectStudent('sess-002');

      const activeStudents = await studentService.getActiveStudents(
        poll._id.toString()
      );

      expect(activeStudents).toHaveLength(1);
      expect(activeStudents[0].studentName).toBe('Alice');
    });

    it('should return empty array for poll with no students', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);

      const activeStudents = await studentService.getActiveStudents(
        poll._id.toString()
      );

      expect(activeStudents).toHaveLength(0);
    });
  });

  describe('removeStudent', () => {
    it('should mark student as inactive and blocked', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      await studentService.removeStudent('sess-001');

      const session = await studentService.getSession('sess-001');
      expect(session?.isActive).toBe(false);
      expect(session?.isBlocked).toBe(true);
    });

    it('should prevent removed student from appearing in active list', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      await studentService.removeStudent('sess-001');

      const activeStudents = await studentService.getActiveStudents(
        poll._id.toString()
      );
      expect(activeStudents).toHaveLength(0);
    });
  });

  describe('disconnectStudent', () => {
    it('should mark student as inactive but not blocked', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      await studentService.disconnectStudent('sess-001');

      const session = await studentService.getSession('sess-001');
      expect(session?.isActive).toBe(false);
      expect(session?.isBlocked).toBe(false);
    });
  });

  describe('isStudentBlocked', () => {
    it('should return true for blocked student', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      await studentService.removeStudent('sess-001');

      const isBlocked = await studentService.isStudentBlocked('sess-001');
      expect(isBlocked).toBe(true);
    });

    it('should return false for active student', async () => {
      const poll = await pollService.createPoll('Test', ['A', 'B'], 60);
      await studentService.createSession(
        'sess-001',
        poll._id.toString(),
        'Alice'
      );

      const isBlocked = await studentService.isStudentBlocked('sess-001');
      expect(isBlocked).toBe(false);
    });

    it('should return false for non-existent student', async () => {
      const isBlocked = await studentService.isStudentBlocked('non-existent');
      expect(isBlocked).toBe(false);
    });
  });
});
