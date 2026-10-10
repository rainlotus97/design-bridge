import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  extractTokensFromSvg,
  parseCssString,
  buildAiDesignPrompt,
} from '@design-bridge/core';
import { CacheManager } from './cache/cache-manager.js';

export function createDesignBridgeMcpServer(cacheManager: CacheManager): McpServer {
  const server = new McpServer({
    name: 'design-bridge-mcp',
    version: '0.1.0',
  });

  // Tool 1: get_captured_design
  server.tool(
    'get_captured_design',
    'Retrieve the latest or specified design captured from MasterGo, Figma, or browser extension. Returns local PNG image path, extracted style tokens, and AI directives.',
    {
      id: z.string().optional().describe('Optional capture ID. If omitted, returns the latest captured design.'),
      tech_stack: z.string().optional().describe('Target technology stack, e.g. "React + Tailwind CSS" or "Vue 3 + Tailwind CSS". Default: "React + Tailwind CSS".'),
      user_prompt: z.string().optional().describe('Additional instructions or requirements for this component generation.'),
    },
    async ({ id, tech_stack, user_prompt }) => {
      const capture = id ? cacheManager.getById(id) : cacheManager.getLatest();

      if (!capture) {
        return {
          content: [
            {
              type: 'text',
              text: '❌ No captured design found in local cache.\n\nPlease either:\n1. Use the MasterGo / Figma browser extension to click "Send to AI"\n2. Or use the "parse_design_tokens" tool to paste SVG/CSS directly.',
            },
          ],
        };
      }

      // Read CSS if available
      let cssStyles;
      if (capture.cssPath) {
        try {
          const fs = await import('node:fs');
          const cssContent = fs.readFileSync(capture.cssPath, 'utf8');
          cssStyles = parseCssString(cssContent);
        } catch {
          // ignore
        }
      }

      const mergedNotes = [capture.userNotes, user_prompt].filter(Boolean).join('\n');

      const markdownPrompt = buildAiDesignPrompt({
        imagePath: capture.imagePath,
        tokens: capture.tokens,
        cssStyles,
        userNotes: mergedNotes,
        techStack: tech_stack || 'React + Tailwind CSS',
      });

      return {
        content: [
          {
            type: 'text',
            text: markdownPrompt,
          },
        ],
      };
    }
  );

  // Tool 2: parse_design_tokens
  server.tool(
    'parse_design_tokens',
    'Directly parse raw SVG vector code and/or CSS inspector text copied from any design website into clean design tokens (colors, gradients, glassmorphism blur, border-radii, standalone vector icons).',
    {
      svg_code: z.string().optional().describe('Raw SVG code copied from design software.'),
      css_code: z.string().optional().describe('Raw CSS text copied from inspect panel.'),
      image_path: z.string().optional().describe('Optional local file path to the reference screenshot PNG.'),
      user_prompt: z.string().optional().describe('Optional custom prompt instructions.'),
      tech_stack: z.string().optional().describe('Target technology stack.'),
    },
    async ({ svg_code, css_code, image_path, user_prompt, tech_stack }) => {
      const tokens = extractTokensFromSvg(svg_code || '');
      const cssStyles = parseCssString(css_code || '');

      const markdownPrompt = buildAiDesignPrompt({
        imagePath: image_path || '(No local PNG specified - relying on text tokens & SVG)',
        tokens,
        cssStyles,
        userNotes: user_prompt,
        techStack: tech_stack || 'React + Tailwind CSS',
      });

      return {
        content: [
          {
            type: 'text',
            text: markdownPrompt,
          },
        ],
      };
    }
  );

  // Tool 3: list_capture_history
  server.tool(
    'list_capture_history',
    'List recently captured designs stored in local disk cache.',
    {},
    async () => {
      const history = cacheManager.getHistory();
      if (history.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: 'No capture history found.',
            },
          ],
        };
      }

      const lines = history.map((item, idx) => {
        const date = new Date(item.timestamp).toLocaleString();
        return `${idx + 1}. **[${item.id}]** - ${item.meta.name || 'Untitled'} (${date}) -> Image: \`${item.imagePath}\``;
      });

      return {
        content: [
          {
            type: 'text',
            text: `### 🕒 Recent Design Captures (${history.length})\n\n${lines.join('\n')}`,
          },
        ],
      };
    }
  );

  return server;
}

export async function runStdioServer(cacheManager: CacheManager): Promise<void> {
  const server = createDesignBridgeMcpServer(cacheManager);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
