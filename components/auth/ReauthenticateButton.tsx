"use client";

import { signOut } from "next-auth/react";

/** Destino tras cerrar la sesión vencida: /login muestra el mensaje de "SessionExpired". */
export const SESSION_EXPIRED_LOGIN_PATH = "/login?error=SessionExpired";

type ReauthenticateButtonProps = {
  className?: string;
};

/**
 * Para cuando el backend responde 401 (token vencido o inválido; el contrato no ofrece refresh).
 * Primero cierra la sesión de Auth.js: si solo se redirigiera a /login, esa página enviaría a
 * /home a quien todavía tiene la cookie y el usuario quedaría en un bucle.
 */
export function ReauthenticateButton({ className = "" }: ReauthenticateButtonProps) {
  return (
    <button
      type="button"
      onClick={() => signOut({ redirectTo: SESSION_EXPIRED_LOGIN_PATH })}
      className={`inline-flex h-10 shrink-0 items-center justify-center rounded-xl bg-usco-wine px-4 text-sm font-semibold text-white transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-usco-wine ${className}`}
    >
      Iniciar sesión de nuevo
    </button>
  );
}
