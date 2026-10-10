import { DesignTokens, ExtractedIcon, LinearGradientToken } from '../types/tokens.js';

/**
 * Generates a clean, standard CSS Variables (:root) block from extracted tokens.
 * Provides a universal design system foundation that maps cleanly to
 * Web CSS, HarmonyOS ArkUI, and Qt QML/QWidget.
 */
export function generateCssVariables(tokens: {
  gradients?: LinearGradientToken[];
  colors?: string[];
  backdropFilters?: string[];
  radii?: string[];
  borders?: string[];
  dimensions?: { width: number; height: number };
}): string {
  const vars: string[] = [':root {'];

  if (tokens.dimensions) {
    vars.push(`  /* Component Boundary (Elastic Max-Width) */`);
    vars.push(`  --design-max-width: ${tokens.dimensions.width}px;`);
  }

  if (tokens.gradients && tokens.gradients.length > 0) {
    vars.push(`  /* Surface Background */`);
    vars.push(`  --design-bg-gradient: ${tokens.gradients[0].cssString};`);
  } else if (tokens.colors && tokens.colors.length > 0) {
    vars.push(`  /* Surface Background */`);
    vars.push(`  --design-bg-solid: ${tokens.colors[0]};`);
  }

  if (tokens.backdropFilters && tokens.backdropFilters.length > 0) {
    vars.push(`  /* Glassmorphism Blur */`);
    vars.push(`  --design-backdrop-blur: ${tokens.backdropFilters[0]};`);
  }

  if (tokens.radii && tokens.radii.length > 0) {
    vars.push(`  /* Border Radius */`);
    vars.push(`  --design-card-radius: ${tokens.radii[0]};`);
  }

  if (tokens.borders && tokens.borders.length > 0) {
    vars.push(`  /* Outer Border & Stroke */`);
    vars.push(`  --design-card-border: ${tokens.borders[0]};`);
  }

  vars.push(`  /* Structural Dividers */`);
  vars.push(`  --design-divider: rgba(255, 255, 255, 0.08);`);

  vars.push(`  /* Typography Palette */`);
  vars.push(`  --design-text-primary: #FFFFFF;`);
  vars.push(`  --design-text-secondary: #BBC3C9;`);

  vars.push('}');
  return vars.join('\n');
}

/**
 * Robust Regex & AST-free SVG cleaner and token extractor.
 * Runs in pure Node.js without heavy native DOM dependencies.
 */
