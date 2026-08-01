import mongoose from 'mongoose';
import { env } from './env.js';

mongoose.set('strictQuery', true);
mongoose.set('bufferCommands', true);
mongoose.set('bufferTimeoutMS', 4000);

let isConnected = false;

export const connectDB = async () => {
  try {
    await mongoose.connect(env.mongoUri, { serverSelectionTimeoutMS: 5000 });
    isConnected = true;
    console.log(`[db] Connected to MongoDB at ${env.mongoUri}`);
  } catch (err) {
    isConnected = false;
    console.error(`[db] Failed to connect to MongoDB: ${err.message}`);
    console.error('[db] The API will keep running so /health stays reachable, but data routes will fail until a database is available.');
  }
};

export const isDbConnected = () => isConnected;

mongoose.connection.on('disconnected', () => { isConnected = false; });
mongoose.connection.on('reconnected', () => { isConnected = true; });

export default connectDB;
