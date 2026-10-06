import type { ReactNode } from "react";

type AlertProps = {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
};

const STYLES = {
  error: "border-red-200 bg-red-50 text-red-800",
  success: "border-green-200 bg-green-50 text-green-800",
};

export function Alert({ variant, children, className = "" }: AlertProps) {
  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm ${STYLES[variant]} ${className}`}
    >
      {children}
    </div>
  );
}