/**
 * Extracted and cleaned Design Tokens.
 */
export interface GradientStop {
  offset: string;
  color: string;
  opacity?: number;
}

export interface LinearGradientToken {
  id: string;
  angle?: number;
  stops: GradientStop[];
  cssString: string;
}

export interface ExtractedIcon {
  id: string;
  name?: string;
  fileName?: string;
  filePath?: string;
  width: number;
  height: number;
  viewBox: string;
  svgString: string;
}

export interface DesignTokens {
  /** Cleaned unique solid colors found in design */
  colors: string[];
  /** Gradients extracted from <defs> */
  gradients: LinearGradientToken[];
  /** Backdrop filter blur values (e.g. ['blur(5px)']) */
  backdropFilters: string[];
  /** Regular filter shadows or dropshadows */
  shadows: string[];
  /** Outer and inner border radii (e.g. ['20px', '12px']) */
  radii: string[];
  /** Borders / strokes (e.g. ['2px solid #6C6F7F']) */
  borders: string[];
  /** Standalone icons isolated from the design (typically <= 48px) */
  icons: ExtractedIcon[];
  /** Canvas dimensions */
  dimensions?: {
    width: number;
    height: number;
  };
  /** Ready-to-use CSS Variables declaration block */
  cssVariables?: string;
}
