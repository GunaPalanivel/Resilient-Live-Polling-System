import { Server, Socket } from 'socket.io';
import { pollService } from '../services/PollService';
import { voteService } from '../services/VoteService';
import { studentService } from '../services/StudentService';
import { chatService } from '../services/ChatService';
import { timerService } from '../services/TimerService';
import { logger } from '../utils/logger';

export const setupSocketHandlers = (io: Server) => {
  io.on('connection', (socket: Socket) => {
    logger.info(`Client connected: ${socket.id}`);

    // Join role-based rooms
    socket.on('join:teacher', () => {
      socket.join('teacher-room');
      logger.info(`Teacher joined: ${socket.id}`);
    });

    socket.on('join:student', async (data: { sessionId: string; pollId: string; studentName: string }) => {
      try {
        const { sessionId, pollId, studentName } = data;
        
        // Create or update student session
        await studentService.createSession(sessionId, pollId, studentName);
        
        socket.join('student-room');
        socket.join(`poll:${pollId}`);
        
        // Notify teacher of new student
        const students = await studentService.getActiveStudents(pollId);
        io.to('teacher-room').emit('students:update', students);
        
        logger.info(`Student joined: ${socket.id} - ${studentName}`);
      } catch (error) {
        logger.error('Error joining student:', error);
        socket.emit('error', { message: 'Failed to join poll' });
      }
    });

    // Poll creation
    socket.on('poll:create', async (data: { question: string; options: string[]; duration: number }) => {
      try {
        const poll = await pollService.createPoll(data.question, data.options, data.duration);
        
        // Broadcast to all clients
        io.emit('poll:created', poll);
        
        // Start timer
        startPollTimer(io, poll._id, poll.duration);
        
        logger.info(`Poll created: ${poll._id}`);
      } catch (error) {
        logger.error('Error creating poll:', error);
        socket.emit('error', { message: 'Failed to create poll' });
      }
    });

    // Poll end
    socket.on('poll:end', async (data: { pollId: string }) => {
      try {
        const poll = await pollService.endPoll(data.pollId);
        
        // Broadcast to all clients
        io.emit('poll:ended', poll);
        
        // Clear chat messages
        chatService.clearMessages(data.pollId);
        
        logger.info(`Poll ended: ${data.pollId}`);
      } catch (error) {
        logger.error('Error ending poll:', error);
        socket.emit('error', { message: 'Failed to end poll' });
      }
    });

    // Vote submission
    socket.on('vote:submit', async (data: { pollId: string; optionId: string; studentSessionId: string; studentName: string }) => {
      try {
        const vote = await voteService.submitVote(
          data.pollId,
          data.optionId,
          data.studentSessionId,
          data.studentName
        );
        
        // Get updated results
        const results = await voteService.getVoteResults(data.pollId);
        const detailedVotes = await voteService.getDetailedVotes(data.pollId);
        const totalVotes = await voteService.getTotalVotes(data.pollId);
        
        // Send detailed results to teacher
        io.to('teacher-room').emit('vote:update:teacher', {
          results,
          detailedVotes,
          totalVotes,
        });
        
        // Send aggregate results to students
        io.to('student-room').emit('vote:update:student', {
          results,
          totalVotes,
        });
        
        logger.info(`Vote submitted: ${vote._id}`);
      } catch (error) {
        logger.error('Error submitting vote:', error);
        socket.emit('error', { message: error instanceof Error ? error.message : 'Failed to submit vote' });
      }
    });

    // Chat message
    socket.on('chat:send', (data: { pollId: string; studentSessionId: string; studentName: string; message: string }) => {
      try {
        const chatMessage = chatService.addMessage(
          data.pollId,
          data.studentSessionId,
          data.studentName,
          data.message
        );
        
        // Broadcast to poll room
        io.to(`poll:${data.pollId}`).emit('chat:message', chatMessage);
        
        logger.info(`Chat message from ${data.studentName}`);
      } catch (error) {
        logger.error('Error sending chat:', error);
      }
    });

    // Student removal
    socket.on('student:remove', async (data: { sessionId: string; pollId: string }) => {
      try {
        await studentService.removeStudent(data.sessionId);
        
        // Find socket with this session and disconnect
        const sockets = await io.fetchSockets();
        const targetSocket = sockets.find(s => s.handshake.query.sessionId === data.sessionId);
        
        if (targetSocket) {
          targetSocket.emit('student:removed');
          targetSocket.disconnect(true);
        }
        
        // Update student list
        const students = await studentService.getActiveStudents(data.pollId);
        io.to('teacher-room').emit('students:update', students);
        
        logger.info(`Student removed: ${data.sessionId}`);
      } catch (error) {
        logger.error('Error removing student:', error);
      }
    });

    // Heartbeat
    socket.on('heartbeat', async (data: { sessionId: string }) => {
      try {
        await studentService.updateHeartbeat(data.sessionId);
      } catch (error) {
        logger.error('Error updating heartbeat:', error);
      }
    });

    // Disconnect
    socket.on('disconnect', async () => {
      const sessionId = socket.handshake.query.sessionId as string;
      
      if (sessionId) {
        try {
          await studentService.disconnectStudent(sessionId);
          logger.info(`Student disconnected: ${sessionId}`);
        } catch (error) {
          logger.error('Error handling disconnect:', error);
        }
      }
      
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });
};

// Timer implementation
const activeTimers: Map<string, NodeJS.Timeout> = new Map();

const startPollTimer = (io: Server, pollId: string, duration: number) => {
  // Clear existing timer if any
  const existingTimer = activeTimers.get(pollId);
  if (existingTimer) {
    clearInterval(existingTimer);
  }

  let remaining = duration;
  
  const timer = setInterval(async () => {
    remaining--;
    
    // Broadcast timer update
    io.emit('timer:tick', { pollId, remaining });
    
    // Check if expired
    if (remaining <= 0) {
      clearInterval(timer);
      activeTimers.delete(pollId);
      
      try {
        // Expire poll
        const poll = await pollService.expirePoll(pollId);
        io.emit('poll:expired', poll);
        
        logger.info(`Poll expired: ${pollId}`);
      } catch (error) {
        logger.error('Error expiring poll:', error);
      }
    }
  }, 1000);
  
  activeTimers.set(pollId, timer);
};

export const clearAllTimers = () => {
  activeTimers.forEach((timer) => clearInterval(timer));
  activeTimers.clear();
};
