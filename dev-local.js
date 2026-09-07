import { spawn } from 'node:child_process';
import { resolve } from 'node:path';

const children = [
  spawn(process.execPath, [resolve('server-local.js')], { stdio: 'inherit' }),
  spawn(process.execPath, [resolve('node_modules/vite/bin/vite.js')], { stdio: 'inherit' })
];

function stopChildren() {
  children.forEach(child => {
    if (!child.killed) child.kill();
  });
}

process.on('SIGINT', () => {
  stopChildren();
  process.exit(0);
});

process.on('SIGTERM', () => {
  stopChildren();
  process.exit(0);
});

children.forEach(child => {
  child.on('exit', (code, signal) => {
    if (code !== 0 && signal === null) {
      stopChildren();
      process.exit(code || 1);
    }
  });
});