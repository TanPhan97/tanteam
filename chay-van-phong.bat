@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>&1 || (echo Chua co Node.js 18+. Tai ban LTS tai https://nodejs.org & pause & exit /b 1)
start "" http://localhost:7788
node server.js
pause
