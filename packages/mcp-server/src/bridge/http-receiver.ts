import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'node:http';
import { CapturedDesignPayload, extractTokensFromSvg } from '@design-bridge/core';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { CacheManager, StoredCapture } from '../cache/cache-manager.js';
import { createDesignBridgeMcpServer } from '../server.js';
import { getWebDashboardHtml } from './web-dashboard.js';

export interface HttpReceiverOptions {
  port?: number;
  cacheManager: CacheManager;
  onCaptureReceived?: (capture: StoredCapture) => void;
}

export class HttpReceiver {
  private app: express.Express;
  private server: Server | null = null;
  private port: number;
  private cacheManager: CacheManager;
  private onCaptureReceived?: (capture: StoredCapture) => void;
  private sseTransports: Map<string, SSEServerTransport> = new Map();

  constructor(options: HttpReceiverOptions) {
    this.port = options.port ?? 23851;
    this.cacheManager = options.cacheManager;
    this.onCaptureReceived = options.onCaptureReceived;
    this.app = express();

    this.setupMiddleware();
    this.setupRoutes();
  }

  private setupMiddleware(): void {
    this.app.use(cors());
    // Support large payloads (base64 PNG images can be 5MB - 20MB)
    this.app.use(express.json({ limit: '50mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  }

  private setupRoutes(): void {
    // 1. Web Dashboard (Zero-install Dropzone & Paste GUI)
    this.app.get(['/', '/ui'], (_req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.send(getWebDashboardHtml(this.port));
    });

    // 2. Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({
        status: 'ok',
        service: 'design-bridge-server',
        version: '0.1.0',
        sseUrl: `http://127.0.0.1:${this.port}/sse`,
        activeSseSessions: this.sseTransports.size,
      });
    });

    // 3. MCP SSE Stream endpoint (Antigravity connects here directly via URL)
    this.app.get('/sse', async (_req: Request, res: Response) => {
      try {
        console.error(`[DesignBridge] 🔌 New MCP SSE connection initiated...`);
        const transport = new SSEServerTransport('/message', res);
        const mcpServer = createDesignBridgeMcpServer(this.cacheManager);

        this.sseTransports.set(transport.sessionId, transport);
        transport.onclose = () => {
          console.error(`[DesignBridge] 🔌 MCP SSE connection closed: ${transport.sessionId}`);
          this.sseTransports.delete(transport.sessionId);
        };

        await mcpServer.connect(transport);
        console.error(`[DesignBridge] ✅ MCP SSE connection established: ${transport.sessionId}`);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[DesignBridge] ❌ Error in /sse:`, msg);
        if (!res.headersSent) {
          res.status(500).send(`SSE Error: ${msg}`);
        }
      }
    });

    // 4. MCP Post Message endpoint (Handles incoming JSON-RPC commands from MCP client)
    this.app.post('/message', async (req: Request, res: Response): Promise<void> => {
      const sessionId = req.query.sessionId as string;
      const transport = sessionId
        ? this.sseTransports.get(sessionId)
        : Array.from(this.sseTransports.values())[0];

      if (!transport) {
        res.status(400).send('No active SSE session found');
        return;
      }

      try {
        await transport.handlePostMessage(req, res);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error(`[DesignBridge] ❌ Error in /message:`, msg);
        if (!res.headersSent) {
          res.status(500).send(msg);
        }
      }
    });

    // 5. Ingest captured design from browser extension, web GUI, or userscript
    this.app.post('/api/capture', (req: Request, res: Response): void => {
      try {
        const payload = req.body as CapturedDesignPayload;
        if (!payload || !payload.image?.base64) {
          res.status(400).json({ error: 'Invalid payload: missing image base64' });
          return;
        }

        // Extract tokens from SVG if available
        const svgRaw = payload.vector?.svgRaw || '';
        const tokens = extractTokensFromSvg(svgRaw);

        // Store to local cache
        const stored = this.cacheManager.saveCapture(payload, tokens);

        if (this.onCaptureReceived) {
          this.onCaptureReceived(stored);
        }

        res.json({
          success: true,
          id: stored.id,
          index: stored.index,
          imagePath: stored.imagePath,
          message: `Design captured and cached as #${stored.index}`,
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Failed to process capture', details: message });
      }
    });

    // 6. Get the latest design payload
    this.app.get('/api/latest', (_req: Request, res: Response): void => {
      const latest = this.cacheManager.getLatest();
      if (!latest) {
        res.status(404).json({ error: 'No design captures found yet' });
        return;
      }
      res.json(latest);
    });

    // 7. Get Design Inbox (active/pending items)
    this.app.get('/api/inbox', (_req: Request, res: Response): void => {
      res.json(this.cacheManager.getInbox());
    });

    // 8. List all historical captures
    this.app.get('/api/history', (_req: Request, res: Response): void => {
      res.json(this.cacheManager.getHistory());
    });

    // 9. Serve thumbnail image for a capture
    this.app.get('/api/image/:id', (req: Request, res: Response): void => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const capture = this.cacheManager.getByIdOrIndex(id);
      if (capture && capture.imagePath) {
        res.sendFile(capture.imagePath);
      } else {
        res.status(404).send('Image not found');
      }
    });

    // 9. Delete specific capture by ID or index
    this.app.delete('/api/capture/:id', (req: Request, res: Response): void => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = this.cacheManager.deleteCapture(id);
      if (success) {
        res.json({ success: true, message: `Capture ${id} deleted` });
      } else {
        res.status(404).json({ error: 'Capture not found' });
      }
    });

    // 10. Clear entire Design Inbox
    this.app.post('/api/clear', (_req: Request, res: Response): void => {
      const count = this.cacheManager.clearAll();
      res.json({ success: true, clearedCount: count });
    });

    // 11. Update status of a capture
    this.app.patch('/api/capture/:id', (req: Request, res: Response): void => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body as { status: 'pending' | 'completed' };
      if (!status || !['pending', 'completed'].includes(status)) {
        res.status(400).json({ error: 'Invalid status: must be "pending" or "completed"' });
        return;
      }
      const success = this.cacheManager.updateStatus(id, status);
      if (success) {
        res.json({ success: true });
      } else {
        res.status(404).json({ error: 'Capture not found' });
      }
    });
  }

  public start(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.server = this.app.listen(this.port, '127.0.0.1', () => {
        resolve(this.port);
      });
      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  public stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) return resolve();
      this.server.close((err) => (err ? reject(err) : resolve()));
    });
  }

  public getPort(): number {
    return this.port;
  }
}
