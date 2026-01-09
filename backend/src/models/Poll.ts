import mongoose, { Schema, Document } from 'mongoose';
import { Poll as IPoll, PollOption } from '../types';

interface PollDocument extends Omit<IPoll, '_id'>, Document {}

const PollOptionSchema = new Schema<PollOption>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true },
    voteCount: { type: Number, default: 0 },
  },
  { _id: false }
);

const PollSchema = new Schema<PollDocument>(
  {
    question: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 500,
    },
    options: {
      type: [PollOptionSchema],
      required: true,
      validate: {
        validator: function (v: PollOption[]) {
          return v.length >= 2 && v.length <= 10;
        },
        message: 'Poll must have between 2 and 10 options',
      },
    },
    duration: {
      type: Number,
      required: true,
      min: 10,
      max: 600,
    },
    status: {
      type: String,
      enum: ['active', 'ended', 'expired'],
      default: 'active',
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endedAt: {
      type: Date,
    },
    totalVotes: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual for checking if poll is expired
PollSchema.virtual('isExpired').get(function () {
  if (this.status !== 'active') return false;
  const elapsed = Date.now() - this.startedAt.getTime();
  return elapsed >= this.duration * 1000;
});

// Virtual for remaining time
PollSchema.virtual('remainingSeconds').get(function () {
  if (this.status !== 'active') return 0;
  const elapsed = Date.now() - this.startedAt.getTime();
  const remaining = this.duration - Math.floor(elapsed / 1000);
  return Math.max(0, remaining);
});

export const PollModel = mongoose.model<PollDocument>('Poll', PollSchema);
