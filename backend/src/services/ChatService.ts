import { ChatMessage } from '../types';
import { v4 as uuidv4 } from 'uuid';

class ChatService {
  private messages: Map<string, ChatMessage[]> = new Map();
  private readonly MAX_MESSAGES_PER_POLL = 100;

  addMessage(
    pollId: string,
    studentSessionId: string,
    studentName: string,
    message: string
  ): ChatMessage {
    const chatMessage: ChatMessage = {
      id: uuidv4(),
      pollId,
      studentSessionId,
      studentName,
      message: message.trim(),
      timestamp: new Date(),
    };

    let pollMessages = this.messages.get(pollId);
    
    if (!pollMessages) {
      pollMessages = [];
      this.messages.set(pollId, pollMessages);
    }

    pollMessages.push(chatMessage);

    // Keep only the last N messages
    if (pollMessages.length > this.MAX_MESSAGES_PER_POLL) {
      pollMessages.shift();
    }

    return chatMessage;
  }

  getMessages(pollId: string, limit: number = 50): ChatMessage[] {
    const pollMessages = this.messages.get(pollId) || [];
    return pollMessages.slice(-limit);
  }

  clearMessages(pollId: string): void {
    this.messages.delete(pollId);
  }

  clearAllMessages(): void {
    this.messages.clear();
  }
}

export const chatService = new ChatService();