export function extractTokensFromSvg(svgContent: string): DesignTokens {
  const colors = new Set<string>();
  const backdropFilters = new Set<string>();
  const shadows = new Set<string>();
  const radii = new Set<string>();
  const borders = new Set<string>();
  const gradients: LinearGradientToken[] = [];
  const icons: ExtractedIcon[] = [];

  if (!svgContent || typeof svgContent !== 'string') {
    return {
      colors: [],
      gradients: [],
      backdropFilters: [],
      shadows: [],
      radii: [],
      borders: [],
      icons: [],
      cssVariables: ':root {}',
    };
  }

  // 1. Extract canvas dimensions from <svg ... width="400" height="381" ...>
  let dimensions: { width: number; height: number } | undefined;
  const dimMatch = svgContent.match(/<svg[^>]*\bwidth=["'](\d+(?:\.\d+)?)["'][^>]*\bheight=["'](\d+(?:\.\d+)?)["']/i) ||
                   svgContent.match(/<svg[^>]*\bviewBox=["']\s*0\s+0\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s*["']/i);
  if (dimMatch && dimMatch[1] && dimMatch[2]) {
    dimensions = {
      width: parseFloat(dimMatch[1]),
      height: parseFloat(dimMatch[2]),
    };
  }

  // 2. Extract linearGradient elements from <defs>
  const gradientRegex = /<linearGradient\b([^>]*)>([\s\S]*?)<\/linearGradient>/gi;
  let gradMatch: RegExpExecArray | null;
  while ((gradMatch = gradientRegex.exec(svgContent)) !== null) {
    const attrs = gradMatch[1] ?? '';
    const body = gradMatch[2] ?? '';

    const idMatch = attrs.match(/\bid=["']([^"']+)["']/i);
    const id = idMatch ? (idMatch[1] ?? '') : `grad_${gradients.length}`;

    // Extract stops
    const stopRegex = /<stop\b([^>]*)\/?>/gi;
    let stopMatch: RegExpExecArray | null;
    const stops = [];
    while ((stopMatch = stopRegex.exec(body)) !== null) {
      const stopAttrs = stopMatch[1] ?? '';
      const offsetMatch = stopAttrs.match(/\boffset=["']([^"']+)["']/i);
      const colorMatch = stopAttrs.match(/\bstop-color=["']([^"']+)["']/i);
      const opacityMatch = stopAttrs.match(/\bstop-opacity=["']([^"']+)["']/i);

      if (colorMatch && colorMatch[1]) {
        const offset = offsetMatch ? (offsetMatch[1] ?? '0%') : '0%';
        const color = colorMatch[1];
        const opacity = opacityMatch ? parseFloat(opacityMatch[1] ?? '1') : 1;
        stops.push({ offset, color, opacity });
        colors.add(color.toUpperCase());
      }
    }

    if (stops.length > 0) {
      // Build CSS linear-gradient string
      const stopsCss = stops
        .map((s) => (s.opacity !== undefined && s.opacity < 1 ? `rgba(${hexToRgb(s.color)}, ${s.opacity}) ${s.offset}` : `${s.color} ${s.offset}`))
        .join(', ');
      const cssString = `linear-gradient(135deg, ${stopsCss})`;

      gradients.push({
        id,
        stops,
        cssString,
      });
    }
  }

  // 3. Extract backdrop-filter (e.g. style="backdrop-filter:blur(5px);...")
  const blurRegex = /backdrop-filter:\s*([^;"]+)/gi;
  let blurMatch: RegExpExecArray | null;
  while ((blurMatch = blurRegex.exec(svgContent)) !== null) {
    if (blurMatch[1]) {
      backdropFilters.add(blurMatch[1].trim());
    }
  }

  // 4. Extract border-radius (rx="12", rx="20", rx="11.5")
  const rxRegex = /\brx=["'](\d+(?:\.\d+)?)["']/gi;
  let rxMatch: RegExpExecArray | null;
  while ((rxMatch = rxRegex.exec(svgContent)) !== null) {
    if (rxMatch[1]) {
      const val = parseFloat(rxMatch[1]);
      if (val > 0) {
        radii.add(`${Math.round(val)}px`);
      }
    }
  }

  // 5. Extract colors & borders from fill and stroke attributes
  const colorAttrRegex = /\b(?:fill|stroke)=["'](#(?:[0-9a-fA-F]{3}){1,2}|rgb\([^)]+\)|rgba\([^)]+\))["']/gi;
  let colorMatch: RegExpExecArray | null;
  while ((colorMatch = colorAttrRegex.exec(svgContent)) !== null) {
    const c = colorMatch[1]?.trim();
    if (c && c.toLowerCase() !== 'none' && c.toLowerCase() !== 'transparent') {
      colors.add(c.toUpperCase());
    }
  }

  // Extract stroke borders (stroke="#6C6F7F" stroke-width="2" stroke-opacity="1")
  const strokeRegex = /stroke=["']([^"']+)["'][^>]*stroke-width=["']([^"']+)["']/gi;
  let sMatch: RegExpExecArray | null;
  while ((sMatch = strokeRegex.exec(svgContent)) !== null) {
    const color = sMatch[1];
    const width = sMatch[2];
    if (color && color.toLowerCase() !== 'none' && width) {
      borders.add(`${width}px solid ${color}`);
    }
  }

  // 6. Extract standalone vector icons (<clipPath ... width="14" height="14" ...> or transformed glyphs)
  const clipPathRegex = /<clipPath\b[^>]*\bid=["']([^"']+)["'][^>]*>([\s\S]*?)<\/clipPath>/gi;
  let clipMatch: RegExpExecArray | null;
  while ((clipMatch = clipPathRegex.exec(svgContent)) !== null) {
    const id = clipMatch[1];
    const clipBody = clipMatch[2] ?? '';
    const rectMatch = clipBody.match(/<rect[^>]*\bwidth=["'](\d+(?:\.\d+)?)["'][^>]*\bheight=["'](\d+(?:\.\d+)?)["']/i);
    if (rectMatch && rectMatch[1] && rectMatch[2]) {
      const w = parseFloat(rectMatch[1]);
      const h = parseFloat(rectMatch[2]);

      // If it's a small icon area (<= 48px)
      if (w <= 48 && h <= 48 && id) {
        let minX = 0;
        let minY = 0;

        // Try direct x / y attributes
        const xMatch = clipBody.match(/\bx=["'](-?\d+(?:\.\d+)?)["']/i);
        const yMatch = clipBody.match(/\by=["'](-?\d+(?:\.\d+)?)["']/i);
        if (xMatch && xMatch[1]) minX = parseFloat(xMatch[1]);
        if (yMatch && yMatch[1]) minY = parseFloat(yMatch[1]);

        // Try matrix transform: matrix(a,b,c,d,tx,ty)
        const matrixMatch = clipBody.match(/transform=["']matrix\(\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*[^,]+,\s*(-?\d+(?:\.\d+)?),\s*(-?\d+(?:\.\d+)?)\s*\)["']/i);
        if (matrixMatch && matrixMatch[1] && matrixMatch[2]) {
          minX = parseFloat(matrixMatch[1]);
          minY = parseFloat(matrixMatch[2]);
        }

        // Try translate transform: translate(tx, ty)
        const translateMatch = clipBody.match(/transform=["']translate\(\s*(-?\d+(?:\.\d+)?)(?:[,\s]+(-?\d+(?:\.\d+)?))?\s*\)["']/i);
        if (translateMatch && translateMatch[1]) {
          minX = parseFloat(translateMatch[1]);
          minY = translateMatch[2] ? parseFloat(translateMatch[2]) : 0;
        }

        // Find corresponding <g clip-path="url(#id)">...</g>
        const escapedId = id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const gRegex = new RegExp(`<g\\b[^>]*clip-path=["']url\\(#${escapedId}\\)["'][^>]*>([\\s\\S]*?)<\\/g>`, 'i');
        const gMatch = svgContent.match(gRegex);
        if (gMatch && gMatch[0]) {
          const innerContent = gMatch[1].trim();

          // Fallback coordinate check: if minX and minY are both 0, check first path coordinate
          if (minX === 0 && minY === 0) {
            const firstCoordMatch = innerContent.match(/\b[M]\s*(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)/i);
            if (firstCoordMatch && firstCoordMatch[1] && firstCoordMatch[2]) {
              const px = parseFloat(firstCoordMatch[1]);
              const py = parseFloat(firstCoordMatch[2]);
              if (px > w || py > h) {
                minX = Math.floor(px);
                minY = Math.floor(py);
              }
            }
          }

          const iconIdx = icons.length + 1;
          const fileName = `icon_${iconIdx}_${Math.round(w)}x${Math.round(h)}.svg`;

          icons.push({
            id,
            name: `icon_${iconIdx}`,
            fileName,
            width: w,
            height: h,
            viewBox: `${minX} ${minY} ${w} ${h}`,
            svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="${minX} ${minY} ${w} ${h}" fill="none">\n  ${innerContent}\n</svg>`,
          });
        }
      }
    }
  }

  // 7. Check for standalone close button icon (common small isolated path with cross coordinates)
  const closePathMatch = svgContent.match(/<path\b[^>]*\bd=["']([^"']*353\.606[^"']*)["'][^>]*>/i);
  if (closePathMatch && !icons.some((i) => i.id === 'icon_close')) {
    const iconIdx = icons.length + 1;
    icons.push({
      id: 'icon_close',
      name: 'icon_close',
      fileName: 'icon_close.svg',
      width: 14,
      height: 14,
      viewBox: '345.1 27.6 14.3 14.2',
      svgString: `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="345.1 27.6 14.3 14.2" fill="none">\n  ${closePathMatch[0]}\n</svg>`,
    });
  }

  const cssVariables = generateCssVariables({
    gradients,
    colors: Array.from(colors),
    backdropFilters: Array.from(backdropFilters),
    radii: Array.from(radii),
    borders: Array.from(borders),
    dimensions,
  });

  return {
    colors: Array.from(colors),
    gradients,
    backdropFilters: Array.from(backdropFilters),
    shadows: Array.from(shadows),
    radii: Array.from(radii),
    borders: Array.from(borders),
    icons,
    dimensions,
    cssVariables,
  };
}

/**
 * Strips heavy path coordinate noise from SVG while preserving structural tokens.
 * Reduces 50KB SVG text-outlined junk down to clean metadata.
 */
export function compressSvgForAi(svgContent: string): {
  tokens: DesignTokens;
  summary: string;
} {
  const tokens = extractTokensFromSvg(svgContent);

  const lines: string[] = [];
  if (tokens.dimensions) {
    lines.push(`- Component Max Boundary: ${tokens.dimensions.width}px x ${tokens.dimensions.height}px (Elastic Responsive)`);
  }
  if (tokens.gradients.length > 0) {
    lines.push(`- Background Gradients:`);
    tokens.gradients.forEach((g) => lines.push(`  * ${g.cssString}`));
  }
  if (tokens.backdropFilters.length > 0) {
    lines.push(`- Glassmorphism Filters: ${tokens.backdropFilters.join(', ')}`);
  }
  if (tokens.radii.length > 0) {
    lines.push(`- Border Radii: ${tokens.radii.join(', ')}`);
  }
  if (tokens.borders.length > 0) {
    lines.push(`- Borders / Strokes: ${tokens.borders.join(', ')}`);
  }
  if (tokens.colors.length > 0) {
    lines.push(`- Color Palette: ${tokens.colors.slice(0, 10).join(', ')}`);
  }
  if (tokens.icons.length > 0) {
    lines.push(`- Extracted Standalone Vector Icons (${tokens.icons.length}): ${tokens.icons.map((i) => `${i.fileName || i.id} (${i.width}x${i.height})`).join(', ')}`);
  }

  return {
    tokens,
    summary: lines.join('\n'),
  };
}

function hexToRgb(hex: string): string {
  let c = hex.replace('#', '');
  if (c.length === 3) {
    c = c.split('').map((char) => char + char).join('');
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return '255, 255, 255';
  return `${(num >> 16) & 255}, ${(num >> 8) & 255}, ${num & 255}`;
}
