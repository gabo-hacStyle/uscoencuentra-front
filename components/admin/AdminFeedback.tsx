import type { ReactNode } from "react";
import { AlertTriangleIcon, RefreshIcon } from "./admin-icons";

/** Error and empty-state blocks shared by both sections. */

type ErrorNoticeProps = {
    title: string;
    message?: string;
    onRetry?: () => void;
};

export function ErrorNotice({ title, message, onRetry }: ErrorNoticeProps) {
    return (
        <div
            role="alert"
            className="flex flex-col items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-red-900 sm:flex-row sm:items-center sm:justify-between"
        >
            <div className="flex items-start gap-3">
                <AlertTriangleIcon className="mt-0.5 size-5 shrink-0 text-red-600" />
                <div>
                    <p className="font-semibold">{title}</p>
                    {message ? <p className="mt-0.5 text-sm text-red-800">{message}</p> : null}
                </div>
            </div>
            {onRetry ? (
                <button
                    type="button"
                    onClick={onRetry}
                    className="inline-flex h-10 shrink-0 items-center gap-2 rounded-xl border border-red-200 bg-white px-4 text-sm font-semibold text-red-700 transition-colors hover:bg-red-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400"
                >
                    <RefreshIcon className="size-4" />
                    Reintentar
                </button>
            ) : null}
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
