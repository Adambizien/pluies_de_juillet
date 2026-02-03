/**
 * Valide que le mot de passe respecte les critères de sécurité
 * - Minimum 12 caractères
 * - 1 majuscule (A-Z)
 * - 1 minuscule (a-z)
 * - 1 chiffre (0-9)
 * - 1 caractère spécial (!@#$%^&*()_+-=...)
 */
export const validatePassword = (password: string): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (!password) {
    return {
      isValid: false,
      errors: ["Le mot de passe est requis"],
    };
  }

  if (password.length < 12) {
    errors.push("Minimum 12 caractères requis");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins 1 majuscule (A-Z) requise");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("Au moins 1 minuscule (a-z) requise");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("Au moins 1 chiffre (0-9) requis");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};:'",.<>?\/\\|`~]/.test(password)) {
    errors.push("Au moins 1 caractère spécial (!@#$%^&*()_+-=...) requis");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Retourne un message lisible pour l'utilisateur
 */
export const getPasswordRequirements = (): string => {
  return `Minimum 12 caractères, 1 majuscule, 1 minuscule, 1 chiffre, 1 caractère spécial`;
};
