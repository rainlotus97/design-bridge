@echo off
chcp 65001 >nul
title DesignBridge Server (Port 23851)
cd /d %~dp0
echo ========================================================
echo   ⚡ DesignBridge Server 正在启动...
echo   🌐 Web 控制台: http://127.0.0.1:23851/
echo   🔌 MCP SSE 端点: http://127.0.0.1:23851/sse
echo ========================================================
echo.
pnpm start
pause
