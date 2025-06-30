// types.ts - Definições de tipos globais
export type CoordinateSystem = 'cartesian' | 'polar' | 'spherical' | 'cylindrical';

export interface ConversionRule {
  [variable: string]: string;
}

export interface ConversionRules {
  [fromSystem: string]: {
    [toSystem: string]: ConversionRule;
  };
}

export interface ExampleExpression {
  cartesian: string;
  polar: string;
  spherical: string;
  cylindrical: string;
}

export interface SimplificationResult {
  original: string;
  converted: string;
  simplified: string;
  steps?: string[];
}

export interface MathSimplificationRule {
  pattern: RegExp;
  replacement: string | ((match: string, ...args: string[]) => string);
  description: string;
  priority: number;
}

