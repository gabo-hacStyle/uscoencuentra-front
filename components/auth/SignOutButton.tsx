"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={() => signOut({ redirectTo: "/login" })}
      className="block w-full rounded-xl px-4 py-2.5 text-left text-sm font-medium text-usco-wine transition hover:bg-usco-cream"
    >
      Cerrar sesión
    </button>
  );
}