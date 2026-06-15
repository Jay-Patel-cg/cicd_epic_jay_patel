const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Knowledge = require('../src/models/Knowledge');
const seedKnowledge = require('./seedKnowledge');

// Load environment variables
require('dotenv').config();

const resetAndSeed = async () => {
  try {
    console.log('Reset and Seed Script Initiated...');
    console.log('Connecting to MongoDB...');
    await connectDB();

    console.log('Resetting Knowledge collection... purging all documents...');
    const deleteResult = await Knowledge.deleteMany({});
    console.log(`[✔] Knowledge collection purged successfully. Removed ${deleteResult.deletedCount} documents.`);

    console.log('Delegating to Seeding Engine...');
    // seedKnowledge handles its own data loading and reporting
    await seedKnowledge();

    console.log('Reset and Seeding complete. Closing database connection.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL: Reset and Seed operation failed!');
    console.error(error.message);
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

resetAndSeed();
