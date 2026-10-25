"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
    label: string; // accessible name of the dialog (read by screen readers, so in Spanish)
    onClose: () => void;
    children: ReactNode;
    className?: string;
    dismissible?: boolean; // false blocks Esc and backdrop click (e.g. while saving)
}

export default function Modal({
    label,
    onClose,
    children,
    className = "",
    dismissible = true,
}: ModalProps) {
    const ref = useRef<HTMLDialogElement>(null);

    useEffect(() => {
        const dialog = ref.current;
        if (dialog && !dialog.open) dialog.showModal();

        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden"; // locks page scroll while open
        return () => {
        document.body.style.overflow = previousOverflow;
        };
    }, []);

    return (
        <dialog
        ref={ref}
        aria-label={label}
        onCancel={(e) => {
            if (!dismissible) e.preventDefault(); // Esc is ignored while the modal is locked
        }}
        onClose={() => {
            // Some browsers close the dialog on a second Esc even if "cancel" was prevented
            if (!dismissible) {
            ref.current?.showModal();
            return;
            }
            onClose();
        }}
        onClick={(e) => {
            if (dismissible && e.target === ref.current) onClose(); // click on the blurred backdrop
        }}
        className={`m-auto overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm ${className}`}
        >
        {children}
        </dialog>
    );
}