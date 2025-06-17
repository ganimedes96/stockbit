
import { useState, useEffect } from 'react';

/**
 * Hook customizado para "atrasar" a atualização de um valor.
 * Muito útil para inputs de busca, evitando re-renderizações ou chamadas de API a cada tecla digitada.
 * @param value O valor que você quer "atrasar" (ex: o texto de um input).
 * @param delay O tempo de atraso em milissegundos (ex: 500).
 * @returns O valor após o atraso.
 */
export function useDebounce<T>(value: T, delay: number): T {
  // Estado para armazenar o valor "atrasado"
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    // Configura um timer para atualizar o estado do valor "atrasado"
    // depois que o 'delay' especificado passar.
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // Função de limpeza do useEffect:
    // Isso é crucial. Ela cancela o timer anterior toda vez que o 'value' ou o 'delay' mudam.
    // Assim, o valor só é atualizado quando o usuário para de digitar pelo tempo do 'delay'.
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]); // O efeito só roda novamente se o valor ou o delay mudarem

  return debouncedValue;
}