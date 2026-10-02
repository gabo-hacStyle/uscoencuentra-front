"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="rounded-2xl border border-usco-wine px-5 py-3 text-sm font-semibold text-usco-wine transition hover:bg-usco-sand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine"
    >
      Cerrar sesión
    </button>
  );
}