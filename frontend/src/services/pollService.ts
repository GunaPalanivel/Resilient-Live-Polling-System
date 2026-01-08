import { apiClient } from './api';
import { Poll, ApiResponse } from '../types';

export const PollAPI = {
  createPoll: async (
    question: string,
    options: string[],
    duration: number
  ): Promise<Poll> => {
    const response = await apiClient.post<ApiResponse<Poll>>('/polls', {
      question,
      options,
      duration,
    });
    return response.data.data!;
  },

  getCurrentPoll: async (): Promise<Poll | null> => {
    const response = await apiClient.get<ApiResponse<Poll | null>>('/polls/current');
    return response.data.data || null;
  },

  getPollHistory: async (): Promise<Poll[]> => {
    const response = await apiClient.get<ApiResponse<Poll[]>>('/polls/history');
    return response.data.data || [];
  },

  endPoll: async (pollId: string): Promise<Poll> => {
    const response = await apiClient.post<ApiResponse<Poll>>(`/polls/${pollId}/end`);
    return response.data.data!;
  },

  getPollResults: async (pollId: string, isTeacher: boolean = false) => {
    const response = await apiClient.get(`/polls/${pollId}/results`, {
      params: { role: isTeacher ? 'teacher' : 'student' },
    });
    return response.data.data;
  },
};

export const VoteAPI = {
  submitVote: async (
    pollId: string,
    optionId: string,
    studentName: string
  ) => {
    const response = await apiClient.post('/votes', {
      pollId,
      optionId,
      studentName,
    });
    return response.data.data;
  },
};

export const StudentAPI = {
  removeStudent: async (sessionId: string) => {
    const response = await apiClient.delete(`/students/${sessionId}`);
    return response.data;
  },

  getActiveStudents: async (pollId: string) => {
    const response = await apiClient.get(`/students/poll/${pollId}`);
    return response.data.data;
  },
};
