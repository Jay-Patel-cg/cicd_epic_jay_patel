const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', '..', 'cicd-epic.json');
console.log(`Loading dataset from: ${filePath}`);

if (!fs.existsSync(filePath)) {
  console.error('Dataset file not found!');
  process.exit(1);
}

const rawData = fs.readFileSync(filePath, 'utf8');
const dataset = JSON.parse(rawData);

console.log('\n======================================');
console.log('DATASET ANALYSIS REPORT');
console.log('======================================');

const totalRecords = dataset.length;
console.log(`Total Records in File: ${totalRecords}`);

// Track fields and counts
const fieldCounts = {};
let missingFieldsCount = 0;
const missingDetails = {
  instruction: 0,
  output: 0,
  topic: 0,
  difficulty: 0
};

const topicDistribution = {};
const difficultyDistribution = {};
const uniqueKeys = new Set();
let duplicatesCount = 0;
let validCount = 0;
let invalidCount = 0;

dataset.forEach((record, index) => {
  // Capture all fields present in any record
  Object.keys(record).forEach(key => {
    fieldCounts[key] = (fieldCounts[key] || 0) + 1;
  });

  const { instruction, output, topic, difficulty } = record;
  
  // Validation checks
  let isMissing = false;
  if (!instruction) { missingDetails.instruction++; isMissing = true; }
  if (!output) { missingDetails.output++; isMissing = true; }
  if (!topic) { missingDetails.topic++; isMissing = true; }
  if (!difficulty) { missingDetails.difficulty++; isMissing = true; }

  if (isMissing) {
    missingFieldsCount++;
    invalidCount++;
    return;
  }

  // Duplicate check: instruction + topic
  // Normalize fields to ensure reliable comparisons
  const normInstruction = instruction.toString().trim();
  const normTopic = topic.toString().trim().toLowerCase();
  const dupKey = `${normInstruction}|||${normTopic}`;

  if (uniqueKeys.has(dupKey)) {
    duplicatesCount++;
  } else {
    uniqueKeys.add(dupKey);
    validCount++;
    
    // Distributions only for unique valid records
    const cleanTopic = normTopic;
    topicDistribution[cleanTopic] = (topicDistribution[cleanTopic] || 0) + 1;

    const cleanDiff = difficulty.toString().trim().toLowerCase();
    difficultyDistribution[cleanDiff] = (difficultyDistribution[cleanDiff] || 0) + 1;
  }
});

console.log('\n--- Field Presence Summary ---');
console.log('Available Fields across all records:');
Object.entries(fieldCounts).forEach(([field, count]) => {
  console.log(`- ${field}: present in ${count} records (${((count / totalRecords) * 100).toFixed(2)}%)`);
});

console.log('\n--- Missing Fields Details ---');
console.log(`Records with any missing primary fields: ${missingFieldsCount}`);
Object.entries(missingDetails).forEach(([field, count]) => {
  console.log(`- Missing '${field}': ${count} records`);
});

console.log('\n--- Duplicate Records Summary ---');
console.log(`Duplicate Records (same instruction + topic): ${duplicatesCount}`);
console.log(`Unique Valid Records: ${validCount}`);

console.log('\n--- Topic Distribution (Unique Records) ---');
const sortedTopics = Object.entries(topicDistribution).sort((a, b) => b[1] - a[1]);
sortedTopics.forEach(([topic, count]) => {
  console.log(`- ${topic}: ${count} (${((count / validCount) * 100).toFixed(2)}%)`);
});

console.log('\n--- Difficulty Distribution (Unique Records) ---');
const sortedDiffs = Object.entries(difficultyDistribution).sort((a, b) => b[1] - a[1]);
sortedDiffs.forEach(([diff, count]) => {
  console.log(`- ${diff}: ${count} (${((count / validCount) * 100).toFixed(2)}%)`);
});

console.log('======================================\n');
