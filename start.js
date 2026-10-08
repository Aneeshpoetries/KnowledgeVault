#!/usr/bin/env node
'use strict';

const { execSync, spawn } = require('child_process');
const fs   = require('fs');
const path = require('path');

// ── Enable ANSI on Windows (VirtualTerminalLevel) ────────────────────────────
if (process.platform === 'win32') {
  try {
    execSync(
      'reg add HKCU\\Console /v VirtualTerminalLevel /t REG_DWORD /d 1 /f',
      { stdio: 'pipe' }
    );
  } catch { /* already set or no permission — ANSI may still work */ }
}

// ── ANSI palette (zero runtime dependencies) ─────────────────────────────────
const E = '\x1b';
const c = {
  reset:   `${E}[0m`,
  bold:    `${E}[1m`,
  dim:     `${E}[2m`,

  // Standard
  red:     `${E}[31m`,
  green:   `${E}[32m`,
  yellow:  `${E}[33m`,
  cyan:    `${E}[36m`,
  gray:    `${E}[90m`,
  white:   `${E}[37m`,

  // Bright
  bRed:    `${E}[91m`,
  bGreen:  `${E}[92m`,
  bYellow: `${E}[93m`,
  bBlue:   `${E}[94m`,
  bMag:    `${E}[95m`,
  bCyan:   `${E}[96m`,
  bWht:    `${E}[97m`,
};

const ROOT  = path.resolve(__dirname);
const write = (s) => process.stdout.write(s);
const ln    = (s = '') => write(s + '\n');

// Overwrite the current (incomplete) line then write new content with newline
const clr   = () => write('\r\x1b[K');
function replaceLine(s) { clr(); ln(s); }

// ── Logo ─────────────────────────────────────────────────────────────────────
//
//  ██╗  ██╗██╗   ██╗    KnowledgeVault AI
//  ██║ ██╔╝██║   ██║    ──────────────────────────────────
//  █████╔╝ ╚██╗ ██╔╝    AI Knowledge Continuity System
//  ██╔═██╗  ╚████╔╝     Organizational Memory Platform
//  ██║  ██╗   ██║       Dev2Hack 2026  ·  Launcher v1.0
//  ╚═╝  ╚═╝   ╚═╝
//
function drawLogo() {
  const GLYPH = [
    ' ██╗  ██╗██╗   ██╗',
    ' ██║ ██╔╝██║   ██║',
    ' █████╔╝ ╚██╗ ██╔╝',
    ' ██╔═██╗  ╚████╔╝ ',
    ' ██║  ██╗   ██║   ',
    ' ╚═╝  ╚═╝   ╚═╝   ',
  ];

  const META = [
    `${c.bold}${c.bWht}KnowledgeVault AI${c.reset}`,
    `${c.gray}${'─'.repeat(34)}${c.reset}`,
    `${c.dim}AI Knowledge Continuity System${c.reset}`,
    `${c.dim}Organizational Memory Platform${c.reset}`,
    `${c.gray}Dev2Hack 2026  ·  Launcher v1.0${c.reset}`,
    '',
  ];

  ln();
  for (let i = 0; i < GLYPH.length; i++) {
    const glyphColor = i < 3 ? `${c.bCyan}${c.bold}` : c.cyan;
    ln(`  ${glyphColor}${GLYPH[i]}${c.reset}    ${META[i] ?? ''}`);
  }
  ln(`  ${c.gray}${'─'.repeat(62)}${c.reset}`);
  ln();
}

// ── Step indicators ──────────────────────────────────────────────────────────
//  Each step follows the pattern:
//    1. pending(label)   → writes "  ◐  label" WITHOUT newline
//    2. <sync operation runs>
//    3. ok / fail / warn → clears that line, rewrites with icon + newline
//
const SPIN_FRAMES = ['◐', '◓', '◑', '◒'];
let _si = 0;

/** Write "  ◐  label" to the current line — NO newline (overwrite-able) */
function pending(label) {
  write(`  ${c.cyan}${SPIN_FRAMES[_si++ % SPIN_FRAMES.length]}${c.reset}  ${c.dim}${label}${c.reset}`);
}

/** Overwrite current pending line with a success tick */
function ok(label, note = '') {
  replaceLine(
    `  ${c.bGreen}✓${c.reset}  ${label}` +
    (note ? `  ${c.dim}${c.gray}${note}${c.reset}` : '')
  );
}

