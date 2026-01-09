import mongoose, { Schema, Document } from 'mongoose';
import { StudentSession as IStudentSession } from '../types';

interface StudentSessionDocument
  extends Omit<IStudentSession, '_id'>, Document {}

const StudentSessionSchema = new Schema<StudentSessionDocument>(
  {
    sessionId: {
      type: String,
      required: true,
      unique: true,
    },
    pollId: {
      type: String,
      required: true,
      ref: 'Poll',
    },
    studentName: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    lastHeartbeat: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance optimization
StudentSessionSchema.index({ sessionId: 1 }, { unique: true }); // Fast session lookup
StudentSessionSchema.index({ pollId: 1 }); // Fast lookup of all students in a poll
StudentSessionSchema.index({ isActive: 1, pollId: 1 }); // Fast lookup of active students per poll
StudentSessionSchema.index({ isBlocked: 1 }); // Fast lookup of blocked students
StudentSessionSchema.index({ lastHeartbeat: 1 }); // For cleanup operations

export const StudentSessionModel = mongoose.model<StudentSessionDocument>(
  'StudentSession',
  StudentSessionSchema
);
