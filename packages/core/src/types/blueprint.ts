import { DesignTokens } from './tokens.js';

export type RenderTarget = 'DOM' | 'Canvas' | 'SVG';

export type LayoutDirection = 'row' | 'column';
export type Alignment = 'start' | 'center' | 'end' | 'stretch' | 'space-between';
export type SizingMode = 'fixed' | 'hug' | 'fill';

export interface UIElementBlueprint {
  /** Identifier or role name, e.g. "Header", "TabsContainer", "MetricGrid", "Avatar" */
  name: string;
  /** Primary rendering technology recommended for this element */
  renderTarget: RenderTarget;
  /** Layout intent if it is a container */
  layout?: {
    direction: LayoutDirection;
    gap?: string | number;
    padding?: [number, number, number, number] | number;
    justify?: Alignment;
    align?: Alignment;
    columns?: number; // for Grid layout, e.g. 2
  };
  /** Sizing constraints */
  sizing?: {
    width?: SizingMode | string | number;
    height?: SizingMode | string | number;
  };
  /** Associated visual style tokens */
  styles?: {
    background?: string;
    border?: string;
    borderRadius?: string | number;
    backdropFilter?: string;
    boxShadow?: string;
  };
  /** Mutability classification */
  mutability: 'invariant' | 'variable';
  /** If variable, specify component Prop / Slot name */
  slotName?: string;
  /** Default value or placeholder observed in the design */
  defaultValue?: string;
  /** Nested child elements */
  children?: UIElementBlueprint[];
}

export interface UIBlueprint {
  componentName: string;
  description?: string;
  targetFramework?: 'react-tailwind' | 'vue-tailwind' | 'generic';
  tokens: DesignTokens;
  root: UIElementBlueprint;
  rawNotes?: string;
}
