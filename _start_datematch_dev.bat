@echo off
cd /d "%~dp0"
npm run dev > datematch.dev.out.log 2> datematch.dev.err.log
