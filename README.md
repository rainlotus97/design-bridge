# DesignBridge (设计智能体桥梁)

> 通用设计转代码桥梁与 MCP 工具链，原生跨平台支持（Windows / macOS Node.js 环境）。  
> 专为 Antigravity、Cursor、Claude 等 AI Agent 设计，打破设计网站（MasterGo、Figma、蓝湖等）与前端代码之间的壁垒。

---

## 核心设计理念

1. **双通道协同（Dual-Input Fusion）**：
   - **PNG 视觉为主**：发挥多模态大模型的原生空间与排版识别能力，精准提取语义、业务文本与状态插槽，彻底摆脱传统 OCR 识别率低与字体转曲（Path）难题。
   - **SVG 几何为辅**：提取 `<defs>` 中的毛玻璃参数、渐变色 HEX、独立小图标矢量组件。
   - **CSS 物理度量为辅**：提供物理级边距（Padding/Margin）、圆角半径（Radius）、阴影（Shadow）事实校准。
2. **两阶段架构（Two-Stage Process）**：
   - **Stage 1（AI 规范层）**：将设计事实提炼为中立、严谨的《UI 蓝图规范》（UI Blueprint），明确标记可变插槽（Props）与不变骨架（Invariants）。
   - **Stage 2（代码生成层）**：由会话 AI 面向 React、Vue 3、Tailwind 等具体工程栈生成高质量生产级代码。
3. **可插拔适配器生态（Adapter Ecosystem）**：
   - 各类设计网站提取逻辑以独立插件/脚本形式解耦，即插即用。
4. **Antigravity 零阻力兼容**：
   - 本地轻量中继服务（Local Bridge）落盘高清晰预览图至本地缓存，向 Agent 提供标准本地绝对路径，兼顾跨平台文件读取。

---

## 项目结构 (Monorepo)

```text
design-bridge/
├── packages/
│   ├── core/                          # 核心清洗与规则引擎 (Tokens/Heuristics/Blueprint)
│   └── mcp-server/                    # MCP 服务端 + 本地 HTTP 中继服务 + 缓存管理
├── plugins/
│   └── adapters/
│       ├── adapter-mastergo/          # MasterGo 网页提取插件 / 油猴脚本
│       └── adapter-clipboard/         # 通用系统剪贴板 / 截图兜底提取器
├── pnpm-workspace.yaml
├── package.json
└── PLAN.md                            # 阶段性研发计划
```
