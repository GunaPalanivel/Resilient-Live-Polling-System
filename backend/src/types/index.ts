export type PollStatus = 'active' | 'ended' | 'expired';

export interface PollOption {
  id: string;
  text: string;
}

export interface Poll {
  _id: string;
  question: string;
  options: PollOption[];
  duration: number; // seconds
  status: PollStatus;
  startedAt: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vote {
  _id: string;
  pollId: string;
  optionId: string;
  studentSessionId: string;
  studentName: string;
  votedAt: Date;
}

export interface StudentSession {
  _id: string;
  sessionId: string;
  pollId: string;
  studentName: string;
  isActive: boolean;
  isBlocked: boolean;
  lastHeartbeat: Date;
  createdAt: Date;
}

export interface ChatMessage {
  id: string;
  pollId: string;
  studentSessionId: string;
  studentName: string;
  message: string;
  timestamp: Date;
}

export interface VoteResult {
  optionId: string;
  optionText: string;
  count: number;
  percentage: number;
}

export interface DetailedVote {
  studentName: string;
  optionText: string;
  votedAt: Date;
}

export interface TeacherPollResults {
  poll: Poll;
  totalVotes: number;
  results: VoteResult[];
  detailedVotes: DetailedVote[];
}

export interface StudentPollResults {
  poll: Poll;
  totalVotes: number;
  results: VoteResult[];
  hasVoted: boolean;
  userVote?: string;
}
