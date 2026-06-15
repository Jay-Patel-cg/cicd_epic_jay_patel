const fs = require('fs');
const path = require('path');
const connectDB = require('../config/db');
const Knowledge = require('../models/Knowledge');
const User = require('../models/User');
const Bookmark = require('../models/Bookmark');
const Comment = require('../models/Comment');
const Review = require('../models/Review');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');

require('dotenv').config();

const seed = async () => {
  try {
    console.log('Seeding script started...');
    console.log('Connecting to MongoDB...');
    await connectDB();

    const shouldReset = process.argv.includes('--reset');

    if (shouldReset) {
      console.log('Reset flag [--reset] detected. Purging all collections...');
      await User.deleteMany({});
      await Knowledge.deleteMany({});
      await Bookmark.deleteMany({});
      await Comment.deleteMany({});
      await Review.deleteMany({});
      await Notification.deleteMany({});
      await Analytics.deleteMany({});
      console.log('[✔] All collections purged successfully.');
    }

    console.log('Checking and seeding default user accounts...');
    const defaultUserEmail = 'user@devops.com';
    const defaultAdminEmail = 'admin@devops.com';

    // Seed default standard user if not existing
    const userExists = await User.findOne({ email: defaultUserEmail });
    let defaultUser;
    if (!userExists) {
      defaultUser = await User.create({
        name: 'Regular DevOps User',
        email: defaultUserEmail,
        password: 'Password123',
        role: 'user',
        emailVerified: true,
      });
      console.log(`[+] Seeded default user: ${defaultUserEmail} / Password123`);
    } else {
      defaultUser = userExists;
      console.log(`[.] Default user ${defaultUserEmail} already exists.`);
    }

    // Seed default administrator if not existing
    const adminExists = await User.findOne({ email: defaultAdminEmail });
    let defaultAdmin;
    if (!adminExists) {
      defaultAdmin = await User.create({
        name: 'DevOps Administrator',
        email: defaultAdminEmail,
        password: 'AdminPassword123',
        role: 'admin',
        emailVerified: true,
      });
      console.log(`[+] Seeded default admin: ${defaultAdminEmail} / AdminPassword123`);
    } else {
      defaultAdmin = adminExists;
      console.log(`[.] Default admin ${defaultAdminEmail} already exists.`);
    }

    // Resolve JSON path
    const filePath = path.join(__dirname, '..', '..', 'cicd-epic.json');
    console.log(`Loading dataset file from: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      throw new Error(`Dataset file does not exist at target path: ${filePath}`);
    }

    // Load and parse dataset
    const rawData = fs.readFileSync(filePath, 'utf8');
    const dataset = JSON.parse(rawData);
    console.log(`Parsed dataset. Total entries found: ${dataset.length}`);

    // Record-level Validation
    const validRecords = [];
    let invalidCount = 0;
    const allowedDifficulties = ['beginner', 'intermediate', 'advanced', 'expert'];

    dataset.forEach((record) => {
      const { instruction, output, topic, difficulty } = record;

      if (!instruction || !output || !topic || !difficulty) {
        invalidCount++;
        return;
      }

      const diffClean = difficulty.toLowerCase().trim();
      if (!allowedDifficulties.includes(diffClean)) {
        invalidCount++;
        return;
      }

      validRecords.push({
        instruction: instruction.trim(),
        output: output.trim(),
        topic: topic.toLowerCase().trim(),
        difficulty: diffClean,
      });
    });

    console.log(`Validation report: ${validRecords.length} records are valid. ${invalidCount} records skipped.`);

    if (validRecords.length === 0) {
      console.log('No valid records to insert. Exiting.');
      process.exit(0);
    }

    console.log('Executing high-performance bulkWrite...');

    // Prepare bulk database upsert operations
    const bulkOps = validRecords.map((record) => ({
      updateOne: {
        filter: { instruction: record.instruction, output: record.output },
        update: {
          $setOnInsert: {
            instruction: record.instruction,
            output: record.output,
            topic: record.topic,
            difficulty: record.difficulty,
            views: 0,
            likes: 0,
          },
        },
        upsert: true,
      },
    }));

    // Seeding in batches of 1000 to manage CPU/Memory and Mongoose channel bandwidth
    const batchSize = 1000;
    let upsertedCount = 0;
    let matchedCount = 0;

    for (let i = 0; i < bulkOps.length; i += batchSize) {
      const batch = bulkOps.slice(i, i + batchSize);
      console.log(`Processing batch ${Math.floor(i / batchSize) + 1} of ${Math.ceil(bulkOps.length / batchSize)}...`);
      
      const result = await Knowledge.bulkWrite(batch, { ordered: false });
      
      upsertedCount += result.upsertedCount || 0;
      matchedCount += result.matchedCount || 0;
    }

    console.log('\n======================================================');
    console.log('SEEDING EXECUTION SUMMARY:');
    console.log(`- Total valid items evaluated: ${validRecords.length}`);
    console.log(`- Newly inserted records (new guides): ${upsertedCount}`);
    console.log(`- Skipped records (already exist in DB): ${matchedCount}`);
    console.log('======================================================\n');

    // Seed relationship data examples if database was reset or empty
    if (shouldReset || upsertedCount > 0) {
      console.log('Seeding relational templates (bookmarks, comments, reviews, analytics, notifications)...');
      
      const sampleGuides = await Knowledge.find({ topic: 'docker' }).limit(3);
      if (sampleGuides.length > 0) {
        // 1. Seed Bookmark
        await Bookmark.create({
          user: defaultUser._id,
          knowledge: sampleGuides[0]._id,
        }).catch(() => {});
        console.log('[+] Seeded sample Bookmark.');

        // 2. Seed Comment
        await Comment.create({
          user: defaultUser._id,
          knowledge: sampleGuides[0]._id,
          comment: 'Outstanding docker multi-stage configuration guide! Instantly streamlined our workflow.',
        }).catch(() => {});
        console.log('[+] Seeded sample Comment.');

        // 3. Seed Review
        await Review.create({
          user: defaultUser._id,
          knowledge: sampleGuides[0]._id,
          rating: 5,
          review: 'Extremely detailed technical manual. 5/5 stars.',
        }).catch(() => {});
        console.log('[+] Seeded sample Review.');
      }

      // 4. Seed Notification
      await Notification.create({
        user: defaultUser._id,
        title: 'Welcome to the DevOps Platform',
        message: 'Explore Kubernetes, Docker, and GitHub Actions starter templates inside the Catalog!',
      }).catch(() => {});
      console.log('[+] Seeded sample Notification.');

      // 5. Seed Analytics Events
      await Analytics.create([
        { type: 'search_query', count: 42, metadata: { query: 'docker compose', results: 1810 } },
        { type: 'search_query', count: 12, metadata: { query: 'kubernetes ingress', results: 556 } },
        { type: 'tool_usage', count: 185, metadata: { tool: 'docker', actions: ['run', 'build'] } },
        { type: 'tool_usage', count: 86, metadata: { tool: 'kubernetes', actions: ['apply', 'delete'] } },
      ]).catch(() => {});
      console.log('[+] Seeded sample Analytics metrics.');
    }

    console.log('Database seeding process completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('CRITICAL: Seeding failed to execute completely.');
    console.error(error.message);
    if (error.stack) console.error(error.stack);
    process.exit(1);
  }
};

seed();
