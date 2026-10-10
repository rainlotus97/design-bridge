import express, { Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'node:http';
import { CapturedDesignPayload, extractTokensFromSvg } from '@design-bridge/core';
import { CacheManager, StoredCapture } from '../cache/cache-manager.js';

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
    // Health check
    this.app.get('/health', (_req: Request, res: Response) => {
      res.json({ status: 'ok', service: 'design-bridge-http-bridge', version: '0.1.0' });
    });

    // Ingest captured design from browser extension or userscript
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
          imagePath: stored.imagePath,
          message: 'Design captured and cached successfully for AI',
        });
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        res.status(500).json({ error: 'Failed to process capture', details: message });
      }
    });

    // Get the latest design payload
    this.app.get('/api/latest', (_req: Request, res: Response): void => {
      const latest = this.cacheManager.getLatest();
      if (!latest) {
        res.status(404).json({ error: 'No design captures found yet' });
        return;
      }
      res.json(latest);
    });

    // List historical captures
    this.app.get('/api/history', (_req: Request, res: Response): void => {
      res.json(this.cacheManager.getHistory());
    });
  }

  public start(): Promise<number> {
    return new Promise((resolve) => {
      this.server = this.app.listen(this.port, '127.0.0.1', () => {
        resolve(this.port);
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
