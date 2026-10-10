import { RenderTarget } from '../types/blueprint.js';

export interface RenderDecision {
  target: RenderTarget;
  reason: string;
}

/**
 * Determines whether a component/layer should be implemented via DOM, Canvas, or inline SVG.
 */
export function inferRenderTarget(params: {
  layerName?: string;
  hasText?: boolean;
  isIcon?: boolean;
  isChartOrModel?: boolean;
}): RenderDecision {
  const name = (params.layerName || '').toLowerCase();

  // 1. Check Canvas / WebGL candidates
  if (
    params.isChartOrModel ||
    name.includes('gltf') ||
    name.includes('3d') ||
    name.includes('chart') ||
    name.includes('canvas') ||
    name.includes('radar') ||
    name.includes('linechart')
  ) {
    return {
      target: 'Canvas',
      reason: 'Contains 3D asset, chart, or continuous data visualization that cannot be faithfully rendered with pure HTML/CSS.',
    };
  }

  // 2. Check SVG candidates
  if (
    params.isIcon ||
    name.includes('icon') ||
    name.includes('arrow') ||
    name.includes('vector') ||
    name.includes('polygon') ||
    name.includes('多边形')
  ) {
    return {
      target: 'SVG',
      reason: 'Small standalone geometric vector or icon glyph.',
    };
  }

  // 3. Default to DOM (HTML / Flex / Grid)
  return {
    target: 'DOM',
    reason: 'Standard UI container, text layout, button, or card with elastic responsive requirements.',
  };
}
