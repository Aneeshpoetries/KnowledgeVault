@echo off
chcp 65001 >nul 2>&1
title KnowledgeVault AI

where node >nul 2>&1
if errorlevel 1 (
    echo.
    echo  [ERROR] Node.js is required but was not found.
    echo  Download and install from: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

node "%~dp0start.js"
if errorlevel 1 (
    echo.
    pause
)
