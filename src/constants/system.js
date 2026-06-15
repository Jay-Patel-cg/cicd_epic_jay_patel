const APP_VERSION = '1.0.0';
const API_PREFIX = '/api/v1';

const ALLOWED_TOPICS = [
  'docker',
  'kubernetes',
  'jenkins',
  'terraform',
  'github-actions',
  'gitlab-ci',
  'ansible',
  'helm',
  'monitoring',
  'security',
  'testing',
  'storage',
  'general',
  'api',
];

const ALLOWED_DIFFICULTIES = ['beginner', 'intermediate', 'advanced', 'expert'];

const DUMMY_WORKFLOW_LOGS = [
  '[INFO] 14:02:10 - Checking out repository source code...',
  '[INFO] 14:02:12 - Resolved Node.js engine target environment (v20.12.2)',
  '[INFO] 14:02:15 - Executing "npm ci" clean dependencies installation...',
  '[WARN] 14:02:18 - npm warn deprecated glob@11.1.0: Old version contains vulnerabilities.',
  '[INFO] 14:02:22 - Dependency parsing complete. Audited 179 packages in 7.4 seconds.',
  '[INFO] 14:02:24 - Triggering codebase automated tests suite (jest)...',
  '[PASS] 14:02:30 - tests/unit/auth.test.js - Successful login token production',
  '[PASS] 14:02:32 - tests/integration/search.test.js - Topic queries return hits',
  '[INFO] 14:02:35 - Executing docker image encapsulation "docker build -t app:latest ."...',
  '[INFO] 14:02:45 - Push target image build payload to Docker Hub registry...',
  '[INFO] 14:02:50 - Triggering deployment to Kubernetes cluster (Helm upgrade)...',
  '[SUCCESS] 14:02:55 - Pipeline executed successfully. Deployment running.',
];

const DUMMY_WORKFLOW_METRICS = {
  durationMs: 45000,
  cpuUsagePercent: 32.4,
  memoryUsageBytes: 524288000,
  successRate: 0.985,
  stepsCount: 12,
  costEstimatedUsd: 0.045,
};

module.exports = {
  APP_VERSION,
  API_PREFIX,
  ALLOWED_TOPICS,
  ALLOWED_DIFFICULTIES,
  DUMMY_WORKFLOW_LOGS,
  DUMMY_WORKFLOW_METRICS,
};