/** Overwrite current pending line with a failure cross */
function fail(label, hint = '') {
  replaceLine(
    `  ${c.bRed}✗${c.reset}  ${label}` +
    (hint ? `\n     ${c.gray}${c.dim}→ ${hint}${c.reset}` : '')
  );
}

/** Overwrite current pending line with a warning diamond */
function warn(label, note = '') {
  replaceLine(
    `  ${c.bYellow}◆${c.reset}  ${label}` +
    (note ? `  ${c.dim}${c.gray}${note}${c.reset}` : '')
  );
}

/**
 * Section header — printed WITH a newline.
 * Use this before steps that produce their own output (e.g. npm install).
 */
function section(label) {
  ln(`  ${c.cyan}◆${c.reset}  ${label}`);
}

// ── Runners ───────────────────────────────────────────────────────────────────
function runSilent(cmd) {
  try { return execSync(cmd, { cwd: ROOT, stdio: 'pipe' }).toString().trim(); }
  catch { return null; }
}

/** Silent (piped) — for db:push, db:seed. Use after pending(). */
function runQuiet(cmd) {
  try { execSync(cmd, { cwd: ROOT, stdio: 'pipe' }); return true; }
  catch { return false; }
}

/** Verbose (inherited stdio) — for npm install. Use after section(). */
function runVerbose(cmd) {
  try { execSync(cmd, { cwd: ROOT, stdio: 'inherit' }); return true; }
  catch { return false; }
}

// ── Credentials panel ─────────────────────────────────────────────────────────
function drawCredentials() {
  const USERS = [
    { role: 'Admin',    color: c.bRed,    email: 'admin@novatech.ai',   pass: 'admin123'    },
    { role: 'Manager',  color: c.bYellow, email: 'manager@novatech.ai', pass: 'manager123'  },
    { role: 'Employee', color: c.bGreen,  email: 'rahul@novatech.ai',   pass: 'employee123' },
    { role: 'New Hire', color: c.bBlue,   email: 'newhire@novatech.ai', pass: 'newhire123'  },
  ];

  ln();
  ln(`  ${c.bold}${c.bWht}Demo Login Credentials${c.reset}`);
  ln(`  ${c.gray}${'─'.repeat(56)}${c.reset}`);
  for (const u of USERS) {
    ln(
      `  ${u.color}${c.bold}${u.role.padEnd(10)}${c.reset}` +
      `  ${c.white}${u.email.padEnd(28)}${c.reset}` +
      `  ${c.dim}${u.pass}${c.reset}`
    );
  }
  ln(`  ${c.gray}${'─'.repeat(56)}${c.reset}`);
}

// ── URL box ───────────────────────────────────────────────────────────────────
function drawUrl(url) {
  const W     = 54;
  const inner = url;
  const pad   = ' '.repeat(W - inner.length - 2);
  ln();
  ln(`  ${c.gray}╭${'─'.repeat(W)}╮${c.reset}`);
  ln(`  ${c.gray}│${c.reset}  ${c.bold}${c.bCyan}${inner}${c.reset}${pad}${c.gray}│${c.reset}`);
  ln(`  ${c.gray}╰${'─'.repeat(W)}╯${c.reset}`);
  ln();
}

