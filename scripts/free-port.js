const { execSync } = require('child_process');

const port = process.argv[2] || process.env.PORT || '3000';

function run(cmd) {
  try {
    return execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  } catch {
    return '';
  }
}

if (process.platform === 'win32') {
  const output = run(`netstat -ano -p tcp | findstr :${port}`);
  const pids = new Set();
  for (const line of output.split('\n')) {
    const match = line.trim().match(/LISTENING\s+(\d+)\s*$/);
    if (match) pids.add(match[1]);
  }
  for (const pid of pids) {
    console.log(`Freeing port ${port}: killing PID ${pid}`);
    run(`taskkill /PID ${pid} /F`);
  }
} else {
  const output = run(`lsof -ti tcp:${port}`);
  const pids = output.split('\n').map((s) => s.trim()).filter(Boolean);
  for (const pid of pids) {
    console.log(`Freeing port ${port}: killing PID ${pid}`);
    run(`kill -9 ${pid}`);
  }
}
