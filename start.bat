@echo off
title KnowledgeVault AI — Demo Launcher
color 0A

echo.
echo  ██╗  ██╗███╗   ██╗ ██████╗ ██╗    ██╗██╗     ███████╗██████╗  ██████╗ ███████╗
echo  ██║ ██╔╝████╗  ██║██╔═══██╗██║    ██║██║     ██╔════╝██╔══██╗██╔════╝ ██╔════╝
echo  █████╔╝ ██╔██╗ ██║██║   ██║██║ █╗ ██║██║     █████╗  ██║  ██║██║  ███╗█████╗
echo  ██╔═██╗ ██║╚██╗██║██║   ██║██║███╗██║██║     ██╔══╝  ██║  ██║██║   ██║██╔══╝
echo  ██║  ██╗██║ ╚████║╚██████╔╝╚███╔███╔╝███████╗███████╗██████╔╝╚██████╔╝███████╗
echo  ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝
echo.
echo  ╔══════════════════════════════════════════════════════════════╗
echo  ║       AI Knowledge Continuity ^& Organizational Memory        ║
echo  ║                    Demo Launcher v1.0                        ║
echo  ╚══════════════════════════════════════════════════════════════╝
echo.

REM ── Resolve project root (directory where this script lives) ──────────────────
set "ROOT=%~dp0"
set "ROOT=%ROOT:~0,-1%"

REM ── 1. Check Node.js ──────────────────────────────────────────────────────────
echo [1/5] Checking Node.js...
where node >nul 2>&1
if errorlevel 1 (
    echo  [ERROR] Node.js not found. Please install from https://nodejs.org/
    pause
    exit /b 1
)
for /f "delims=" %%v in ('node -v') do set NODE_VER=%%v
echo  [OK] Node.js %NODE_VER% detected.

REM ── 2. Install dependencies if node_modules is missing ────────────────────────
echo.
echo [2/5] Checking dependencies...
if not exist "%ROOT%\node_modules" (
    echo  [INFO] node_modules not found. Running npm install...
    cd /d "%ROOT%"
    call npm install
    if errorlevel 1 (
        echo  [ERROR] npm install failed. Check your network connection and try again.
        pause
        exit /b 1
    )
) else (
    echo  [OK] Dependencies already installed.
)

REM ── 3. Set up .env if missing ─────────────────────────────────────────────────
echo.
echo [3/5] Checking environment configuration...
if not exist "%ROOT%\.env" (
    if exist "%ROOT%\.env.example" (
        echo  [INFO] .env not found. Copying from .env.example...
        copy "%ROOT%\.env.example" "%ROOT%\.env" >nul
        echo  [OK] .env created. Demo runs in offline fallback mode.
        echo       To enable GPT responses, add your OPENAI_API_KEY to .env
    ) else (
        echo  [WARN] No .env or .env.example found. AI fallback mode will be used.
    )
) else (
    echo  [OK] .env found.
)

REM ── 4. Initialize DB + seed (idempotent) ──────────────────────────────────────
echo.
echo [4/5] Initializing database ^& seeding NovaTech demo data...
cd /d "%ROOT%"

REM Check if dev.db already exists to avoid double-seeding
if not exist "%ROOT%\prisma\dev.db" (
    echo  [INFO] Database not found. Running db:push...
    call npm run db:push
    if errorlevel 1 (
        echo  [ERROR] db:push failed. See above for details.
        pause
        exit /b 1
    )
    echo  [INFO] Seeding NovaTech enterprise demo data...
    call npm run db:seed
    if errorlevel 1 (
        echo  [ERROR] db:seed failed. See above for details.
        pause
        exit /b 1
    )
    echo  [OK] Database ready with NovaTech demo dataset.
) else (
    echo  [OK] Database already exists. Skipping seed.
    echo       To re-seed, delete prisma\dev.db and re-run this script.
)

REM ── 5. Launch dev server ──────────────────────────────────────────────────────
echo.
echo [5/5] Starting KnowledgeVault AI development server...
echo.
echo  ╔═══════════════════════════════════════════════════════╗
echo  ║  Server starting at:  http://localhost:3000           ║
echo  ║                                                       ║
echo  ║  Demo Login Credentials:                             ║
echo  ║   Admin    : admin@novatech.ai   / admin123          ║
echo  ║   Manager  : manager@novatech.ai / manager123        ║
echo  ║   Employee : rahul@novatech.ai   / employee123       ║
echo  ║   New Hire : newhire@novatech.ai / newhire123        ║
echo  ║                                                       ║
echo  ║  Press Ctrl+C to stop the server.                    ║
echo  ╚═══════════════════════════════════════════════════════╝
echo.

REM Small delay so the user can read the panel, then open browser
timeout /t 3 /nobreak >nul
start "" "http://localhost:3000"

cd /d "%ROOT%"
call npm run dev

pause
