import type { ReactNode } from "react";
import { ReauthenticateButton } from "@/components/auth/ReauthenticateButton";
import type { ApiResult } from "@/types/admin";
import { AlertTriangleIcon, RefreshIcon } from "./admin-icons";

/** Error and empty-state blocks shared by both sections. */

const SESSION_EXPIRED_MESSAGE = "Tu sesión expiró. Inicia sesión de nuevo para continuar.";

/** The backend answered 401: retrying is useless (there is no refresh), the user must sign in again. */
export function isSessionExpired(result: ApiResult<unknown> | null): boolean {
    return result !== null && !result.ok && result.error.code === "UNAUTHORIZED";
}

type ErrorNoticeProps = {
    title: string;
    message?: string;
    onRetry?: () => void;
    /** Replaces the message and the retry button with a "sign in again" action. */
    sessionExpired?: boolean;
};

export function ErrorNotice({ title, message, onRetry, sessionExpired = false }: ErrorNoticeProps) {
    const shownMessage = sessionExpired ? SESSION_EXPIRED_MESSAGE : message;
    const retry = sessionExpired ? undefined : onRetry;
    return (
        <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="flex items-start gap-3">
                <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-red-600" />
                <div>
                    <p className="font-semibold">{title}</p>
                    {shownMessage ? <p className="mt-0.5 text-sm text-red-800">{shownMessage}</p> : null}
                </div>
            </div>
            {retry ? (
                <button
                    type="button"
                    onClick={retry}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                    <RefreshIcon className="size-4" />
                    Reintentar
                </button>
            ) : null}
            {sessionExpired ? <ReauthenticateButton /> : null}
        </div>
    );
}

type EmptyNoticeProps = {
    message: string;
    action?: ReactNode;
};

export function EmptyNotice({ message, action }: EmptyNoticeProps) {
    return (
        <div className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <p className="max-w-md text-sm text-usco-muted">{message}</p>
            {action}
        </div>
    );
}
