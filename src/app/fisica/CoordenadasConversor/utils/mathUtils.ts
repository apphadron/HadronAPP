// utils/mathUtils.ts - Funções de conversão e simplificação matemática
import { create, all } from 'mathjs';
import { 
  CoordinateSystem, 
  ConversionRules, 
  SimplificationResult, 
  MathSimplificationRule 
} from '../types';

// Criando instância do mathjs com todas as funções
const math = create(all);

// Regras de conversão entre sistemas de coordenadas
export const conversionRules: ConversionRules = {
  cartesian: {
    polar: {
      x: 'r * cos(theta)',
      y: 'r * sin(theta)',
      z: 'z'
    },
    spherical: {
      x: 'rho * sin(phi) * cos(theta)',
      y: 'rho * sin(phi) * sin(theta)',
      z: 'rho * cos(phi)'
    },
    cylindrical: {
      x: 'r * cos(theta)',
      y: 'r * sin(theta)',
      z: 'z'
    }
  },
  polar: {
    cartesian: {
      r: 'sqrt(x^2 + y^2)',
      theta: 'atan2(y, x)',
      z: 'z'
    },
    spherical: {
      r: 'rho * sin(phi)',
      theta: 'theta',
      z: 'rho * cos(phi)'
    },
    cylindrical: {
      r: 'r',
      theta: 'theta',
      z: 'z'
    }
  },
  spherical: {
    cartesian: {
      rho: 'sqrt(x^2 + y^2 + z^2)',
      phi: 'acos(z / sqrt(x^2 + y^2 + z^2))',
      theta: 'atan2(y, x)'
    },
    polar: {
      rho: 'sqrt(r^2 + z^2)',
      phi: 'atan2(r, z)',
      theta: 'theta'
    },
    cylindrical: {
      rho: 'sqrt(r^2 + z^2)',
      phi: 'atan2(r, z)',
      theta: 'theta'
    }
  },
  cylindrical: {
    cartesian: {
      r: 'sqrt(x^2 + y^2)',
      theta: 'atan2(y, x)',
      z: 'z'
    },
    polar: {
      r: 'r',
      theta: 'theta',
      z: 'z'
    },
    spherical: {
      r: 'rho * sin(phi)',
      theta: 'theta',
      z: 'rho * cos(phi)'
    }
  }
};

// Variáveis utilizadas em cada sistema
export const systemVariables: Record<CoordinateSystem, string[]> = {
  cartesian: ['x', 'y', 'z'],
  polar: ['r', 'theta', 'z'],
  spherical: ['rho', 'phi', 'theta'],
  cylindrical: ['r', 'theta', 'z']
};

