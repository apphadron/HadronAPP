// constants/index.ts - Constantes da aplicação
import { CoordinateSystem, ExampleExpression } from '../types';

export const COORDINATE_SYSTEMS: Record<CoordinateSystem, { 
  name: string; 
  variables: string[];
  description: string;
}> = {
  cartesian: {
    name: 'Cartesiano',
    variables: ['x', 'y', 'z'],
    description: 'Sistema de coordenadas retangulares (x, y, z)'
  },
  polar: {
    name: 'Polar',
    variables: ['r', 'theta', 'z'],
    description: 'Sistema de coordenadas polares (r, θ, z)'
  },
  spherical: {
    name: 'Esférico',
    variables: ['rho', 'phi', 'theta'],
    description: 'Sistema de coordenadas esféricas (ρ, φ, θ)'
  },
  cylindrical: {
    name: 'Cilíndrico',
    variables: ['r', 'theta', 'z'],
    description: 'Sistema de coordenadas cilíndricas (r, θ, z)'
  }
};

export const EXAMPLE_EXPRESSIONS: Record<string, ExampleExpression> = {
  'Distância ao quadrado': {
    cartesian: 'x^2 + y^2 + z^2',
    polar: 'r^2 + z^2',
    spherical: 'rho^2',
    cylindrical: 'r^2 + z^2'
  },
  'Círculo unitário no plano XY': {
    cartesian: 'x^2 + y^2',
    polar: 'r^2',
    spherical: 'rho^2 * sin(phi)^2',
    cylindrical: 'r^2'
  },
  'Esfera unitária': {
    cartesian: 'x^2 + y^2 + z^2',
    polar: 'r^2 + z^2',
    spherical: 'rho^2',
    cylindrical: 'r^2 + z^2'
  },
  'Plano XY (z = 0)': {
    cartesian: 'z',
    polar: 'z',
    spherical: 'rho * cos(phi)',
    cylindrical: 'z'
  },
  'Identidade trigonométrica': {
    cartesian: '(x/sqrt(x^2 + y^2))^2 + (y/sqrt(x^2 + y^2))^2',
    polar: 'cos(theta)^2 + sin(theta)^2',
    spherical: 'cos(theta)^2 + sin(theta)^2',
    cylindrical: 'cos(theta)^2 + sin(theta)^2'
  },
  'Coordenadas polares expandidas': {
    cartesian: '(r * cos(theta))^2 + (r * sin(theta))^2',
    polar: 'r^2 * (cos(theta)^2 + sin(theta)^2)',
    spherical: 'rho^2 * sin(phi)^2 * (cos(theta)^2 + sin(theta)^2)',
    cylindrical: 'r^2 * (cos(theta)^2 + sin(theta)^2)'
  }
};

export const SIMPLIFICATION_LEVELS = {
  basic: {
    name: 'Básica',
    description: 'Simplificação algébrica padrão'
  },
  advanced: {
    name: 'Avançada',
    description: 'Inclui identidades trigonométricas e simplificações especializadas'
  }
} as const;

export const UI_COLORS = {
  primary: '#3498db',
  primaryDark: '#2980b9',
  secondary: '#2ecc71',
  secondaryDark: '#27ae60',
  warning: '#f39c12',
  warningDark: '#e67e22',
  danger: '#e74c3c',
  dangerDark: '#c0392b',
  background: '#f8f9fa',
  surface: '#ffffff',
  text: '#2c3e50',
  textSecondary: '#7f8c8d',
  border: '#bdc3c7',
  borderLight: '#ecf0f1'
} as const;

