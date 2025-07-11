/**
 * Acessa um valor aninhado em um objeto de forma segura, usando uma string como caminho.
 * Esta versão é "type-safe" e não usa 'any', satisfazendo as regras do ESLint.
 * Exemplo: getNestedValue(obj, 'shippingAddress.street')
 * * @param obj O objeto no qual procurar.
 * @param path O caminho para a propriedade.
 * @returns O valor encontrado ou undefined se o caminho não existir.
 */
export function getNestedValue(obj: object, path: string): unknown {
  // Validação inicial para garantir que estamos começando com um objeto válido.
  if (typeof obj !== 'object' || obj === null) {
    return undefined;
  }

  // Usamos 'reduce' para navegar pelo caminho.
  // O tipo 'unknown' no acumulador (acc) nos força a fazer verificações de segurança.
  return path.split('.').reduce((acc: unknown, part: string) => {
    // Em cada passo, verificamos se o acumulador atual é um objeto válido
    // e se a próxima parte do caminho (part) realmente existe como uma chave nele.
    if (typeof acc === 'object' && acc !== null && part in acc) {
      // Se for seguro, acessamos a próxima propriedade.
      // Usamos 'as' para dizer ao TypeScript que, após nossa verificação,
      // confiamos que 'acc' é um objeto que pode ser indexado por uma string.
      return (acc as Record<string, unknown>)[part];
    }
    // Se em qualquer ponto o caminho for quebrado, retornamos undefined.
    return undefined;
  }, obj);
}
