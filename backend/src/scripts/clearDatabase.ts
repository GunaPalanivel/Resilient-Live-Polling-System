import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const clearDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;

    if (!mongoUri) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    await mongoose.connect(mongoUri);
    logger.info('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection not established');
    }

    // Get all collections
    const collections = await db.listCollections().toArray();
    logger.info(`📊 Found ${collections.length} collections`);

    // Drop all collections
    for (const collection of collections) {
      await db.collection(collection.name).deleteMany({});
      logger.info(`✅ Cleared collection: ${collection.name}`);
    }

    logger.info('🗑️ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('❌ Error clearing database:', error);
    process.exit(1);
  }
};

clearDatabase();
