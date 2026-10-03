"use client";

import { useEffect, useRef, type ReactNode } from "react";

interface ModalProps {
    label: string; // accessible name of the dialog (read by screen readers, so in Spanish)
    onClose: () => void;
    children: ReactNode;
    className?: string;
}

export default function Modal({ label, onClose, children, className = "" }: ModalProps) {
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
        onClose={onClose} // fired when the user presses Esc
        onClick={(e) => {
            if (e.target === ref.current) onClose(); // click on the blurred backdrop
        }}
        className={`m-auto overflow-hidden rounded-3xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm ${className}`}
        >
        {children}
        </dialog>
    );
}