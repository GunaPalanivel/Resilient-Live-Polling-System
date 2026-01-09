import mongoose, { Schema, Document } from 'mongoose';
import { Vote as IVote } from '../types';

interface VoteDocument extends Omit<IVote, '_id'>, Document {}

const VoteSchema = new Schema<VoteDocument>(
  {
    pollId: {
      type: String,
      required: true,
      ref: 'Poll',
    },
    optionId: {
      type: String,
      required: true,
    },
    studentSessionId: {
      type: String,
      required: true,
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
    },
    votedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);

// Prevent duplicate votes per poll/session pair (critical for race condition protection)
VoteSchema.index({ pollId: 1, studentSessionId: 1 }, { unique: true });

// Additional indexes for performance
VoteSchema.index({ pollId: 1 }); // Fast lookup of all votes for a poll
VoteSchema.index({ studentSessionId: 1 }); // Fast lookup of votes by student
VoteSchema.index({ votedAt: -1 }); // Sort by vote time

export const VoteModel = mongoose.model<VoteDocument>('Vote', VoteSchema);
