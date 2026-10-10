# DesignBridge 阶段性研发计划 (Phased Plan)

本项目采用原生 Node.js（跨 Windows 和 macOS），基于 Monorepo 架构进行分阶段渐进式落地。

---

## 阶段一：Monorepo 脚手架与核心数据契约（Phase 1: Foundation & Contracts）
- [x] 初始化 Monorepo 仓库结构与 Git
- [x] 创建 `packages/core`：
  - [x] 定义统一数据交互协议 `CapturedDesignPayload`（包含 PNG 图片、SVG 矢量、CSS 标注、用户自述规则元数据）。
  - [x] 定义核心蓝图结构 `UIBlueprintSchema` 与 DesignTokens。
- [x] 创建 `packages/mcp-server` 基础脚手架：
  - [x] 引入 `@modelcontextprotocol/sdk`。
  - [x] 配置 TypeScript 编译环境与跨平台路径适配工具。

## 阶段二：本地中继接收器与 MCP 服务打通（Phase 2: Local Bridge & MCP Server）
- [x] 本地轻量 HTTP 中继接收服务（Local Bridge Receiver）：
  - [x] 监听本地端口（默认 `http://127.0.0.1:23851`）。
  - [x] 提供 `POST /api/capture` 接口接收网页插件发送的 Payload。
  - [x] 自动创建并落盘至本地缓存目录（`~/.design-bridge/cache/{id}/`），保存 `preview.png`、`source.svg`、`style.css`。
- [x] 实现 MCP 核心 Tools：
  - [x] `get_captured_design(id?, tech_stack?, user_prompt?)`：向 AI 暴露最新捕获的设计信息，包含本地图片绝对路径、清洗后的 Token、用户提示。
  - [x] `parse_design_tokens(svg_code?, css_code?, image_path?, user_prompt?, tech_stack?)`：直接将粘贴的 SVG/CSS 转换为精简 Token 与 AI Blueprint。
  - [x] `list_capture_history()`：查看最近捕获的设计列表。

## 阶段三：Token 提炼与布局启发式规则引擎（Phase 3: Core Parser & Heuristics）
- [x] SVG 噪声清洗器 (`packages/core/src/parser/svg-cleaner.ts`)：
  - [x] 过滤长路径（转曲文字的 path），将 50KB 坐标降噪压缩为 1KB 纯净元数据。
  - [x] 提取渐变定义（`<linearGradient>` / stops）。
  - [x] 提取滤镜效果（`backdrop-filter: blur(5px)`）。
  - [x] 提取关键小图标为独立标准 SVG 组件。
- [x] CSS 物理标尺解析 (`packages/core/src/parser/css-normalizer.ts`)：
  - [x] 提取 `border-radius`、`padding`、`margin`、`gap`、`colors`、`typography` 规则。
- [x] 启发式布局规则库（Heuristics Engine）：
  - [x] 渲染分流标记：自动识别 `<canvas>` 占位、SVG 独立组件与纯 DOM 元素。
  - [x] 可变性标记（Invariants vs Variables）。

## 阶段四：MasterGo 专用适配器与通用剪贴板（Phase 4: Adapters Ecosystem）
- [x] `plugins/adapters/adapter-mastergo`：
  - [x] 开发 MasterGo 适用的轻量浏览器脚本 (`mastergo-bridge.user.js`，支持油猴 / 暴力猴脚本 / 扩展注入)。
  - [x] 悬浮胶囊 UI：支持用户在点击“发送到 AI”时快捷输入 1~2 句补充需求（如“用 Vue3 + Tailwind”）。
  - [x] 一键抓取截图与 SVG，发送至 `http://127.0.0.1:23851/api/capture`。
- [x] `plugins/adapters/adapter-clipboard`：
  - [x] 兜底方案：支持直接读取系统剪贴板中的图片与 SVG。

## 阶段五：Antigravity 全局引导与端到端实测验证（Phase 5: Integration & Verification）
- [x] 真实设计稿回归验证 (`test/verify.ts`)：
  - [x] 针对用户提供的 MasterGo 船舶卡片 SVG 样本进行回归测试，渐变色、圆角、毛玻璃模糊提取测试 100% 通过。
  - [x] 验证 AI Prompt Blueprint 生成管道。
- [ ] 全局一键注册配置指引：
  - [ ] 在 Antigravity 中配置全局可用 `design-bridge-mcp`。
