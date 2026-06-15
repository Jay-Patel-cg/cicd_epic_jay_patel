const http = require('http');

const baseUrl = 'http://localhost:5000/api/v1';

const testHealth = () => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/health`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.data.status === 'UP') {
            resolve({ pass: true, message: 'PASS: GET /api/v1/health operational and UP' });
          } else {
            resolve({ pass: false, message: `FAIL: GET /api/v1/health returned unexpected payload: ${data}` });
          }
        } catch (e) {
          reject(new Error(`FAIL: Health check response parse error: ${e.message}`));
        }
      });
    }).on('error', (e) => reject(new Error(`FAIL: Server is not running on port 5000: ${e.message}`)));
  });
};

const testLogin = () => {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({
      email: 'user@devops.com',
      password: 'Password123',
    });

    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/v1/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.data.token) {
            resolve({
              pass: true,
              message: 'PASS: POST /api/v1/auth/login successful',
              token: parsed.data.token,
            });
          } else {
            resolve({ pass: false, message: `FAIL: POST /api/v1/auth/login failed: ${parsed.message}` });
          }
        } catch (e) {
          reject(new Error(`FAIL: Login response parse error: ${e.message}`));
        }
      });
    });

    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

const testSearch = () => {
  return new Promise((resolve, reject) => {
    http.get(`${baseUrl}/search?q=docker&topic=docker&limit=1`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.success && parsed.data.records.length > 0) {
            resolve({ pass: true, message: 'PASS: GET /api/v1/search returned relevant guides' });
          } else {
            resolve({ pass: false, message: `FAIL: GET /api/v1/search returned no results or failed: ${data}` });
          }
        } catch (e) {
          reject(new Error(`FAIL: Search response parse error: ${e.message}`));
        }
      });
    }).on('error', reject);
  });
};

const runAllTests = async () => {
  console.log('\n==============================================');
  console.log('STARTING AUTOMATED API INTEGRATION TEST SUITE');
  console.log('==============================================\n');

  try {
    const healthRes = await testHealth();
    console.log(healthRes.message);

    const loginRes = await testLogin();
    console.log(loginRes.message);

    const searchRes = await testSearch();
    console.log(searchRes.message);

    console.log('\n==============================================');
    console.log('TEST SUITE COMPLETE: ALL CORE ENDPOINTS VERIFIED.');
    console.log('==============================================\n');
  } catch (e) {
    console.error('\n[!] TEST SUITE CRASHED OR SERVER OFFLINE:');
    console.error(e.message);
    console.log('Ensure you start the server using: npm run dev before running tests.\n');
  }
};

runAllTests();
