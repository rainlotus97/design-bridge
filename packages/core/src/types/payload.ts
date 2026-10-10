import { z } from 'zod';

/**
 * Standard Design Capture Payload transferred from browser adapters to the MCP server.
 */
export const CapturedDesignPayloadSchema = z.object({
  /** Source identifier, e.g. 'mastergo', 'figma', 'lanhu', 'clipboard' */
  source: z.string().default('unknown'),
  /** Timestamp when the design was captured */
  timestamp: z.number().default(() => Date.now()),
  /** Metadata of the selected layer / artboard */
  meta: z.object({
    name: z.string().default('Untitled'),
    width: z.number().optional(),
    height: z.number().optional(),
    url: z.string().optional(),
  }),
  /** Visual image payload (PNG base64 data URL or binary buffer representation) */
  image: z.object({
    base64: z.string(), // e.g. "data:image/png;base64,..." or raw base64 string
    mimeType: z.string().default('image/png'),
    filePath: z.string().optional(), // populated after cache manager writes to disk
  }),
  /** Vector geometry payload (Raw SVG string) */
  vector: z.object({
    svgRaw: z.string().default(''),
  }).optional(),
  /** Style inspector payload (Raw CSS or Tailwind string copied from inspect panel) */
  styles: z.object({
    cssRaw: z.string().default(''),
  }).optional(),
  /** Optional user runtime notes / instructions added in the browser drawer */
  userNotes: z.string().optional(),
});

export type CapturedDesignPayload = z.infer<typeof CapturedDesignPayloadSchema>;

/**
 * Standard contract that every design website adapter must fulfill.
 */
export interface DesignAdapter {
  name: string;
  matchUrl: RegExp;
  extract(): Promise<Omit<CapturedDesignPayload, 'timestamp'>>;
}
