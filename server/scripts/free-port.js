// Kills whatever process is holding the configured PORT (default 5000) before
// starting the dev server. This exists because nodemon on Windows doesn't
// always release its port cleanly on crash or on a closed terminal window,
// leaving a zombie process that blocks the next `npm run dev`.
import { execSync } from 'child_process';

const PORT = process.env.PORT || 5000;
const isWindows = process.platform === 'win32';

try {
  if (isWindows) {
    const out = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf8' });
    const pids = [...new Set(out.split('\n').map((l) => l.trim().split(/\s+/).pop()).filter((p) => p && /^\d+$/.test(p)))];
    pids.forEach((pid) => {
      try {
        execSync(`taskkill /PID ${pid} /F`);
        console.log(`[free-port] Killed stale process ${pid} on port ${PORT}`);
      } catch {
        // Already gone — fine.
      }
    });
  } else {
    const out = execSync(`lsof -ti tcp:${PORT}`, { encoding: 'utf8' });
    out.split('\n').filter(Boolean).forEach((pid) => {
      try {
        execSync(`kill -9 ${pid}`);
        console.log(`[free-port] Killed stale process ${pid} on port ${PORT}`);
      } catch {
        // Already gone — fine.
      }
    });
  }
} catch {
  // No process was using the port — nothing to do, this is the common case.
}