// ── Key pages hint ────────────────────────────────────────────────────────────
function drawHints() {
  const hints = [
    ['/dashboard',  'Coverage overview & risk alerts'],
    ['/graph',      'Interactive Knowledge Graph (drag, zoom, click nodes)'],
    ['/assistant',  'RAG AI Chat with evidence citations'],
    ['/gaps',       'Gap list + AI question generator'],
    ['/exit-mode',  'Employee exit interview — THE KILLER FEATURE ★'],
  ];
  ln(`  ${c.bold}${c.bWht}Key Pages to Demo${c.reset}`);
  ln(`  ${c.gray}${'─'.repeat(56)}${c.reset}`);
  for (const [route, desc] of hints) {
    ln(`  ${c.bCyan}${route.padEnd(16)}${c.reset}  ${c.dim}${desc}${c.reset}`);
  }
  ln(`  ${c.gray}${'─'.repeat(56)}${c.reset}`);
  ln();
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  console.clear();
  drawLogo();

  // ────────────────────────────────────────────────────────────────
  //  Step 1 — Node.js
  // ────────────────────────────────────────────────────────────────
  const nodeVer = runSilent('node -v');
  if (!nodeVer) {
    // No pending() was called, so just print directly
    ln(`  ${c.bRed}✗${c.reset}  Node.js not found`);
    ln(`     ${c.gray}${c.dim}→ Install from https://nodejs.org/ then re-run start.bat${c.reset}`);
    process.exit(1);
  }
  ok(`Node.js ${nodeVer}`, 'runtime ready');

  // ────────────────────────────────────────────────────────────────
  //  Step 2 — Dependencies
  // ────────────────────────────────────────────────────────────────
  if (!fs.existsSync(path.join(ROOT, 'node_modules'))) {
    ln();
    section(`${c.bold}Installing dependencies${c.reset}  ${c.dim}this may take a minute...${c.reset}`);
    ln();
    const success = runVerbose('npm install');
    ln();
    if (success) ok('Dependencies installed');
    else {
      ln(`  ${c.bRed}✗${c.reset}  npm install failed`);
      ln(`     ${c.gray}${c.dim}→ Check your network connection and try again${c.reset}`);
      process.exit(1);
    }
  } else {
    ok('Dependencies ready', 'node_modules found');
  }

  // ────────────────────────────────────────────────────────────────
  //  Step 3 — Environment
  // ────────────────────────────────────────────────────────────────
  const envPath     = path.join(ROOT, '.env');
  const examplePath = path.join(ROOT, '.env.example');

  if (!fs.existsSync(envPath)) {
    if (fs.existsSync(examplePath)) {
      fs.copyFileSync(examplePath, envPath);
      ln(
        `  ${c.bYellow}◆${c.reset}  .env created from .env.example` +
        `  ${c.dim}${c.gray}add OPENAI_API_KEY for GPT-powered responses${c.reset}`
      );
    } else {
      ln(`  ${c.bYellow}◆${c.reset}  No .env found  ${c.dim}${c.gray}AI offline fallback mode active${c.reset}`);
    }
  } else {
    const raw    = fs.readFileSync(envPath, 'utf8');
    const hasKey = /OPENAI_API_KEY\s*=\s*sk-/.test(raw);
    ok('Environment configured', hasKey ? 'OpenAI key detected ✦' : 'offline fallback mode');
  }

  // ────────────────────────────────────────────────────────────────
  //  Step 4 — Database
  // ────────────────────────────────────────────────────────────────
  const dbPath = path.join(ROOT, 'prisma', 'dev.db');

  if (!fs.existsSync(dbPath)) {
    pending('Applying database schema');
    if (runQuiet('npm run db:push')) {
      ok('Database schema applied');
    } else {
      fail('db:push failed', 'Run npm run db:push manually to see the full error');
      process.exit(1);
    }

    pending('Seeding NovaTech enterprise data');
    if (runQuiet('npm run db:seed')) {
      ok('NovaTech dataset ready', '4 users · 3 projects · 20+ knowledge items');
    } else {
      fail('db:seed failed', 'Run npm run db:seed manually to see the full error');
      process.exit(1);
    }
  } else {
    ok('Database ready', 'already seeded — delete prisma/dev.db to re-seed');
  }

  // ────────────────────────────────────────────────────────────────
  //  Step 5 — Launch
  // ────────────────────────────────────────────────────────────────
  ln();
  section(`${c.bold}Launching KnowledgeVault AI${c.reset}  ${c.dim}opening browser in 3 s...${c.reset}`);

  drawCredentials();
  drawHints();
  drawUrl('http://localhost:3000');

  ln(`  ${c.gray}Press ${c.reset}${c.bold}Ctrl+C${c.reset}${c.gray} to stop the server${c.reset}`);
  ln();

  // Open browser after 3 s so the server has time to boot
  const browserTimer = setTimeout(() => {
    const url = 'http://localhost:3000';
    const cmd =
      process.platform === 'win32'  ? `start ${url}` :
      process.platform === 'darwin' ? `open ${url}`  :
                                      `xdg-open ${url}`;
    try { execSync(cmd, { stdio: 'pipe' }); } catch {}
  }, 3000);

  // ── Stream the dev server process ────────────────────────────────
  const dev = spawn('npm', ['run', 'dev'], {
    cwd:   ROOT,
    stdio: 'inherit',
    shell: true,
  });

  function shutdown(code) {
    clearTimeout(browserTimer);
    ln();
    ln(`  ${c.gray}Server stopped.${c.reset}`);
    process.exit(code ?? 0);
  }

  dev.on('close', shutdown);

  process.on('SIGINT',  () => { dev.kill('SIGINT');  });
  process.on('SIGTERM', () => { dev.kill('SIGTERM'); });
}

main();
