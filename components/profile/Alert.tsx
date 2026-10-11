import type { ReactNode } from "react";

type AlertProps = {
  variant: "error" | "success";
  children: ReactNode;
  className?: string;
};

const STYLES = {
  error: "border-usco-wine/30 bg-usco-wine/10 text-usco-wine",
  success: "border-usco-success/30 bg-usco-success/10 text-usco-success",
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