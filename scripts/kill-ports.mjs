// Frees the dev ports a previous run left held; pass ports as arguments.

import { execFileSync } from 'node:child_process';
import process from 'node:process';

const DEFAULT_PORTS = ['3000', '3001'];
const IS_WINDOWS = process.platform === 'win32';

/** stdout of the command, or `''` — a non-zero exit here only ever means "no match". */
function capture(command, args) {
  try {
    return execFileSync(command, args, {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
  } catch {
    return '';
  }
}

/**
 * The pids holding `port`. The Windows branch matches on the local address rather than
 * on `LISTENING`, which netstat translates on non-English installs.
 */
function holdersOf(port) {
  if (!IS_WINDOWS) {
    return new Set(
      capture('lsof', ['-t', `-i:${port}`, '-sTCP:LISTEN'])
        .split('\n')
        .map((line) => line.trim())
        .filter(Boolean),
    );
  }

  const pids = new Set();

  for (const line of capture('netstat', ['-a', '-n', '-o', '-p', 'tcp']).split('\n')) {
    const columns = line.trim().split(/\s+/);
    const localAddress = columns[1];
    const pid = columns.at(-1);

    if (localAddress?.endsWith(`:${port}`) && /^[1-9]\d*$/.test(pid)) {
      pids.add(pid);
    }
  }

  return pids;
}

function kill(pid) {
  // /T takes the children too: the dev server is a child of the package manager.
  if (IS_WINDOWS) {
    return capture('taskkill', ['/F', '/T', '/PID', pid]) !== '';
  }

  try {
    process.kill(Number(pid), 'SIGKILL');
    return true;
  } catch {
    return false;
  }
}

const requested = process.argv.slice(2);
const ports = requested.length > 0 ? requested : DEFAULT_PORTS;
let stuck = 0;

for (const port of ports) {
  const pids = holdersOf(port);

  if (pids.size === 0) {
    console.log(`port ${port} already free`);
    continue;
  }

  for (const pid of pids) {
    if (kill(pid)) {
      console.log(`port ${port} freed (pid ${pid})`);
    } else {
      stuck += 1;
      console.log(`port ${port} still held by pid ${pid} — kill it manually`);
    }
  }
}

// Non-zero only when something survived, so `pnpm clean && pnpm dev` chains.
process.exitCode = stuck > 0 ? 1 : 0;
