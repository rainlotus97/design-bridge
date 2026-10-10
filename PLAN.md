# DesignBridge 阶段性研发计划 (Phased Plan)

本项目采用原生 Node.js（跨 Windows 和 macOS），基于 Monorepo 架构进行分阶段渐进式落地。

---

## 阶段一：Monorepo 脚手架与核心数据契约（Phase 1: Foundation & Contracts）
- [x] 初始化 Monorepo 仓库结构与 Git
- [ ] 创建 `packages/core`：
  - 定义统一数据交互协议 `CapturedDesignPayload`（包含 PNG 图片、SVG 矢量、CSS 标注、用户自述规则元数据）。
  - 定义核心蓝图结构 `UIBlueprintSchema`。
- [ ] 创建 `packages/mcp-server` 基础脚手架：
  - 引入 `@modelcontextprotocol/sdk`。
  - 配置 TypeScript 编译环境与跨平台路径适配工具。

## 阶段二：本地中继接收器与 MCP 服务打通（Phase 2: Local Bridge & MCP Server）
- [ ] 本地轻量 HTTP 中继接收服务（Local Bridge Receiver）：
  - 监听本地端口（默认 `http://127.0.0.1:23851`）。
  - 提供 `POST /api/capture` 接口接收网页插件发送的 Payload。
  - 自动创建并落盘至本地缓存目录（如 `~/.design-bridge/cache/{id}/`），保存 `preview.png`、`source.svg`、`style.css`。
- [ ] 实现 MCP 核心 Tools：
  - `get_captured_design(filter?: string)`：向 AI 暴露最新捕获的设计信息，包含本地图片绝对路径、清洗后的 Token、用户提示。
  - `parse_design_tokens(svgRaw?: string, cssRaw?: string)`：直接将粘贴的 SVG/CSS 转换为精简 Token。
  - `list_capture_history()`：查看最近捕获的设计列表。

## 阶段三：Token 提炼与布局启发式规则引擎（Phase 3: Core Parser & Heuristics）
- [ ] SVG 噪声清洗器：
  - 过滤长路径（转曲文字的 path）。
  - 提取渐变定义（`<linearGradient>` / `<radialGradient>`）。
  - 提取滤镜效果（`backdrop-filter`, `filter`, `box-shadow`）。
  - 提取关键小图标为独立标准 SVG 组件。
- [ ] CSS 物理标尺解析：
  - 提取 `border-radius`、`padding`、`margin`、`gap`、`colors`、`font` 规则。
- [ ] 启发式布局规则库（Heuristics Engine）：
  - 弹性排列（Flex row / col）判定规则。
  - 对称网格（Grid cols）判定规则。
  - 渲染分流标记：自动识别 `<canvas>` 占位、SVG 独立组件与纯 DOM 元素。
  - 可变性标记（Invariants vs Variables）。

## 阶段四：MasterGo 专用适配器与通用剪贴板（Phase 4: Adapters Ecosystem）
- [ ] `plugins/adapters/adapter-mastergo`：
  - 开发 MasterGo 适用的轻量浏览器脚本（油猴脚本 / 浏览器扩展 Content Script）。
  - 一键截取当前选中画板的高清 PNG、提取所选图层的 SVG、读取 Inspect 栏目 CSS。
  - 悬浮胶囊 UI：支持用户在点击“发送到 AI”时快捷输入 1~2 句补充需求（如“用 Vue3 + Tailwind”）。
  - 发送至 `http://127.0.0.1:23851/api/capture`。
- [ ] `plugins/adapters/adapter-clipboard`：
  - 兜底方案：支持直接读取系统剪贴板中的图片与 SVG。

## 阶段五：Antigravity 全局引导与端到端实测验证（Phase 5: Integration & Verification）
- [ ] 全局一键注册 CLI：
  - 实现 `pnpm mcp:register` 或一键向 Antigravity 全局 MCP 配置写入配置。
- [ ] 真实设计稿回归验证：
  - 针对用户提供的《一张屏项目》船舶卡片（标题、Tabs、2x3 经纬度/航向/航速网格、底部折叠详情）进行全链路端到端跑通。
  - 验证 AI 是否能零幻觉、结构清晰地直接生成标准生产级前端组件。
