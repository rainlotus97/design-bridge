#!/usr/bin/env node
import { CacheManager } from '../cache/cache-manager.js';
import { HttpReceiver } from '../bridge/http-receiver.js';
import { runStdioServer } from '../server.js';

async function main() {
  const port = parseInt(process.env.DESIGN_BRIDGE_PORT || '23851', 10);
  const cacheManager = new CacheManager();

  // Start background HTTP receiver for browser adapters
  const httpReceiver = new HttpReceiver({
    port,
    cacheManager,
    onCaptureReceived: (capture) => {
      // Use stderr so stdio MCP transport is not disrupted
      console.error(`[DesignBridge] 📥 Received new capture: ${capture.id} (${capture.meta.name})`);
    },
  });

  try {
    await httpReceiver.start();
    console.error(`[DesignBridge] 🚀 Local HTTP Bridge listening on http://127.0.0.1:${port}`);
    console.error(`[DesignBridge] 📂 Local Cache directory: ${cacheManager.getBaseDir()}`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error(`[DesignBridge] ⚠️ Warning: Failed to start HTTP bridge on port ${port}: ${msg}`);
  }

  // Connect MCP Stdio Server
  console.error(`[DesignBridge] 🔌 MCP Stdio Server initializing...`);
  await runStdioServer(cacheManager);
}

main().catch((err) => {
  console.error('[DesignBridge] Fatal error:', err);
  process.exit(1);
});
