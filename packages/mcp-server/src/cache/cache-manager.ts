import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { CapturedDesignPayload, DesignTokens, extractTokensFromSvg } from '@design-bridge/core';

export interface StoredCapture {
  id: string;
  index: number;
  timestamp: number;
  dirPath: string;
  imagePath: string;
  svgPath?: string;
  cssPath?: string;
  iconsDir?: string;
  meta: CapturedDesignPayload['meta'];
  tokens: DesignTokens;
  userNotes?: string;
  status: 'pending' | 'completed';
}

export class CacheManager {
  private baseDir: string;
  private history: StoredCapture[] = [];

  constructor(customBaseDir?: string) {
    if (customBaseDir) {
      this.baseDir = customBaseDir;
    } else {
      this.baseDir = path.join(os.homedir(), '.design-bridge', 'cache');
    }
    fs.mkdirSync(this.baseDir, { recursive: true });
    this.loadHistory();
  }

  public getBaseDir(): string {
    return this.baseDir;
  }

  public getLatest(): StoredCapture | null {
    return this.history[0] || null;
  }

  public getHistory(): StoredCapture[] {
    return this.history;
  }

  public getInbox(): StoredCapture[] {
    return this.history.filter((item) => item.status !== 'completed');
  }

  /**
   * Flexible lookup by Index (#1, 1), ID (exact or prefix), or Title substring.
   */
  public getByIdOrIndex(query?: string | number): StoredCapture | undefined {
    if (!query || query === 'latest') {
      return this.getLatest() || undefined;
    }

    const str = String(query).trim();

    // Check if query is #1 or numeric index (1, 2, 3)
    const indexMatch = str.match(/^#?(\d+)$/);
    if (indexMatch && indexMatch[1]) {
      const idx = parseInt(indexMatch[1], 10);
      const foundByIndex = this.history.find((item) => item.index === idx);
      if (foundByIndex) return foundByIndex;
    }

    // Check exact or prefix ID match
    const foundById = this.history.find((item) => item.id === str || item.id.startsWith(str));
    if (foundById) return foundById;

    // Check layer title match
    const lower = str.toLowerCase();
    const foundByTitle = this.history.find((item) =>
      item.meta.name?.toLowerCase().includes(lower)
    );
    if (foundByTitle) return foundByTitle;

    return undefined;
  }

  /**
   * Saves incoming payload to local disk and indexes it in the Design Inbox.
   * Automatically isolates and writes standalone .svg icon files into `icons/`.
   */
  public saveCapture(payload: CapturedDesignPayload, tokens: DesignTokens): StoredCapture {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const captureDir = path.join(this.baseDir, id);
    fs.mkdirSync(captureDir, { recursive: true });

    // 1. Save Image (decode base64)
    let base64Clean = payload.image.base64;
    const dataUrlPrefixMatch = base64Clean.match(/^data:image\/[a-zA-Z+]+;base64,/);
    if (dataUrlPrefixMatch && dataUrlPrefixMatch[0]) {
      base64Clean = base64Clean.slice(dataUrlPrefixMatch[0].length);
    }
    const imageBuffer = Buffer.from(base64Clean, 'base64');
    const imagePath = path.join(captureDir, 'preview.png');
    fs.writeFileSync(imagePath, imageBuffer);

    // 2. Save SVG if provided
    let svgPath: string | undefined;
    if (payload.vector?.svgRaw) {
      svgPath = path.join(captureDir, 'source.svg');
      fs.writeFileSync(svgPath, payload.vector.svgRaw, 'utf8');
    }

    // 3. Save CSS if provided (or default to standard cssVariables)
    let cssPath: string | undefined;
    if (payload.styles?.cssRaw) {
      cssPath = path.join(captureDir, 'style.css');
      fs.writeFileSync(cssPath, payload.styles.cssRaw, 'utf8');
    } else if (tokens.cssVariables) {
      cssPath = path.join(captureDir, 'style.css');
      fs.writeFileSync(cssPath, tokens.cssVariables, 'utf8');
    }

    // 4. Extract and save standalone vector icons as independent .svg files
    let iconsDir: string | undefined;
    if (tokens.icons && tokens.icons.length > 0) {
      iconsDir = path.join(captureDir, 'icons');
      fs.mkdirSync(iconsDir, { recursive: true });

      tokens.icons.forEach((icon, idx) => {
        const fileName = icon.fileName || `icon_${idx + 1}_${Math.round(icon.width)}x${Math.round(icon.height)}.svg`;
        const iconPath = path.join(iconsDir!, fileName);
        fs.writeFileSync(iconPath, icon.svgString, 'utf8');
        icon.fileName = fileName;
        icon.filePath = iconPath;
      });
    }

    const nextIndex = this.getNextIndex();

    // 5. Save metadata JSON
    const stored: StoredCapture = {
      id,
      index: nextIndex,
      timestamp: payload.timestamp || Date.now(),
      dirPath: captureDir,
      imagePath,
      svgPath,
      cssPath,
      iconsDir,
      meta: payload.meta,
      tokens,
      userNotes: payload.userNotes,
      status: 'pending',
    };

    fs.writeFileSync(path.join(captureDir, 'metadata.json'), JSON.stringify(stored, null, 2), 'utf8');

    this.history.unshift(stored);
    this.reIndex();

    return stored;
  }

  /**
   * Delete a specific design capture by ID or index number.
   */
  public deleteCapture(query: string | number): boolean {
    const target = this.getByIdOrIndex(query);
    if (!target) return false;

    // Delete folder from disk
    try {
      if (fs.existsSync(target.dirPath)) {
        fs.rmSync(target.dirPath, { recursive: true, force: true });
      }
    } catch {
      // ignore disk delete error
    }

    this.history = this.history.filter((item) => item.id !== target.id);
    this.reIndex();
    return true;
  }

  /**
   * Clear all design captures from the inbox and disk cache.
   */
  public clearAll(): number {
    const count = this.history.length;
    for (const item of this.history) {
      try {
        if (fs.existsSync(item.dirPath)) {
          fs.rmSync(item.dirPath, { recursive: true, force: true });
        }
      } catch {
        // ignore
      }
    }
    this.history = [];
    return count;
  }

  /**
   * Toggle or update item status (pending vs completed).
   */
  public updateStatus(query: string | number, status: 'pending' | 'completed'): boolean {
    return this.updateCapture(query, { status }) !== null;
  }

  /**
   * Update design properties (name, userNotes, status) and persist to disk.
   */
  public updateCapture(
    query: string | number,
    updates: {
      name?: string;
      userNotes?: string;
      status?: 'pending' | 'completed';
    }
  ): StoredCapture | null {
    const target = this.getByIdOrIndex(query);
    if (!target) return null;

    if (updates.name !== undefined) {
      target.meta.name = updates.name.trim() || '未命名设计';
    }
    if (updates.userNotes !== undefined) {
      target.userNotes = updates.userNotes.trim();
    }
    if (updates.status !== undefined) {
      target.status = updates.status;
    }

    try {
      const metaPath = path.join(target.dirPath, 'metadata.json');
      fs.writeFileSync(metaPath, JSON.stringify(target, null, 2), 'utf8');
    } catch {
      // ignore
    }

    return target;
  }

  private getNextIndex(): number {
    if (this.history.length === 0) return 1;
    const maxIdx = Math.max(...this.history.map((i) => i.index || 0));
    return maxIdx + 1;
  }

  private reIndex(): void {
    // Keep sequential indexes #1, #2, #3 from newest to oldest for easy reference
    this.history.forEach((item, idx) => {
      item.index = idx + 1;
    });
  }

  private loadHistory(): void {
    try {
      if (!fs.existsSync(this.baseDir)) return;
      const dirs = fs.readdirSync(this.baseDir).filter((d) => fs.statSync(path.join(this.baseDir, d)).isDirectory());
      // Sort newest first by creation/timestamp
      dirs.sort().reverse();
      for (const d of dirs.slice(0, 50)) {
        const itemDir = path.join(this.baseDir, d);
        const metaPath = path.join(itemDir, 'metadata.json');
        if (fs.existsSync(metaPath)) {
          const content = JSON.parse(fs.readFileSync(metaPath, 'utf8')) as StoredCapture;
          if (!content.status) content.status = 'pending';

          // If source.svg exists, refresh tokens to ensure latest icon parser fixes are applied
          const sourceSvgPath = path.join(itemDir, 'source.svg');
          if (fs.existsSync(sourceSvgPath)) {
            try {
              const svgRaw = fs.readFileSync(sourceSvgPath, 'utf8');
              const refreshedTokens = extractTokensFromSvg(svgRaw);
              if (refreshedTokens.icons.length > 0) {
                content.tokens = refreshedTokens;
              }
            } catch {
              // ignore
            }
          }

          // Ensure icons directory and .svg files are written to disk
          if (content.tokens?.icons?.length > 0) {
            const iconsDir = path.join(itemDir, 'icons');
            fs.mkdirSync(iconsDir, { recursive: true });
            content.iconsDir = iconsDir;

            content.tokens.icons.forEach((icon, idx) => {
              if (!icon.fileName) {
                icon.fileName = `icon_${idx + 1}_${Math.round(icon.width)}x${Math.round(icon.height)}.svg`;
              }
              const iconPath = path.join(iconsDir, icon.fileName);
              if (!fs.existsSync(iconPath) && icon.svgString) {
                fs.writeFileSync(iconPath, icon.svgString, 'utf8');
              }
              icon.filePath = iconPath;
            });
          }

          this.history.push(content);
        }
      }
      this.reIndex();
    } catch {
      // Ignore cache restore errors
    }
  }
}
