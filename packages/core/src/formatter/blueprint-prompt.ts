import { DesignTokens } from '../types/tokens.js';
import { NormalizedCssStyles } from '../parser/css-normalizer.js';

/**
 * Builds the AI prompt combining visual ground truth (PNG path) + physical design tokens (SVG/CSS).
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

  sections.push(`\n### 💎 Ground-Truth Design Tokens (Extracted from SVG & CSS)`);
  if (tokens.dimensions) {
    sections.push(`- **Component Base Dimensions**: ${tokens.dimensions.width}px x ${tokens.dimensions.height}px`);
  }
  if (tokens.gradients.length > 0) {
    sections.push(`- **Gradients**:`);
    tokens.gradients.forEach((g) => sections.push(`  * \`${g.cssString}\``));
  }
  if (tokens.backdropFilters.length > 0) {
    sections.push(`- **Glassmorphism / Filters**: \`${tokens.backdropFilters.join('`, `')}\``);
  }
  if (tokens.radii.length > 0) {
    sections.push(`- **Border Radii**: \`${tokens.radii.join('`, `')}\``);
  }
  if (tokens.borders.length > 0) {
    sections.push(`- **Borders & Strokes**: \`${tokens.borders.join('`, `')}\``);
  }
  if (tokens.colors.length > 0) {
    sections.push(`- **Color Palette (HEX)**: \`${tokens.colors.slice(0, 12).join('`, `')}\``);
  }

  if (cssStyles && Object.keys(cssStyles.raw).length > 0) {
    sections.push(`\n### 📏 Inspect Panel Metrics (CSS)`);
    if (cssStyles.typography.fontSize || cssStyles.typography.fontWeight) {
      sections.push(`- **Typography**: size=${cssStyles.typography.fontSize || 'inherit'}, weight=${cssStyles.typography.fontWeight || 'inherit'}, line-height=${cssStyles.typography.lineHeight || 'inherit'}`);
    }
    if (cssStyles.layout.gap || cssStyles.layout.padding) {
      sections.push(`- **Spacings**: gap=${cssStyles.layout.gap || 'auto'}, padding=${cssStyles.layout.padding || 'auto'}`);
    }
  }

  if (tokens.icons.length > 0) {
    sections.push(`\n### ⚡ Standalone Vector Icons (${tokens.icons.length})`);
    tokens.icons.forEach((icon, idx) => {
      sections.push(`<details><summary>Icon #${idx + 1} (${icon.width}x${icon.height})</summary>\n\n\`\`\`xml\n${icon.svgString}\n\`\`\`\n</details>`);
    });
  }

  sections.push(`
### 🛠️ Implementation Directives for AI
1. **Visual Semantics Priority**: Inspect the PNG image to understand hierarchy, typography text content, and dynamic states (e.g. active tab vs inactive tab, collapsible arrow).
2. **Precision Token Injection**: Apply the exact ground-truth tokens above (gradients, blur, border colors, radii) rather than guessing arbitrary colors.
3. **Elastic Layout (Flex/Grid)**:
   - Convert coordinate soup into responsive Flexbox and Grid.
   - Sibling cards with equal columns must use \`grid grid-cols-2\` or flex wrap, never absolute positioning.
4. **Mutability (Props & Slots)**:
   - Identify static invariant structures (borders, labels, icons) vs dynamic data slots (titles, values, status colors).
   - Expose dynamic fields as TypeScript props.
`);

  return sections.join('\n');
}
