/**
 * Normalizes CSS strings copied from inspect panels (MasterGo, Figma, Lanhu, etc.)
 */
export interface NormalizedCssStyles {
  layout: {
    display?: string;
    flexDirection?: string;
    alignItems?: string;
    justifyContent?: string;
    gap?: string;
    padding?: string;
    margin?: string;
    width?: string;
    height?: string;
  };
  visual: {
    background?: string;
    color?: string;
    borderRadius?: string;
    border?: string;
    boxShadow?: string;
    backdropFilter?: string;
    opacity?: string;
  };
  typography: {
    fontFamily?: string;
    fontSize?: string;
    fontWeight?: string;
    lineHeight?: string;
    letterSpacing?: string;
  };
  raw: Record<string, string>;
}

export function parseCssString(cssContent: string): NormalizedCssStyles {
  const result: NormalizedCssStyles = {
    layout: {},
    visual: {},
    typography: {},
    raw: {},
  };

  if (!cssContent || typeof cssContent !== 'string') {
    return result;
  }

  // Parse lines: "property: value;"
  const rules = cssContent.split(/;|\n/);
  for (const rule of rules) {
    const trimmed = rule.trim();
    if (!trimmed || trimmed.startsWith('/*')) continue;
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx === -1) continue;

    const prop = trimmed.slice(0, colonIdx).trim().toLowerCase();
    const val = trimmed.slice(colonIdx + 1).trim();

    result.raw[prop] = val;

    switch (prop) {
      case 'display':
        result.layout.display = val;
        break;
      case 'flex-direction':
        result.layout.flexDirection = val;
        break;
      case 'align-items':
        result.layout.alignItems = val;
        break;
      case 'justify-content':
        result.layout.justifyContent = val;
        break;
      case 'gap':
        result.layout.gap = val;
        break;
      case 'padding':
        result.layout.padding = val;
        break;
      case 'margin':
        result.layout.margin = val;
        break;
      case 'width':
        result.layout.width = val;
        break;
      case 'height':
        result.layout.height = val;
        break;

      case 'background':
      case 'background-color':
        result.visual.background = val;
        break;
      case 'color':
        result.visual.color = val;
        break;
      case 'border-radius':
        result.visual.borderRadius = val;
        break;
      case 'border':
        result.visual.border = val;
        break;
      case 'box-shadow':
        result.visual.boxShadow = val;
        break;
      case 'backdrop-filter':
      case '-webkit-backdrop-filter':
        result.visual.backdropFilter = val;
        break;
      case 'opacity':
        result.visual.opacity = val;
        break;

      case 'font-family':
        result.typography.fontFamily = val;
        break;
      case 'font-size':
        result.typography.fontSize = val;
        break;
      case 'font-weight':
        result.typography.fontWeight = val;
        break;
      case 'line-height':
        result.typography.lineHeight = val;
        break;
      case 'letter-spacing':
        result.typography.letterSpacing = val;
        break;
    }
  }

  return result;
}