// Regras de simplificação matemática organizadas por prioridade
const simplificationRules: MathSimplificationRule[] = [
  // Prioridade 1: Identidades trigonométricas fundamentais
  {
    pattern: /sin\(([^)]+)\)\s*\^\s*2\s*\+\s*cos\(([^)]+)\)\s*\^\s*2/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? '1' : match,
    description: 'sin²(x) + cos²(x) = 1',
    priority: 1
  },
  {
    pattern: /cos\(([^)]+)\)\s*\^\s*2\s*\+\s*sin\(([^)]+)\)\s*\^\s*2/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? '1' : match,
    description: 'cos²(x) + sin²(x) = 1',
    priority: 1
  },
  {
    pattern: /\(sin\(([^)]+)\)\)\s*\^\s*2\s*\+\s*\(cos\(([^)]+)\)\)\s*\^\s*2/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? '1' : match,
    description: '(sin(x))² + (cos(x))² = 1',
    priority: 1
  },
  {
    pattern: /\(cos\(([^)]+)\)\)\s*\^\s*2\s*\+\s*\(sin\(([^)]+)\)\)\s*\^\s*2/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? '1' : match,
    description: '(cos(x))² + (sin(x))² = 1',
    priority: 1
  },

  // Prioridade 2: Simplificações de coordenadas polares/cilíndricas
  {
    pattern: /\(r\s*\*\s*cos\(theta\)\)\s*\^\s*2\s*\+\s*\(r\s*\*\s*sin\(theta\)\)\s*\^\s*2/g,
    replacement: 'r^2',
    description: '(r*cos(θ))² + (r*sin(θ))² = r²',
    priority: 2
  },
  {
    pattern: /r\s*\^\s*2\s*\*\s*\(cos\(theta\)\s*\^\s*2\s*\+\s*sin\(theta\)\s*\^\s*2\)/g,
    replacement: 'r^2',
    description: 'r² * (cos²(θ) + sin²(θ)) = r²',
    priority: 2
  },
  {
    pattern: /r\s*\^\s*2\s*\*\s*\(\(cos\(theta\)\)\s*\^\s*2\s*\+\s*\(sin\(theta\)\)\s*\^\s*2\)/g,
    replacement: 'r^2',
    description: 'r² * ((cos(θ))² + (sin(θ))²) = r²',
    priority: 2
  },

  // Prioridade 3: Simplificações de coordenadas esféricas
  {
    pattern: /rho\s*\*\s*sin\(phi\)/g,
    replacement: 'r',
    description: 'ρ * sin(φ) = r (coordenada cilíndrica)',
    priority: 3
  },
  {
    pattern: /rho\s*\*\s*cos\(phi\)/g,
    replacement: 'z',
    description: 'ρ * cos(φ) = z',
    priority: 3
  },

  // Prioridade 4: Simplificações com raízes quadradas
  {
    pattern: /sqrt\(([^)]+)\s*\^\s*2\)/g,
    replacement: 'abs($1)',
    description: '√(x²) = |x|',
    priority: 4
  },
  {
    pattern: /sqrt\(x\s*\^\s*2\s*\+\s*y\s*\^\s*2\)/g,
    replacement: 'r',
    description: '√(x² + y²) = r',
    priority: 4
  },
  {
    pattern: /sqrt\(x\s*\^\s*2\s*\+\s*y\s*\^\s*2\s*\+\s*z\s*\^\s*2\)/g,
    replacement: 'rho',
    description: '√(x² + y² + z²) = ρ',
    priority: 4
  },

  // Prioridade 5: Identidades de ângulo duplo
  {
    pattern: /2\s*\*\s*sin\(([^)]+)\)\s*\*\s*cos\(([^)]+)\)/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? `sin(2 * ${arg1})` : match,
    description: '2 * sin(x) * cos(x) = sin(2x)',
    priority: 5
  },
  {
    pattern: /sin\(([^)]+)\)\s*\*\s*2\s*\*\s*cos\(([^)]+)\)/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? `sin(2 * ${arg1})` : match,
    description: 'sin(x) * 2 * cos(x) = sin(2x)',
    priority: 5
  },

  // Prioridade 6: Tangente e cotangente
  {
    pattern: /sin\(([^)]+)\)\s*\/\s*cos\(([^)]+)\)/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? `tan(${arg1})` : match,
    description: 'sin(x) / cos(x) = tan(x)',
    priority: 6
  },
  {
    pattern: /cos\(([^)]+)\)\s*\/\s*sin\(([^)]+)\)/g,
    replacement: (match: string, arg1: string, arg2: string) => 
      arg1.trim() === arg2.trim() ? `cot(${arg1})` : match,
    description: 'cos(x) / sin(x) = cot(x)',
    priority: 6
  },

  // Prioridade 7: Simplificações algébricas básicas
  {
    pattern: /\b1\s*\*\s*([^*+\-\/\s]+)/g,
    replacement: '$1',
    description: '1 * x = x',
    priority: 7
  },
  {
    pattern: /([^*+\-\/\s]+)\s*\*\s*1\b/g,
    replacement: '$1',
    description: 'x * 1 = x',
    priority: 7
  },
  {
    pattern: /\b0\s*\+\s*([^+\-\s]+)/g,
    replacement: '$1',
    description: '0 + x = x',
    priority: 7
  },
  {
    pattern: /([^+\-\s]+)\s*\+\s*0\b/g,
    replacement: '$1',
    description: 'x + 0 = x',
    priority: 7
  }
];

