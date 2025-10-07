// Professional validation utilities for forms

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings?: string[];
}

export interface FieldValidation {
  isValid: boolean;
  error?: string;
  warning?: string;
}

// Email validation
export const validateEmail = (email: string): FieldValidation => {
  if (!email) {
    return { isValid: false, error: "Email is required" };
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Please enter a valid email address" };
  }

  // Check for common typos in email domains
  const commonDomains = [
    "gmail.com",
    "yahoo.com",
    "hotmail.com",
    "outlook.com",
    "university.edu",
  ];
  const domain = email.split("@")[1]?.toLowerCase();

  if (domain && !commonDomains.includes(domain)) {
    const similarDomain = commonDomains.find(
      (d) =>
        d.includes(domain.substring(0, 3)) || domain.includes(d.substring(0, 3))
    );
    if (similarDomain) {
      return {
        isValid: true,
        warning: `Did you mean ${email.split("@")[0]}@${similarDomain}?`,
      };
    }
  }

  return { isValid: true };
};

// Password validation with detailed feedback
export const validatePassword = (password: string): FieldValidation => {
  if (!password) {
    return { isValid: false, error: "Password is required" };
  }

  const errors: string[] = [];
  const warnings: string[] = [];

  // Length check
  if (password.length < 8) {
    errors.push("at least 8 characters");
  } else if (password.length < 12) {
    warnings.push("Consider using 12+ characters for better security");
  }

  // Character type checks
  if (!/[A-Z]/.test(password)) {
    errors.push("one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("one lowercase letter");
  }
  if (!/\d/.test(password)) {
    errors.push("one number");
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("one special character");
  }

  // Common password checks
  const commonPasswords = [
    "password",
    "123456",
    "qwerty",
    "abc123",
    "password123",
  ];
  if (
    commonPasswords.some((common) => password.toLowerCase().includes(common))
  ) {
    warnings.push("Avoid common passwords for better security");
  }

  // Sequential characters check
  if (/(.)\1{2,}/.test(password)) {
    warnings.push("Avoid repeating characters");
  }

  if (errors.length > 0) {
    return {
      isValid: false,
      error: `Password must contain ${errors.join(", ")}`,
    };
  }

  if (warnings.length > 0) {
    return {
      isValid: true,
      warning: warnings.join(". "),
    };
  }

  return { isValid: true };
};

// Name validation
export const validateName = (
  name: string,
  fieldName: string = "Name"
): FieldValidation => {
  if (!name) {
    return { isValid: false, error: `${fieldName} is required` };
  }

  if (name.trim().length < 2) {
    return {
      isValid: false,
      error: `${fieldName} must be at least 2 characters`,
    };
  }

  if (name.length > 50) {
    return {
      isValid: false,
      error: `${fieldName} must be less than 50 characters`,
    };
  }

  // Check for valid characters (letters, spaces, hyphens, apostrophes)
  if (!/^[a-zA-Z\s\-']+$/.test(name)) {
    return {
      isValid: false,
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes`,
    };
  }

  // Check for multiple consecutive spaces
  if (/\s{2,}/.test(name)) {
    return {
      isValid: false,
      error: `${fieldName} cannot contain multiple consecutive spaces`,
    };
  }

  return { isValid: true };
};

// Terms and conditions validation
export const validateTerms = (
  termsAccepted: boolean,
  privacyAccepted: boolean
): FieldValidation => {
  if (!termsAccepted) {
    return { isValid: false, error: "You must accept the Terms of Service" };
  }
  if (!privacyAccepted) {
    return { isValid: false, error: "You must accept the Privacy Policy" };
  }
  return { isValid: true };
};

// Complete signup form validation
export interface SignupFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  termsAccepted: boolean;
  privacyPolicyAccepted: boolean;
}

export const validateSignupForm = (data: SignupFormData): ValidationResult => {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(emailValidation.error!);
  } else if (emailValidation.warning) {
    warnings.push(emailValidation.warning);
  }

  // Validate password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.isValid) {
    errors.push(passwordValidation.error!);
  } else if (passwordValidation.warning) {
    warnings.push(passwordValidation.warning);
  }

  // Validate names
  const firstNameValidation = validateName(data.firstName, "First name");
  if (!firstNameValidation.isValid) {
    errors.push(firstNameValidation.error!);
  }

  const lastNameValidation = validateName(data.lastName, "Last name");
  if (!lastNameValidation.isValid) {
    errors.push(lastNameValidation.error!);
  }

  // Validate terms
  const termsValidation = validateTerms(
    data.termsAccepted,
    data.privacyPolicyAccepted
  );
  if (!termsValidation.isValid) {
    errors.push(termsValidation.error!);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings: warnings.length > 0 ? warnings : undefined,
  };
};

// Login form validation
export interface LoginFormData {
  email: string;
  password: string;
}

export const validateLoginForm = (data: LoginFormData): ValidationResult => {
  const errors: string[] = [];

  // Validate email
  const emailValidation = validateEmail(data.email);
  if (!emailValidation.isValid) {
    errors.push(emailValidation.error!);
  }

  // Validate password (basic check for login)
  if (!data.password) {
    errors.push("Password is required");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Real-time validation helpers
export const getPasswordStrength = (
  password: string
): {
  score: number;
  label: string;
  color: string;
} => {
  let score = 0;

  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 1;
  if (password.length >= 16) score += 1;

  if (score <= 2) {
    return { score, label: "Weak", color: "text-red-500" };
  } else if (score <= 4) {
    return { score, label: "Fair", color: "text-yellow-500" };
  } else if (score <= 6) {
    return { score, label: "Good", color: "text-blue-500" };
  } else {
    return { score, label: "Strong", color: "text-green-500" };
  }
};

// Debounce utility for real-time validation
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};
