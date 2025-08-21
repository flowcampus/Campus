const axios = require('axios');
const { spawn, spawnSync } = require('child_process');

const BASE_URL = process.env.BASE_URL || 'http://127.0.0.1:5001';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@campus.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';
const ADMIN_KEY = process.env.ADMIN_ACCESS_KEY || undefined;

function killPort(port) {
  try {
    // Windows PowerShell to kill any process listening on the given port
    const cmd = `Get-NetTCPConnection -State Listen -LocalPort ${port} -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique | ForEach-Object { try { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue } catch {} }`;
    spawnSync('powershell', ['-NoProfile', '-Command', cmd], { stdio: 'ignore', shell: true });
  } catch (_) {}
}

function startServer() {
  return new Promise((resolve, reject) => {
    // Ensure port 5001 is free before starting
    killPort(5001);
    const child = spawn('npm', ['start'], { cwd: process.cwd(), shell: true, env: { ...process.env, PORT: '5001' } });
    let resolved = false;

    child.stdout.on('data', (d) => {
      const s = d.toString();
      if (!resolved && (s.includes('listening') || s.toLowerCase().includes('server started'))) {
        resolved = true;
        resolve(child);
      }
    });
    child.stderr.on('data', () => {});
    child.on('exit', (code) => {
      if (!resolved) reject(new Error(`Server exited early with code ${code}`));
    });
    setTimeout(() => { if (!resolved) { resolved = true; resolve(child); } }, 1500);
  });
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function getHealth(timeoutMs = 10000) {
  const start = Date.now();
  let lastErr;
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await axios.get(`${BASE_URL}/api/health`, { timeout: 2000 });
      if (res.status === 200) return res.data;
    } catch (err) { lastErr = err; }
    await sleep(500);
  }
  throw new Error(`Health not ready: ${lastErr?.message || 'unknown'}`);
}

async function adminPositivePath() {
  // 1) Login as admin
  const body = { email: ADMIN_EMAIL, password: ADMIN_PASSWORD };
  if (ADMIN_KEY) body.adminKey = ADMIN_KEY;
  const login = await axios.post(`${BASE_URL}/api/auth/admin-login`, body, { timeout: 8000 }).catch(e => {
    if (e.response) throw new Error(`admin-login failed: ${e.response.status} ${JSON.stringify(e.response.data)}`);
    throw e;
  });
  if (!login.data?.token) throw new Error('admin-login returned no token');
  const token = login.data.token;

  // 2) Access admin dashboard
  const dash = await axios.get(`${BASE_URL}/api/dashboard/admin`, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 5000
  }).catch(e => {
    if (e.response) throw new Error(`admin dashboard failed: ${e.response.status} ${JSON.stringify(e.response.data)}`);
    throw e;
  });
  if (dash.status !== 200) throw new Error(`admin dashboard unexpected status ${dash.status}`);
}

(async () => {
  console.log('Starting server for admin E2E...');
  const server = await startServer();
  try {
    const health = await getHealth();
    const dbStatus = (health && health.database && health.database.status) || 'unknown';
    if (dbStatus === 'unknown') {
      console.log('Health payload (debug):', JSON.stringify(health));
    }
    if (dbStatus !== 'healthy') {
      console.log(`DB not healthy (${dbStatus}). Full health payload:`);
      try { console.log(JSON.stringify(health, null, 2)); } catch (_) { console.log(health); }
      console.log('Skipping admin E2E.');
      process.exitCode = 0;
      return;
    }
    console.log('DB healthy. Running admin positive path...');
    await adminPositivePath();
    console.log('AUTH E2E PASSED (admin positive path)');
  } catch (err) {
    console.error('AUTH E2E FAILED (admin):', err.message);
    process.exitCode = 1;
  } finally {
    if (server && server.pid) {
      try { process.platform === 'win32' ? spawn('taskkill', ['/PID', server.pid, '/T', '/F']) : process.kill(server.pid); } catch (_) {}
    }
  }
})();
