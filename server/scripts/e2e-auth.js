const axios = require('axios');
const { spawn } = require('child_process');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5001';

function startServer() {
  return new Promise((resolve, reject) => {
    const child = spawn('npm', ['start'], { cwd: process.cwd(), shell: true, env: { ...process.env, PORT: '5001' } });
    let resolved = false;

    child.stdout.on('data', (d) => {
      const s = d.toString();
      if (!resolved && (s.includes('listening') || s.toLowerCase().includes('server started'))) {
        resolved = true;
        resolve(child);
      }
    });
    child.stderr.on('data', (d) => {
      // do not reject on stderr; keep running
    });
    child.on('exit', (code) => {
      if (!resolved) reject(new Error(`Server exited early with code ${code}`));
    });

    // Fallback resolve after 1.5s
    setTimeout(() => {
      if (!resolved) {
        resolved = true;
        resolve(child);
      }
    }, 1500);
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function waitForHealth(timeoutMs = 10000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await axios.get(`${BASE_URL}/api/health`, { timeout: 2000 });
      if (res.status === 200) return;
    } catch (err) {
      lastErr = err;
    }
    await sleep(500);
  }
  throw new Error(`Health not ready: ${lastErr?.message || 'unknown'}`);
}

async function guestPositivePath() {
  // 1) Get guest token
  const login = await axios.post(`${BASE_URL}/api/auth/guest-login`, {}, { timeout: 5000 }).catch(e => {
    if (e.response) {
      throw new Error(`guest-login failed: ${e.response.status} ${JSON.stringify(e.response.data)}`);
    }
    throw e;
  });
  if (!login.data?.token) throw new Error('guest-login returned no token');
  const token = login.data.token;

  // 2) Access guest dashboard
  const dash = await axios.get(`${BASE_URL}/api/dashboard/guest`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  }).catch(e => {
    if (e.response) {
      throw new Error(`guest dashboard failed: ${e.response.status} ${JSON.stringify(e.response.data)}`);
    }
    throw e;
  });
  if (dash.status !== 200) throw new Error(`guest dashboard unexpected status ${dash.status}`);

  // 3) Admin dashboard should be forbidden for guest
  const adminRes = await axios.get(`${BASE_URL}/api/dashboard/admin`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  }).then(r => r).catch(e => e.response);
  if (!adminRes || (adminRes.status !== 403 && adminRes.status !== 401)) {
    throw new Error(`guest should not access admin dashboard, got status ${adminRes?.status}`);
  }

  // 4) Refresh token should work for guest
  const refresh = await axios.post(`${BASE_URL}/api/auth/refresh`, {}, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  }).catch(e => {
    if (e.response) {
      throw new Error(`refresh failed: ${e.response.status} ${JSON.stringify(e.response.data)}`);
    }
    throw e;
  });
  if (!refresh.data?.token) throw new Error('refresh did not return token');
}

(async () => {
  console.log('Starting server for auth E2E...');
  const server = await startServer();
  try {
    await waitForHealth();
    console.log('Health ready');
    await guestPositivePath();
    console.log('AUTH E2E PASSED (guest positive path)');
  } catch (err) {
    console.error('AUTH E2E FAILED:', err.message);
    process.exitCode = 1;
  } finally {
    if (server && server.pid) {
      try { process.platform === 'win32' ? spawn('taskkill', ['/PID', server.pid, '/T', '/F']) : process.kill(server.pid); } catch (_) {}
    }
  }
})();
