import { DesignTokens } from '../types/tokens.js';
import { NormalizedCssStyles } from '../parser/css-normalizer.js';
import { generateCssVariables } from '../parser/svg-cleaner.js';

/**
 * Builds the AI prompt combining visual ground truth (PNG path) + physical design tokens (SVG/CSS).
 * Enforces:
 * 1. Standard CSS Variables (:root) for design tokens
 * 2. Standalone .svg asset extraction & file reference (strictly no inline SVG code soup)
 * 3. Anti-hardcoding & elastic flex/grid layout (strictly no absolute positions or dead height)
 * 4. Cross-platform engineering mapping (Web / HarmonyOS / Qt 有迹可循)
 */
export function buildAiDesignPrompt(params: {
  imagePath: string;
  tokens: DesignTokens;
  cssStyles?: NormalizedCssStyles;
  userNotes?: string;
  techStack?: string;
}): string {
  const { imagePath, tokens, cssStyles, userNotes, techStack = 'React + Tailwind CSS' } = params;

  const sections: string[] = [];

  sections.push(`## 🎨 Design-to-Code Blueprint Context`);
  sections.push(`**Target Stack**: ${techStack}`);
  sections.push(`**Visual Reference (PNG Image)**: [preview.png](file:///${imagePath.replace(/\\/g, '/')})`);

  if (userNotes && userNotes.trim()) {
    sections.push(`\n### 📝 User Instructions & Supplementary Notes\n> ${userNotes.trim()}`);
  }

  // 1. Standard CSS Tokens
  sections.push(`\n### 💎 Standard Design Tokens (CSS Variables)`);
  const cssVars = tokens.cssVariables || generateCssVariables(tokens);
  sections.push('```css\n' + cssVars + '\n```');

  if (tokens.dimensions) {
    sections.push(`- **Design Reference Boundary**: ${tokens.dimensions.width}px x ${tokens.dimensions.height}px (Treat as recommended \`max-w-[${tokens.dimensions.width}px]\`, never hardcode as fixed dead width/height)`);
  }

  // 2. Standalone Vector Icons Catalog
  if (tokens.icons.length > 0) {
    sections.push(`\n### ⚡ Standalone Vector Icons Catalog (${tokens.icons.length} Icons)`);
    sections.push(`*All vector glyphs have been isolated into independent SVG assets in the \`icons/\` directory.*`);
    sections.push(`**CRITICAL**: DO NOT embed raw \`<path d="..." />\` strings into your component code! Reference them via \`<img src="./icons/..." />\`, icon components, or CSS masks.`);
    
    tokens.icons.forEach((icon, idx) => {
      const fileName = icon.fileName || `icon_${idx + 1}.svg`;
      const diskPath = icon.filePath ? `[${fileName}](file:///${icon.filePath.replace(/\\/g, '/')})` : `\`${fileName}\``;
      sections.push(`- **#${idx + 1}** ${diskPath} (${icon.width}x${icon.height}px, viewBox: \`${icon.viewBox}\`)`);
    });
  }

  // 3. Inspect Panel Metrics (CSS)
  if (cssStyles && Object.keys(cssStyles.raw).length > 0) {
    sections.push(`\n### 📏 Inspect Panel Metrics (CSS)`);
    if (cssStyles.typography.fontSize || cssStyles.typography.fontWeight) {
      sections.push(`- **Typography**: size=${cssStyles.typography.fontSize || 'inherit'}, weight=${cssStyles.typography.fontWeight || 'inherit'}, line-height=${cssStyles.typography.lineHeight || 'inherit'}`);
    }
    if (cssStyles.layout.gap || cssStyles.layout.padding) {
      sections.push(`- **Spacings**: gap=${cssStyles.layout.gap || 'auto'}, padding=${cssStyles.layout.padding || 'auto'}`);
    }
  }

  // 4. Strict Implementation Directives
  sections.push(`
### 🛠️ Strict Implementation Directives for AI

#### 1. 🚫 Anti-Hardcoding & Elasticity (严禁写死死数值与绝对定位)
- **容器自适应**: 严禁将根容器或父卡片强行写死固定宽高（如死写 \`w-[388px] h-[360px]\` 或 \`height: 360px\`）。容器应采用 \`w-full max-w-[${tokens.dimensions?.width || 388}px] flex flex-col\`，高度由内部流式布局自然撑开，保证在不同视口或字号缩放时不破损。
- **杜绝绝对定位分割线**: 绝对严禁使用 \`absolute left-[128px]\` 等硬编码位移来绘制垂直/水平分割线！必须使用标准的 CSS 盒模型（Flexbox 分割边框 \`border-r\`, \`border-b\`，或标准网格列）实现自然对齐。
- **禁止全局滥用 \`divide-y\`**: 必须肉眼比对原图视觉分组。只有真正具有分割线的行与行之间才写边框，相邻视觉组之间若无分割线，切勿无脑施加全局 \`divide-y\`。
- **图标引用规范**: 严禁在代码中堆砌数十行臃肿的内联 SVG \`<path d="...">\` 代码。一律使用独立的静态文件引用（如 \`<img src="./icons/..." />\`、统一图标组件，或复制到目标平台静态资源库中）。

#### 2. 📐 Cross-Platform Architecture Mapping (跨端开发规范：有迹可循，拒绝空谈)
无论当前目标是 Web，还是后续移植到**鸿蒙 (HarmonyOS ArkUI)** 或 **Qt (QML / QWidget)**，都必须严格遵循标准化的布局语义：

| 布局属性 | 现代 Web (HTML / Tailwind CSS) | 鸿蒙 ArkUI (ArkTS) | Qt (QML) |
| :--- | :--- | :--- | :--- |
| **容器流向** | \`flex flex-col\` / \`flex-1\` | \`Column()\` / \`layoutWeight(1)\` | \`ColumnLayout\` / \`Layout.fillWidth: true\` |
| **横向排版** | \`flex items-center justify-between\` | \`Row() { ... }.justifyContent(FlexAlign.SpaceBetween)\` | \`RowLayout { ... }\` |
| **等分/多列网格**| \`grid grid-cols-2\` / \`grid-cols-3\` | \`GridRow\` / \`Flex({ wrap: FlexWrap.Wrap })\` | \`GridLayout { columns: 2 }\` |
| **行间分割线** | \`border-b border-[var(--design-divider)]\` | \`Divider().color($r('app.color.divider'))\` | \`Rectangle { height: 1; color: ... }\` |
| **列间分割线** | \`border-r border-[var(--design-divider)]\` | \`Divider().vertical(true).height(44)\` | \`Rectangle { width: 1; Layout.fillHeight: true }\` |
| **毛玻璃与圆角**| \`rounded-[var(--design-card-radius)] backdrop-blur-md\` | \`.borderRadius(20).backgroundBlurStyle(BlurStyle.Thin)\` | \`Rectangle { radius: 20 }\` + \`FastBlur\` |
| **图标加载** | \`<img src="./icons/wind.svg" class="w-3.5 h-3.5" />\` | \`Image($r('app.media.wind')).width(14).height(14)\` | \`Image { source: "icons/wind.svg" }\` |

#### 3. 🎯 Mutability & Slots (动态数据插槽)
- 提取所有的静态不可变骨架（标题、图标、标签、单位），与动态可变数据（数值、状态色彩）。
- 动态属性必须全部声明为 Props / 属性接口，确保组件真正具备工程级复用能力。
`);

  return sections.join('\n');
}
