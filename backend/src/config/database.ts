import mongoose from 'mongoose';
import { logger } from '../utils/logger';

export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    
    logger.info('✅ MongoDB connected successfully');
    
    // Create indexes
    await createIndexes();
    
  } catch (error) {
    logger.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const createIndexes = async (): Promise<void> => {
  try {
    const db = mongoose.connection.db;
    
    if (!db) {
      throw new Error('Database connection not established');
    }
    
    // Single active poll enforcement
    await db.collection('polls').createIndex(
      { status: 1 },
      { 
        unique: true, 
        partialFilterExpression: { status: 'active' } 
      }
    );
    
    // Vote race condition protection
    await db.collection('votes').createIndex(
      { pollId: 1, studentSessionId: 1 },
      { unique: true }
    );
    
    // Student session TTL (24 hours)
    await db.collection('studentsessions').createIndex(
      { lastHeartbeat: 1 },
      { expireAfterSeconds: 86400 }
    );
    
    // Query optimization indexes
    await db.collection('polls').createIndex({ createdAt: -1 });
    await db.collection('votes').createIndex({ pollId: 1 });
    await db.collection('studentsessions').createIndex({ pollId: 1 });
    
    logger.info('✅ Database indexes created successfully');
  } catch (error) {
    logger.error('❌ Index creation error:', error);
  }
};

mongoose.connection.on('disconnected', () => {
  logger.warn('⚠️ MongoDB disconnected');
});

mongoose.connection.on('error', (error) => {
  logger.error('❌ MongoDB error:', error);
});
