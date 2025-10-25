#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function safeGitHash() {
  try {
    return execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch {
    return '';
  }
}

function main() {
  const root = process.cwd();
  const pkgPath = path.join(root, 'package.json');
  const outPath = path.join(root, 'public', 'version.json');

  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  const version = pkg.version || '0.0.0';
  const now = new Date().toISOString();
  const hash = safeGitHash();

  const content = {
    version,
    build: { time: now, hash }
  };

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(content, null, 2), 'utf-8');
  console.log(`Wrote ${outPath}:`, content);
}

main();