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

export const VoteModel = mongoose.model<VoteDocument>('Vote', VoteSchema);
