@echo off
cd /d "%~dp0"
set PORT=3003
npm run dev > datematch.fixed.out.log 2> datematch.fixed.err.log
