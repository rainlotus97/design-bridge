# DesignBridge (设计智能体桥梁)

> 通用设计转代码桥梁与 MCP 工具链，原生跨平台支持（Windows / macOS Node.js 环境）。  
> 专为 Antigravity、Cursor、Claude 等 AI Agent 设计，打破设计网站（MasterGo、Figma、蓝湖等）与前端代码之间的壁垒。

---

## 🌟 核心特性与双模使用方式

### 1. 无需绝对路径的 MCP Server（URL 协议直连）
告别死板的本地绝对路径配置，服务运行后原生提供 **SSE 远程 MCP 端点**：
```json
{
  "mcpServers": {
    "design-bridge": {
      "url": "http://127.0.0.1:23851/sse"
    }
  }
}
```

### 2. 双重免油猴采集方式
- **方式 A：内置 Web 捕获中心（零插件依赖）**
  - 打开浏览器访问 [http://127.0.0.1:23851/](http://127.0.0.1:23851/)
  - 在页面任意处按 `Ctrl + V` 粘贴截图，支持贴入 SVG 代码与个性化要求，一键直推本地 AI。
- **方式 B：原生 Chrome 扩展程序（Manifest V3）**
  - 目录：`plugins/extension-chrome`
  - 打开 Chrome `chrome://extensions` 勾选“开发者模式”，点击“加载已解压的扩展程序”选择该目录即可。
  - 打开 MasterGo、Figma 等页面右下角将自动出现 **⚡ 发送到 AI** 胶囊。

---

## 🚀 启动与使用

### 启动服务
```bash
# 进入项目目录
cd D:\Document\design-bridge

# 启动本地桥梁与 MCP SSE 服务 (端口 23851)
pnpm start
```

### 运行自动化测试
```bash
pnpm test
```

---

## 项目结构 (Monorepo)

```text
design-bridge/
├── packages/
│   ├── core/                          # 核心清洗与规则引擎 (Tokens/Heuristics/Blueprint)
│   └── mcp-server/                    # MCP 服务端 + SSE 流端点 + Web 控制台 + 缓存管理
├── plugins/
│   ├── extension-chrome/              # 原生 Chrome 扩展 (Manifest V3, 开发者模式即载)
│   └── adapters/
│       ├── adapter-mastergo/          # 油猴脚本备用方案
│       └── adapter-clipboard/         # 纯命令行剪贴板适配器
├── test/                              # 端到端测试套件与真实 SVG 样本
├── pnpm-workspace.yaml
├── package.json
└── PLAN.md
```
