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
    version: '0.2.0',
  });

  // Tool 1: list_design_inbox (查看设计待办池)
  server.tool(
    'list_design_inbox',
    'List all designs recorded in the Design Inbox / Todo Queue. Shows item index (#1, #2), ID, layer title, capture time, user notes, and pending/completed status.',
    {
      status: z.enum(['all', 'pending', 'completed']).optional().describe('Filter by status: "all", "pending", or "completed". Defaults to "pending".'),
    },
    async ({ status = 'pending' }) => {
      const items = status === 'all'
        ? cacheManager.getHistory()
        : status === 'completed'
        ? cacheManager.getHistory().filter((i) => i.status === 'completed')
        : cacheManager.getInbox();

      if (items.length === 0) {
        return {
          content: [
            {
              type: 'text',
              text: '📭 当前设计待办池为空。\n\n您可以在 MasterGo、Figma 或 Web 控制台 (http://127.0.0.1:23851/) 中提交设计图，提交后会自动排队记录。',
            },
          ],
        };
      }

      const rows = items.map((item) => {
        const timeStr = new Date(item.timestamp).toLocaleTimeString();
        const statusIcon = item.status === 'completed' ? '✅ 已完成' : '⏳ 待办';
        const notes = item.userNotes ? `\n   > 需求备注: ${item.userNotes}` : '';
        const idLabel = item.shortId || item.id;
        return `* **\`[ID: ${idLabel}]\`** **${item.meta.name || '未命名图层'}** (${statusIcon} | ${timeStr})${notes}\n   图片路径: \`${item.imagePath}\``;
      });

      return {
        content: [
          {
            type: 'text',
            text: `### 📋 设计待办池 (共 ${items.length} 项)\n\n${rows.join('\n\n')}\n\n---\n💡 **使用提示**：您可以直接告诉我：“*实现设计 [ID]*”（例如：\`实现设计 ${items[0]?.shortId || items[0]?.id}\`），我将自动获取对应设计的视觉细节与代码规范。`,
          },
        ],
      };
    }
  );

  // Tool 2: get_captured_design (支持按序号 #1、ID、名称定向获取)
  server.tool(
    'get_captured_design',
    'Retrieve a specific design from the inbox by its sequential index (#1, #2), ID, or keyword. If omitted, returns the latest captured design.',
    {
      query: z.string().optional().describe('Target design identifier: can be index (e.g. "#1" or "1"), ID (e.g. "179160..."), or layer title keyword. If empty, defaults to latest.'),
      tech_stack: z.string().optional().describe('Target technology stack, e.g. "React + Tailwind CSS" or "Vue 3 + Tailwind CSS". Default: "React + Tailwind CSS".'),
      user_prompt: z.string().optional().describe('Additional instructions or requirements for this component generation.'),
      mark_completed: z.boolean().optional().describe('Whether to mark this design as completed after retrieving it. Default: false.'),
    },
    async ({ query, tech_stack, user_prompt, mark_completed }) => {
      const capture = cacheManager.getByIdOrIndex(query);

      if (!capture) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ 未在待办池中找到匹配的设计 (${query || 'latest'})。\n\n请调用 "list_design_inbox" 查看当前待办池中的所有设计列表。`,
            },
          ],
        };
      }

      if (mark_completed) {
        cacheManager.updateStatus(capture.id, 'completed');
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
            text: `> 🎯 已定位到待办项 **[ID: ${capture.shortId || capture.id}]** - ${capture.meta.name || '未命名'}\n\n${markdownPrompt}`,
          },
        ],
      };
    }
  );

  // Tool 3: delete_design (删除指定设计)
  server.tool(
    'delete_design',
    'Delete a specific design from the Design Inbox and disk cache by index (#1, #2) or ID.',
    {
      query: z.string().describe('Target design identifier to delete: can be index (e.g. "#1" or "1") or ID.'),
    },
    async ({ query }) => {
      const success = cacheManager.deleteCapture(query);
      if (success) {
        return {
          content: [
            {
              type: 'text',
              text: `🗑️ 成功删除设计项 (${query})，已从待办池与本地磁盘清理。`,
            },
          ],
        };
      } else {
        return {
          content: [
            {
              type: 'text',
              text: `⚠️ 未找到匹配的设计项 (${query})，删除失败。`,
            },
          ],
        };
      }
    }
  );

  // Tool 4: update_design (修改设计待办项)
  server.tool(
    'update_design',
    'Update an existing design capture in the inbox (change title name, user requirements notes, or completion status).',
    {
      target: z.string().describe('Design index (#1, 1), ID, or title keyword to update.'),
      name: z.string().optional().describe('New design title or component name.'),
      notes: z.string().optional().describe('New or updated user requirements / implementation notes.'),
      status: z.enum(['pending', 'completed']).optional().describe('New status: "pending" or "completed".'),
    },
    async ({ target, name, notes, status }) => {
      const updated = cacheManager.updateCapture(target, {
        name,
        userNotes: notes,
        status,
      });

      if (!updated) {
        return {
          content: [
            {
              type: 'text',
              text: `❌ 未找到对应设计项："${target}"。请使用 list_design_inbox 查看现有设计。`,
            },
          ],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: `✅ 设计 **#${updated.index}** [${updated.id}] 已成功更新！\n* 名称: **${updated.meta.name}**\n* 状态: ${updated.status === 'completed' ? '✅ 已完成' : '⏳ 待办'}\n* 备注: ${updated.userNotes || '无'}`,
          },
        ],
      };
    }
  );

  // Tool 5: clear_design_inbox (清空全部待办池)
  server.tool(
    'clear_design_inbox',
    'Clear all design captures from the inbox and disk cache.',
    {},
    async () => {
      const count = cacheManager.clearAll();
      return {
        content: [
          {
            type: 'text',
            text: `🧹 已成功清空设计待办池，共释放清理了 ${count} 个历史设计缓存。`,
          },
        ],
      };
    }
  );

  // Tool 5: parse_design_tokens (手动粘贴解析兜底)
  server.tool(
    'parse_design_tokens',
    'Directly parse raw SVG vector code and/or CSS inspector text into clean design tokens.',
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

  return server;
}

export async function runStdioServer(cacheManager: CacheManager): Promise<void> {
  const server = createDesignBridgeMcpServer(cacheManager);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
