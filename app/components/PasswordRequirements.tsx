import { Check, X } from "lucide-react";

interface PasswordRequirement {
  id: string;
  text: string;
  test: (password: string) => boolean;
}

interface PasswordRequirementsProps {
  password: string;
  showAll?: boolean;
}

const requirements: PasswordRequirement[] = [
  {
    id: "length",
    text: "At least 8 characters",
    test: (password) => password.length >= 8,
  },
  {
    id: "length-strong",
    text: "At least 12 characters (recommended)",
    test: (password) => password.length >= 12,
  },
  {
    id: "uppercase",
    text: "One uppercase letter",
    test: (password) => /[A-Z]/.test(password),
  },
  {
    id: "lowercase",
    text: "One lowercase letter",
    test: (password) => /[a-z]/.test(password),
  },
  {
    id: "number",
    text: "One number",
    test: (password) => /\d/.test(password),
  },
  {
    id: "special",
    text: "One special character",
    test: (password) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
  },
  {
    id: "no-common",
    text: "Not a common password",
    test: (password) => {
      const commonPasswords = [
        "password",
        "123456",
        "qwerty",
        "abc123",
        "password123",
      ];
      return !commonPasswords.some((common) =>
        password.toLowerCase().includes(common)
      );
    },
  },
  {
    id: "no-repeating",
    text: "No repeating characters",
    test: (password) => !/(.)\1{2,}/.test(password),
  },
];

export function PasswordRequirements({
  password,
  showAll = false,
}: PasswordRequirementsProps) {
  const visibleRequirements = showAll
    ? requirements
    : requirements.filter(
        (req) =>
          req.id !== "length-strong" &&
          req.id !== "no-common" &&
          req.id !== "no-repeating"
      );

  return (
    <div className="mt-3 space-y-2">
      <p className="text-sm font-medium text-muted-foreground">
        Password requirements:
      </p>
      <div className="space-y-1.5">
        {visibleRequirements.map((requirement) => {
          const isValid = requirement.test(password);
          return (
            <div
              key={requirement.id}
              className={`flex items-center space-x-2 text-sm transition-colors ${
                isValid ? "text-green-600" : "text-muted-foreground"
              }`}
            >
              <div
                className={`flex h-4 w-4 items-center justify-center rounded-full border ${
                  isValid
                    ? "border-green-600 bg-green-600"
                    : "border-muted-foreground"
                }`}
              >
                {isValid ? (
                  <Check className="h-2.5 w-2.5 text-white" />
                ) : (
                  <X className="h-2.5 w-2.5 text-muted-foreground" />
                )}
              </div>
              <span className={isValid ? "font-medium" : ""}>
                {requirement.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
