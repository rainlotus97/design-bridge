#!/usr/bin/env node
import { CacheManager } from '../cache/cache-manager.js';
import { HttpReceiver } from '../bridge/http-receiver.js';
import { runStdioServer } from '../server.js';

async function main() {
  const args = process.argv.slice(2);
  const isStdioMode = args.includes('stdio');

  const port = parseInt(process.env.DESIGN_BRIDGE_PORT || '23851', 10);
  const cacheManager = new CacheManager();

  const httpReceiver = new HttpReceiver({
    port,
    cacheManager,
    onCaptureReceived: (capture) => {
      console.error(`[DesignBridge] 📥 Received new capture: ${capture.id} (${capture.meta.name})`);
    },
  });

  try {
    await httpReceiver.start();
    console.error(`[DesignBridge] 🚀 Local Server started on http://127.0.0.1:${port}`);
    console.error(`[DesignBridge] 🌐 Web Dashboard: http://127.0.0.1:${port}/`);
    console.error(`[DesignBridge] 🔌 MCP SSE Server: http://127.0.0.1:${port}/sse`);
    console.error(`[DesignBridge] 📂 Local Cache directory: ${cacheManager.getBaseDir()}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[DesignBridge] ⚠️ Warning: Failed to start HTTP server on port ${port}: ${msg}`);
  }

  if (isStdioMode) {
    console.error(`[DesignBridge] 🔌 MCP Stdio Server initializing...`);
    await runStdioServer(cacheManager);
  } else {
    console.error(`[DesignBridge] ✨ Server is running in background mode. Press Ctrl+C to stop.`);
    // Keep alive for HTTP & SSE
    process.on('SIGINT', async () => {
      console.error('\n[DesignBridge] Shutting down server...');
      await httpReceiver.stop();
      process.exit(0);
    });
  }
}

main().catch((err) => {
  console.error('[DesignBridge] Fatal error:', err);
  process.exit(1);
});
