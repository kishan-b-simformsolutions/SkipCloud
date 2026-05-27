const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function normalizeWhitespace(value: string) {
  return value.trim().replaceAll(/\s+/g, " ");
}

export function normalizeTextInput(value: string, maxLength = 120) {
  return normalizeWhitespace(value).slice(0, maxLength);
}

export function normalizeEmailInput(value: string) {
  return normalizeWhitespace(value).toLowerCase().slice(0, 254);
}

export function isValidEmail(value: string) {
  return emailPattern.test(value);
}

export function validatePasswordStrength(password: string) {
  if (password.length < 10) {
    return "Use at least 10 characters.";
  }

  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    return "Include upper-case, lower-case, and a number.";
  }

  return "";
}

export function sanitizeProvisionedUserProfile<T extends {
  email: string;
  firstName: string;
  lastName: string;
  position: string;
}>(profile: T): T {
  return {
    ...profile,
    email: normalizeEmailInput(profile.email),
    firstName: normalizeTextInput(profile.firstName, 60),
    lastName: normalizeTextInput(profile.lastName, 60),
    position: normalizeTextInput(profile.position, 80),
  };
}