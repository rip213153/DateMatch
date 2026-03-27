@echo off
cd /d "%~dp0"
npm run dev:direct > datematch.direct.bg.out.log 2> datematch.direct.bg.err.log
