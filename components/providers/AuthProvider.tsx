"use client";

import type { ReactNode } from "react";
import { SessionProvider } from "next-auth/react";

// No es indispensable para este primer login, pero permite usar useSession()
// en cualquier componente de cliente que hagas después.
export function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}