/**
 * Aplica as regras de simplificação personalizadas
 */
function applyCustomSimplificationRules(expression: string): string {
  let result = expression;
  
  // Ordena as regras por prioridade (menor número = maior prioridade)
  const sortedRules = simplificationRules.sort((a, b) => a.priority - b.priority);
  
  for (const rule of sortedRules) {
    if (typeof rule.replacement === 'string') {
      result = result.replace(rule.pattern, rule.replacement);
    } else {
      result = result.replace(rule.pattern, (match: string, ...args: string[]) => {
        if (typeof rule.replacement === 'function') {
          return rule.replacement(match, ...args);
        }
        return match;
      });
    }
  }
  return result;
}

/**
 * Converte uma expressão de um sistema de coordenadas para outro
 */
export function convertExpression(
  expression: string,
  fromSystem: CoordinateSystem,
  toSystem: CoordinateSystem
): string {
  if (fromSystem === toSystem) {
    return expression;
  }

  const rules = conversionRules[fromSystem]?.[toSystem];
  if (!rules) {
    throw new Error(`Conversão de ${fromSystem} para ${toSystem} não suportada`);
  }

  const sourceVars = systemVariables[fromSystem];
  let result = expression;

  // Aplica as substituições de variáveis
  for (const variable of sourceVars) {
    if (result.includes(variable) && rules[variable]) {
      const regex = new RegExp(`\\b${variable}\\b`, 'g');
      result = result.replace(regex, `(${rules[variable]})`);
    }
  }

  return result;
}

/**
 * Simplifica uma expressão matemática com diferentes níveis de complexidade
 */
export function simplifyExpression(
  expression: string,
  level: 'basic' | 'advanced' = 'advanced'
): SimplificationResult {
  const steps: string[] = [];
  let current = expression;
  
  try {
    // Passo 1: Simplificação básica com mathjs
    steps.push('Simplificação básica');
    let basicSimplified = math.simplify(current).toString();
    current = basicSimplified;
    
    if (level === 'advanced') {
      // Passo 2: Aplicar regras personalizadas
      steps.push('Aplicação de regras trigonométricas e algébricas');
      let customSimplified = applyCustomSimplificationRules(current);
      
      // Passo 3: Simplificação final com mathjs
      if (customSimplified !== current) {
        steps.push('Simplificação final');
        try {
          customSimplified = math.simplify(customSimplified).toString();
        } catch (e) {
          // Se falhar, mantém a versão das regras customizadas
        }
      }
      
      current = customSimplified;
    }
    
    return {
      original: expression,
      converted: expression,
      simplified: current,
      steps: steps
    };
    
  } catch (error) {
    // Em caso de erro, retorna a expressão original
    return {
      original: expression,
      converted: expression,
      simplified: expression,
      steps: ['Erro na simplificação - expressão mantida como original']
    };
  }
}

/**
 * Realiza conversão completa com simplificação
 */
export function convertAndSimplify(
  expression: string,
  fromSystem: CoordinateSystem,
  toSystem: CoordinateSystem,
  simplificationLevel: 'basic' | 'advanced' = 'advanced'
): SimplificationResult {
  try {
    // Passo 1: Conversão
    const converted = convertExpression(expression, fromSystem, toSystem);
    
    // Passo 2: Simplificação
    const simplified = simplifyExpression(converted, simplificationLevel);
    
    return {
      original: expression,
      converted: converted,
      simplified: simplified.simplified,
      steps: [
        `Conversão de ${fromSystem} para ${toSystem}`,
        ...(simplified.steps || [])
      ]
    };
    
  } catch (error) {
    throw new Error(`Erro na conversão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
  }
}

/**
 * Valida se uma expressão é válida matematicamente
 */
export function validateExpression(expression: string): { isValid: boolean; error?: string } {
  try {
    math.parse(expression);
    return { isValid: true };
  } catch (error) {
    return { 
      isValid: false, 
      error: error instanceof Error ? error.message : 'Expressão inválida' 
    };
  }
}

