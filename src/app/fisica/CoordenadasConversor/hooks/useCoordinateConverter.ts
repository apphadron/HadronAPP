// hooks/useCoordinateConverter.ts - Hook personalizado para lógica de conversão
import { useState, useCallback } from 'react';
import { CoordinateSystem, SimplificationResult } from '../types';
import { convertAndSimplify } from '../utils/mathUtils';

interface UseCoordinateConverterReturn {
  // Estados
  inputExpression: string;
  fromSystem: CoordinateSystem;
  toSystem: CoordinateSystem;
  simplificationLevel: 'basic' | 'advanced';
  result: SimplificationResult | null;
  isLoading: boolean;
  error: string | null;

  // Ações
  setInputExpression: (expression: string) => void;
  setFromSystem: (system: CoordinateSystem) => void;
  setToSystem: (system: CoordinateSystem) => void;
  setSimplificationLevel: (level: 'basic' | 'advanced') => void;
  convertExpression: () => Promise<void>;
  clearAll: () => void;
  clearResults: () => void;
}

export const useCoordinateConverter = (): UseCoordinateConverterReturn => {
  const [inputExpression, setInputExpression] = useState('');
  const [fromSystem, setFromSystem] = useState<CoordinateSystem>('cartesian');
  const [toSystem, setToSystem] = useState<CoordinateSystem>('polar');
  const [simplificationLevel, setSimplificationLevel] = useState<'basic' | 'advanced'>('advanced');
  const [result, setResult] = useState<SimplificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const convertExpression = useCallback(async () => {
    if (!inputExpression.trim()) {
      setError('Por favor, digite uma expressão para converter.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Simula um pequeno delay para mostrar o loading
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const conversionResult = convertAndSimplify(
        inputExpression,
        fromSystem,
        toSystem,
        simplificationLevel
      );

      setResult(conversionResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido na conversão';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsLoading(false);
    }
  }, [inputExpression, fromSystem, toSystem, simplificationLevel]);

  const clearAll = useCallback(() => {
    setInputExpression('');
    setResult(null);
    setError(null);
  }, []);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  // Limpa os resultados quando os sistemas mudam
  const handleFromSystemChange = useCallback((system: CoordinateSystem) => {
    setFromSystem(system);
    clearResults();
  }, [clearResults]);

  const handleToSystemChange = useCallback((system: CoordinateSystem) => {
    setToSystem(system);
    clearResults();
  }, [clearResults]);

  const handleSimplificationLevelChange = useCallback((level: 'basic' | 'advanced') => {
    setSimplificationLevel(level);
    clearResults();
  }, [clearResults]);

  return {
    // Estados
    inputExpression,
    fromSystem,
    toSystem,
    simplificationLevel,
    result,
    isLoading,
    error,

    // Ações
    setInputExpression,
    setFromSystem: handleFromSystemChange,
    setToSystem: handleToSystemChange,
    setSimplificationLevel: handleSimplificationLevelChange,
    convertExpression,
    clearAll,
    clearResults,
  };
};

