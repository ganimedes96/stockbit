export function formatCurrency(value?: number | string): string {
  if (!value) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(Number(value));
}

export function correctionObject(values: Record<string, string | number>) {
  const object: Record<string, string | number> = {};
  Object.entries(values).forEach(([key, value]) => {
    object[key] = isNaN(Number(value)) ? value : Number(value);
  });
  return object;
}

export function separateWords(value: string, quantity: number): string {
  return value.split(" ").slice(0, quantity).join(" ");
}

export function getFirstAndLastName(name?: string) {
  if (!name) return "";
  const names = name.split(" ");
  const firstName = names[0];
  const lastName = names[names.length - 1];
  const concat =
    firstName === lastName ? firstName : `${firstName} ${lastName}`.trim();

  return concat;
}

export const formatUpperFromLowerUpper = (value: string): string => {
  if (!value) return "";
  return value
    .toLowerCase()
    .split(" ")
    .map((palavra) => palavra.charAt(0).toUpperCase() + palavra.slice(1))
    .join(" ");
};

export const getPercentage = (value: number, total: number): string => {
  if (total === 0) return "0%";
  const percentage = (value / total) * 100;
  return `${percentage.toFixed(2)}%`;
};
