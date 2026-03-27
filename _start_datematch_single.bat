@echo off
cd /d "%~dp0"
npm run dev:direct > datematch.single.out.log 2> datematch.single.err.log
