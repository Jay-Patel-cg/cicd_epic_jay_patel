const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const Knowledge = require('../src/models/Knowledge');

// Load environment variables
require('dotenv').config();

const seedKnowledge = async () => {
  let connectionOpenedLocally = false;
  try {
    console.log('Starting DevOps Knowledge Seeding Engine...');

    // 1. Establish Database Connection if not already connected
    if (mongoose.connection.readyState === 0) {
      console.log('Connecting to MongoDB...');
      await connectDB();
      connectionOpenedLocally = true;
    }

    // 2. Resolve dataset path
    const filePath = path.join(__dirname, '..', 'cicd-epic.json');
    console.log(`Loading dataset file from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Dataset file does not exist at: ${filePath}`);
    }

    // 3. Load and parse dataset
    const rawData = fs.readFileSync(filePath, 'utf8');
    const dataset = JSON.parse(rawData);
    const totalRecords = dataset.length;
    console.log(`Successfully parsed dataset. Total records in file: ${totalRecords}`);

    // 4. Fetch existing records from MongoDB to ensure idempotency across multiple runs
    console.log('Fetching existing records from MongoDB to build unique index cache...');
    const existingKnowledge = await Knowledge.find({}, { instruction: 1, topic: 1 }).lean();
    
    // Use the instruction + topic duplicate detection rule
    const existingCache = new Set();
    existingKnowledge.forEach(doc => {
      if (doc.instruction && doc.topic) {
        const normKey = `${doc.instruction.toString().trim()}|||${doc.topic.toString().trim().toLowerCase()}`;
        existingCache.add(normKey);
      }
    });
    console.log(`Cached ${existingCache.size} unique keys from the database.`);

    // 5. In-Memory Processing & Validation
    const recordsToInsert = [];
    const processedInSession = new Set();
    
    let duplicateCount = 0;
    let failedCount = 0;
    let skippedCount = 0;

    console.log('Validating dataset records...');
    const allowedDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

    dataset.forEach((record, index) => {
      const { instruction, output, topic, difficulty } = record;

      // Validation Check
      if (!instruction || !output || !topic || !difficulty) {
        failedCount++;
        return;
      }

      const cleanInstruction = instruction.toString().trim();
      const cleanOutput = output.toString().trim();
      const cleanTopic = topic.toString().trim().toLowerCase();
      const cleanDiff = difficulty.toString().trim().toLowerCase();

      // Ensure valid difficulty levels
      if (!allowedDifficulties.includes(cleanDiff)) {
        failedCount++;
        return;
      }

      // Unique Identifier Key (instruction + topic)
      const dupKey = `${cleanInstruction}|||${cleanTopic}`;

      // Duplicate Check
      if (existingCache.has(dupKey) || processedInSession.has(dupKey)) {
        duplicateCount++;
        skippedCount++;
        return;
      }

      // Add to session cache to avoid duplicates inside the JSON file
      processedInSession.add(dupKey);

      recordsToInsert.push({
        instruction: cleanInstruction,
        output: cleanOutput,
        topic: cleanTopic,
        difficulty: cleanDiff,
        views: 0,
        likes: 0
      });
    });

    console.log(`Validation complete. Found ${recordsToInsert.length} new unique records to insert.`);

    // 6. Bulk Insert Execution (Batch sizes of 1000 for high efficiency)
    const batchSize = 1000;
    let insertedCount = 0;

    if (recordsToInsert.length > 0) {
      console.log(`Executing batch bulk insert operations...`);
      for (let i = 0; i < recordsToInsert.length; i += batchSize) {
        const batch = recordsToInsert.slice(i, i + batchSize);
        console.log(`Ingesting batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(recordsToInsert.length / batchSize)}...`);
        
        // Using insertMany for high-speed raw insertions
        const result = await Knowledge.insertMany(batch, { ordered: false });
        insertedCount += result.length;
      }
    }

    // 7. Display Final Database Report
    console.log('\n======================================================');
    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY');
    console.log('======================================================');
    console.log(`- Total records in dataset file : ${totalRecords}`);
    console.log(`- Inserted records              : ${insertedCount}`);
    console.log(`- Skipped records (Total)       : ${skippedCount + failedCount}`);
    console.log(`  └─ Duplicate records skipped : ${duplicateCount}`);
    console.log(`  └─ Invalid records failed    : ${failedCount}`);
    console.log('======================================================\n');

    // Close local connection if we opened it
    if (connectionOpenedLocally) {
      await mongoose.disconnect();
      console.log('MongoDB connection disconnected cleanly.');
    }
    
    return {
      totalRecords,
      insertedCount,
      skippedCount: skippedCount + failedCount,
      duplicateCount,
      failedCount
    };
  } catch (error) {
    console.error('\nCRITICAL: Seeding terminated with an error:');
    console.error(error.message);
    if (mongoose.connection.readyState !== 0 && connectionOpenedLocally) {
      await mongoose.disconnect();
    }
    process.exit(1);
  }
};

// Run the script if launched directly
if (require.main === module) {
  seedKnowledge();
}

module.exports = seedKnowledge;
