import { Check, AlertCircle, Info } from "lucide-react";

interface ValidationBadgeProps {
  isValid: boolean;
  hasWarning?: boolean;
  className?: string;
}

export function ValidationBadge({
  isValid,
  hasWarning,
  className = "",
}: ValidationBadgeProps) {
  if (isValid && !hasWarning) {
    return (
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-green-100 ${className}`}
      >
        <Check className="h-3 w-3 text-green-600" />
      </div>
    );
  }

  if (hasWarning) {
    return (
      <div
        className={`flex h-5 w-5 items-center justify-center rounded-full bg-yellow-100 ${className}`}
      >
        <Info className="h-3 w-3 text-yellow-600" />
      </div>
    );
  }

  return (
    <div
      className={`flex h-5 w-5 items-center justify-center rounded-full bg-red-100 ${className}`}
    >
      <AlertCircle className="h-3 w-3 text-red-600" />
    </div>
  );
}
