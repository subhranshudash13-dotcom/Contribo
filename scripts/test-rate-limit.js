const http = require('http');

function makeRequest(url, method = 'GET', postData = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log("=========================================");
  console.log("RUNNING RATE LIMIT SECURITY TESTS");
  console.log("=========================================\n");

  const baseUrl = 'http://localhost:3000';
  
  // Test 1: Sensitive Endpoint (/api/match) - Limit is 10
  console.log("--- Test 1: Sensitive API Route (/api/match) ---");
  console.log("Sending 12 rapid requests to /api/match (Limit: 10 per minute)...");
  let matchSuccess = 0;
  let match429 = 0;

  for (let i = 1; i <= 12; i++) {
    try {
      const res = await makeRequest(
        `${baseUrl}/api/match`, 
        'POST', 
        { skills: ['React'] }
      );
      if (res.statusCode === 429) {
        match429++;
        console.log(`Request #${i}: Rate Limited (429) - Expected`);
      } else {
        matchSuccess++;
        console.log(`Request #${i}: Status ${res.statusCode}`);
      }
    } catch (e) {
      console.error(`Request #${i} failed:`, e.message);
    }
  }
  
  console.log(`\n/api/match results - Successes/non-429: ${matchSuccess}, 429s: ${match429}`);
  const matchTestPassed = match429 > 0;
  console.log(`Sensitive route test: ${matchTestPassed ? "PASSED" : "FAILED"}\n`);

  console.log("=========================================");
  if (matchTestPassed) {
    console.log("ALL RATE LIMIT TESTS PASSED!");
    process.exit(0);
  } else {
    console.error("RATE LIMIT TESTS FAILED!");
    process.exit(1);
  }
}

runTests();
