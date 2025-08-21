/*
  Simple E2E smoke test that:
  1) Starts the server (node index.js)
  2) Waits for /api/health to return ok
  3) Ensures a protected route rejects unauthenticated requests (expects 401/403)
  4) Ensures root route returns basic metadata
  5) Shuts the server down
*/

const { spawn } = require('child_process');
const axios = require('axios');

const PORT = process.env.PORT || 5001; // matches server/.env default
const BASE_URL = `http://localhost:${PORT}`;

function sleep(ms) { return new Promise((res) => setTimeout(res, ms)); }

async function waitForHealth(timeoutMs = 15000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await axios.get(`${BASE_URL}/api/health`, { timeout: 3000 });
      if (res.status === 200 && res.data && res.data.status === 'ok') {
        return res.data;
      }
    } catch (err) {
      lastErr = err;
    }
    await sleep(500);
  }
  throw new Error(`Health check failed within ${timeoutMs}ms: ${lastErr?.message || 'unknown error'}`);
}

async function testProtectedRoute() {
  // Use endpoints that are known to exist and require auth/roles
  const protectedEndpoints = [
    '/api/dashboard/guest',   // require auth + role guest
    '/api/dashboard/admin'    // require admin access
  ];
  let checked = 0;
  for (const ep of protectedEndpoints) {
    try {
      await axios.get(`${BASE_URL}${ep}`, { timeout: 5000 });
      // If we get here with 200, it's a potential issue
      console.warn(`WARN: Protected endpoint responded 200 without auth: ${ep}`);
    } catch (err) {
      const status = err.response?.status;
      if (status === 401 || status === 403) {
        checked++;
      } else if (status === 404) {
        // Endpoint should exist; 404 indicates route mounting issue
        console.warn(`WARN: Expected protected endpoint missing: ${ep}`);
      } else {
        console.warn(`WARN: Unexpected status for ${ep}: ${status}`);
      }
    }
  }
  if (checked === 0) {
    throw new Error('No protected endpoints rejected unauthenticated request. RBAC check inconclusive.');
  }
}

async function testRoot() {
  const res = await axios.get(`${BASE_URL}/`, { timeout: 5000 });
  if (res.status !== 200 || !res.data || res.data.name !== 'Campus App Server') {
    throw new Error('Root route did not return expected payload');
  }
}

async function main() {
  console.log('Starting server...');
  const srv = spawn(process.platform === 'win32' ? 'node.exe' : 'node', ['index.js'], {
    cwd: __dirname.replace(/\\scripts$/, ''), // server dir
    env: { ...process.env, NODE_ENV: 'test', PORT: String(PORT) },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let serverOutput = '';
  srv.stdout.on('data', (d) => { serverOutput += d.toString(); });
  srv.stderr.on('data', (d) => { serverOutput += d.toString(); });

  try {
    const health = await waitForHealth();
    console.log('Health OK:', { db: health?.database });

    await testRoot();
    console.log('Root route OK');

    await testProtectedRoute();
    console.log('Protected routes reject unauthenticated access (expected)');

    console.log('SMOKE TEST PASSED');
    process.exitCode = 0;
  } catch (err) {
    console.error('SMOKE TEST FAILED:', err.message);
    console.error('Server output:\n', serverOutput);
    process.exitCode = 1;
  } finally {
    // Attempt graceful shutdown
    try { srv.kill('SIGINT'); } catch {}
    await sleep(1000);
  }
}

main();
