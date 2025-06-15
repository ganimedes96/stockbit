
export type MaskType = (string | RegExp)[];

export type MaskKey =
  | "cpf"
  | "cnpj"
  | "rg"
  | "susCard"
  | "cep"
  | "phoneFixed"
  | "phoneMobile"
  | "date"
  | "time"
  | "creditCard"
  | "carPlateMercosul"
  | "carPlateOld"
  | "voterID"
  | "pisPasep"
  | "legalProcess"
  | "isbn"
  | "currency";


export type MaskObject = {
  [K in MaskKey]: MaskType;
};

export const mask: { [key in MaskKey]: MaskType } = {
   currency: [
    "R",
    "$",
    " ",
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    ",",
    /\d/,
    /\d/,
  ],
  cpf: [
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
  ],
  cnpj: [
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    "/",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
  ],
  rg: [
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    "-",
    /[0-9xX]/,
  ],
  susCard: [
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  cep: [/\d/, /\d/, /\d/, /\d/, /\d/, "-", /\d/, /\d/, /\d/],
  phoneFixed: [
    "(",
    /\d/,
    /\d/,
    ")",
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  phoneMobile: [
    "(",
    /\d/,
    /\d/,
    ")",
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  date: [/\d/, /\d/, "/", /\d/, /\d/, "/", /\d/, /\d/, /\d/, /\d/],
  time: [/[0-2]/, /\d/, ":", /[0-5]/, /\d/],
  creditCard: [
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  carPlateMercosul: [/[A-Z]/, /[A-Z]/, /[A-Z]/, /\d/, /[A-Z]/, /\d/, /\d/],
  carPlateOld: [/[A-Z]/, /[A-Z]/, /[A-Z]/, "-", /\d/, /\d/, /\d/, /\d/],
  voterID: [
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    " ",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  pisPasep: [
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    "-",
    /\d/,
  ],
  legalProcess: [
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    ".",
    /\d/,
    ".",
    /\d/,
    /\d/,
    ".",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
  ],
  isbn: [
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    /\d/,
    "-",
    /\d/,
    /\d/,
    "-",
    /\d/,
  ],
};

export function applyMask(value: string, mask: MaskType): string {
  let maskedValue = "";
  let valueIndex = 0;

  for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
    const maskChar = mask[i];
    const valueChar = value[valueIndex];

    if (typeof maskChar === "string") {
      maskedValue += maskChar;
      if (valueChar === maskChar) {
        valueIndex++;
      }
    } else {
      if (maskChar.test(valueChar)) {
        maskedValue += valueChar;
        valueIndex++;
      } else {
        break;
      }
    }
  }
  return maskedValue;
}

export function removeMask(value: string, type?: MaskType): string {
  if (type === mask.date) {
    return value;
  }
  return value.replace(/[^\d]/g, "");
}
