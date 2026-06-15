const http = require('http');

const baseUrl = 'http://localhost:5000/api/v1';

const getJSON = (url) => {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          reject(new Error(`Failed to parse JSON from ${url}: ${e.message}. Raw output: ${data.slice(0, 200)}`));
        }
      });
    }).on('error', reject);
  });
};

const verifyEndpoints = async () => {
  console.log('\n==============================================');
  console.log('STARTING API ENDPOINT VERIFICATION');
  console.log('==============================================\n');

  try {
    // 1. GET /api/v1/knowledge
    console.log('1. Checking GET /api/v1/knowledge...');
    const knowledgeRes = await getJSON(`${baseUrl}/knowledge?limit=5`);
    if (knowledgeRes.status === 200 && knowledgeRes.data.success) {
      console.log(`[✔] PASS: /api/v1/knowledge returned status 200. Total page records: ${knowledgeRes.data.data.records.length}\n`);
    } else {
      console.log(`[❌] FAIL: /api/v1/knowledge returned status ${knowledgeRes.status}. Message: ${knowledgeRes.data.message}\n`);
    }

    // 2. GET /api/v1/search?q=docker
    console.log('2. Checking GET /api/v1/search?q=docker...');
    const dockerRes = await getJSON(`${baseUrl}/search?q=docker&limit=2`);
    if (dockerRes.status === 200 && dockerRes.data.success && dockerRes.data.data.records.length > 0) {
      console.log(`[✔] PASS: /api/v1/search?q=docker returned ${dockerRes.data.data.records.length} guides.\n`);
    } else {
      console.log(`[❌] FAIL: /api/v1/search?q=docker failed. Status: ${dockerRes.status}\n`);
    }

    // 3. GET /api/v1/search?q=kubernetes
    console.log('3. Checking GET /api/v1/search?q=kubernetes...');
    const k8sRes = await getJSON(`${baseUrl}/search?q=kubernetes&limit=2`);
    if (k8sRes.status === 200 && k8sRes.data.success && k8sRes.data.data.records.length > 0) {
      console.log(`[✔] PASS: /api/v1/search?q=kubernetes returned ${k8sRes.data.data.records.length} guides.\n`);
    } else {
      console.log(`[❌] FAIL: /api/v1/search?q=kubernetes failed. Status: ${k8sRes.status}\n`);
    }

    // 4. GET /api/v1/search?q=terraform
    console.log('4. Checking GET /api/v1/search?q=terraform...');
    const terraformRes = await getJSON(`${baseUrl}/search?q=terraform&limit=2`);
    if (terraformRes.status === 200 && terraformRes.data.success && terraformRes.data.data.records.length > 0) {
      console.log(`[✔] PASS: /api/v1/search?q=terraform returned ${terraformRes.data.data.records.length} guides.\n`);
    } else {
      console.log(`[❌] FAIL: /api/v1/search?q=terraform failed. Status: ${terraformRes.status}\n`);
    }

    // 5. GET /api/v1/search?q=github
    console.log('5. Checking GET /api/v1/search?q=github...');
    const githubRes = await getJSON(`${baseUrl}/search?q=github&limit=2`);
    if (githubRes.status === 200 && githubRes.data.success && githubRes.data.data.records.length > 0) {
      console.log(`[✔] PASS: /api/v1/search?q=github returned ${githubRes.data.data.records.length} guides.\n`);
    } else {
      console.log(`[❌] FAIL: /api/v1/search?q=github failed. Status: ${githubRes.status}\n`);
    }

    console.log('==============================================');
    console.log('API VERIFICATION COMPLETE: ALL CHECKS EVALUATED.');
    console.log('==============================================\n');
  } catch (error) {
    console.error(`[!] Verification script encountered a fatal error: ${error.message}`);
  }
};

verifyEndpoints();
