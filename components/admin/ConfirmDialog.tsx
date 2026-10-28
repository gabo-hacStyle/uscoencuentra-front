"use client";

import { useEffect, useId, useRef } from "react";
import { SpinnerIcon } from "./admin-icons";

/**
 * Accessible confirmation dialog built on the native <dialog> element (focus trap, Esc,
 * top layer and inert background come from the browser). It is NOT a copy of the report
 * detail modal; it only asks for confirmation. If components/ui/BaseModal.tsx supports a
 * small confirmation layout, this component can delegate to it instead.
 */

type ConfirmDialogProps = {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    pendingLabel: string;
    cancelLabel?: string;
    isPending: boolean;
    errorMessage: string | null;
    onConfirm: () => void;
    onCancel: () => void;
};

export function ConfirmDialog({
    open,
    title,
    description,
    confirmLabel,
    pendingLabel,
    cancelLabel = "Cancelar",
    isPending,
    errorMessage,
    onConfirm,
    onCancel,
}: ConfirmDialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const titleId = useId();
    const descriptionId = useId();

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) dialog.showModal();
        if (!open && dialog.open) dialog.close();
    }, [open]);

    return (
        <dialog
            ref={dialogRef}
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            onCancel={(event) => {
                // Esc key
                event.preventDefault();
                if (!isPending) onCancel();
            }}
            onClick={(event) => {
                // Click on the backdrop (outside the content box)
                if (event.target === event.currentTarget && !isPending) onCancel();
            }}
            className="m-auto w-[min(28rem,calc(100%-2rem))] rounded-3xl border border-usco-line bg-white p-0 text-usco-ink shadow-xl backdrop:bg-usco-ink/40"
        >
            {open ? (
                <div className="p-6">
                    <h2 id={titleId} className="text-lg font-bold">
                        {title}
                    </h2>
                    <p id={descriptionId} className="mt-2 text-sm text-usco-muted [overflow-wrap:anywhere]">
                        {description}
                    </p>

                    {errorMessage ? (
                        <p role="alert" className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm font-medium text-red-800">
                            {errorMessage}
                        </p>
                    ) : null}

                    <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            autoFocus
                            onClick={onCancel}
                            disabled={isPending}
                            className="h-11 rounded-xl border border-usco-line px-4 text-sm font-semibold text-usco-ink transition-colors hover:bg-usco-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 disabled:opacity-60"
                        >
                            {cancelLabel}
                        </button>
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={isPending}
                            aria-busy={isPending}
                            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-red-700 px-4 text-sm font-semibold text-white transition-colors hover:bg-red-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 disabled:opacity-70"
                        >
                            {isPending ? <SpinnerIcon className="size-4" /> : null}
                            {isPending ? pendingLabel : confirmLabel}
                        </button>
                    </div>
                </div>
            ) : null}
        </dialog>
    );
}
