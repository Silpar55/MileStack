"use client";

import { cn } from "@/lib/utils";

interface FieldErrorProps {
  error?: string;
  className?: string;
}

export function FieldError({ error, className }: FieldErrorProps) {
  if (!error) return null;

  return (
    <p
      className={cn(
        "text-sm text-destructive mt-1 animate-in slide-in-from-top-1 duration-200",
        className
      )}
    >
      {error}
    </p>
  );
}
