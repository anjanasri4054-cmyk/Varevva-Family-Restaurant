import mongoose from 'mongoose';

let isConnected = false;

export const connectDB = async () => {
  if (isConnected || mongoose.connection.readyState >= 1) {
    return;
  }

  const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://varevvaadmin:Vishnu143@varevva-project.4kstjlg.mongodb.net/varevva?retryWrites=true&w=majority&appName=Varevva-project';

  try {
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 8000
    });
    isConnected = !!conn.connections[0].readyState;
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return isConnected;
  } catch (error) {
    isConnected = false;
    throw new Error(`Database unavailable: ${error.message}`);
  }
};

