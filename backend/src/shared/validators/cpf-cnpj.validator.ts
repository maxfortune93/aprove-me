import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

/**
 * Valida se o documento é um CPF ou CNPJ válido
 * CPF: 11 dígitos (apenas números)
 * CNPJ: 14 dígitos (apenas números)
 */
function isValidCpfCnpj(value: string): boolean {
  if (!value || typeof value !== 'string') {
    return false;
  }

  // Remove caracteres não numéricos
  const cleanValue = value.replace(/\D/g, '');

  // Verifica se tem 11 dígitos (CPF) ou 14 dígitos (CNPJ)
  if (cleanValue.length !== 11 && cleanValue.length !== 14) {
    return false;
  }

  // Valida CPF
  if (cleanValue.length === 11) {
    return isValidCPF(cleanValue);
  }

  // Valida CNPJ
  if (cleanValue.length === 14) {
    return isValidCNPJ(cleanValue);
  }

  return false;
}

/**
 * Valida CPF verificando dígitos verificadores
 */
function isValidCPF(cpf: string): boolean {
  // Verifica se todos os dígitos são iguais (CPF inválido)
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  let sum = 0;
  let remainder: number;

  // Valida primeiro dígito verificador
  for (let i = 1; i <= 9; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(9, 10))) return false;

  sum = 0;
  // Valida segundo dígito verificador
  for (let i = 1; i <= 10; i++) {
    sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.substring(10, 11))) return false;

  return true;
}

/**
 * Valida CNPJ verificando dígitos verificadores
 */
function isValidCNPJ(cnpj: string): boolean {
  // Verifica se todos os dígitos são iguais (CNPJ inválido)
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  let length = cnpj.length - 2;
  let numbers = cnpj.substring(0, length);
  const digits = cnpj.substring(length);
  let sum = 0;
  let pos = length - 7;

  // Valida primeiro dígito verificador
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  length = length + 1;
  numbers = cnpj.substring(0, length);
  sum = 0;
  pos = length - 7;

  // Valida segundo dígito verificador
  for (let i = length; i >= 1; i--) {
    sum += parseInt(numbers.charAt(length - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
}

/**
 * Decorator para validar CPF ou CNPJ
 */
export function IsCpfCnpj(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCpfCnpj',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          return isValidCpfCnpj(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'O campo document deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos) válido';
        },
      },
    });
  };
}
