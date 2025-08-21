const fs = require('fs');
const path = require('path');
const https = require('https');

const HOSTNAME = 'db.kpiiiqrnoxpvpedaennf.supabase.co';

function doh(url) {
  return new Promise((resolve) => {
    const req = https.get(url, { headers: { accept: 'application/dns-json' } }, (res) => {
      let data = '';
      res.on('data', (c) => (data += c));
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const ans = Array.isArray(json.Answer) ? json.Answer.find((a) => a.type === 1 && a.data) : null;
          resolve(ans ? ans.data : null);
        } catch (_) {
          resolve(null);
        }
      });
    });
    req.setTimeout(4000, () => {
      try { req.destroy(); } catch (_) {}
      resolve(null);
    });
    req.on('error', () => resolve(null));
  });
}

async function resolveIP() {
  const providers = [
    `https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(HOSTNAME)}&type=A`,
    `https://dns.google/resolve?name=${encodeURIComponent(HOSTNAME)}&type=A`,
    `https://9.9.9.9/dns-query?name=${encodeURIComponent(HOSTNAME)}&type=A`,
  ];
  for (const url of providers) {
    const ip = await doh(url);
    if (ip) return ip;
  }
  return null;
}

(async () => {
  const ip = await resolveIP();
  if (!ip) {
    console.error('Could not resolve Supabase DB IP via DoH');
    process.exit(1);
    return;
  }
  const envPath = path.join(process.cwd(), '.env');
  let content = '';
  try { content = fs.readFileSync(envPath, 'utf8'); } catch (_) {}
  const lines = content.split(/\r?\n/).filter((l) => !l.startsWith('DB_HOST_OVERRIDE='));
  lines.push(`DB_HOST_OVERRIDE=${ip}`);
  fs.writeFileSync(envPath, lines.join('\n'));
  console.log(`DB_HOST_OVERRIDE set to ${ip}`);
})();
