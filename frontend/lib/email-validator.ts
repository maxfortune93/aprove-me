/**
 * Valida se o email tem um formato válido e rigoroso
 * - Não pode ter espaços
 * - Deve ter formato válido (local@domain)
 * - Domínio deve ter pelo menos um ponto
 * - TLD deve ter pelo menos 2 caracteres
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false;
  }

  // Remove espaços em branco no início e fim
  const trimmedEmail = email.trim();

  // Verifica se tem espaços no meio
  if (trimmedEmail.includes(' ')) {
    return false;
  }

  // Regex mais rigoroso para email
  // Formato: local@domain.tld
  // - local: pode conter letras, números, pontos, hífens, underscores
  // - domain: deve ter pelo menos um ponto e TLD com pelo menos 2 caracteres
  const emailRegex =
    /^[a-zA-Z0-9]([a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}$/;

  if (!emailRegex.test(trimmedEmail)) {
    return false;
  }

  // Validações adicionais
  const [localPart, domainPart] = trimmedEmail.split('@');

  // Local part não pode começar ou terminar com ponto ou hífen
  if (
    localPart.startsWith('.') ||
    localPart.endsWith('.') ||
    localPart.startsWith('-') ||
    localPart.endsWith('-')
  ) {
    return false;
  }

  // Local part não pode ter pontos consecutivos
  if (localPart.includes('..')) {
    return false;
  }

  // Domain part deve ter pelo menos um ponto
  if (!domainPart.includes('.')) {
    return false;
  }

  // Domain part não pode começar ou terminar com ponto ou hífen
  if (
    domainPart.startsWith('.') ||
    domainPart.endsWith('.') ||
    domainPart.startsWith('-') ||
    domainPart.endsWith('-')
  ) {
    return false;
  }

  // Domain part não pode ter pontos consecutivos
  if (domainPart.includes('..')) {
    return false;
  }

  // TLD deve ter pelo menos 2 caracteres
  const tld = domainPart.split('.').pop();
  if (!tld || tld.length < 2) {
    return false;
  }

  // TLD deve conter apenas letras
  if (!/^[a-zA-Z]+$/.test(tld)) {
    return false;
  }

  return true;
}
