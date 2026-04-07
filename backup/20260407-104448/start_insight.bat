@echo off
title GS AI Insight Launcher
echo Starting GS AI Insight Next.js Server...
echo Please wait... The browser will open automatically.

cd /d "C:\Users\lenovo\Documents\AI\260325002_claudeantigavity\gs-ai-insight"

start /b cmd /c "timeout /t 6 >nul && start http://localhost:3000"

call npm run dev

pause
