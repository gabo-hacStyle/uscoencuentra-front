"use client";

import Modal from "@/components/ui/BaseModal";
import { IconClose } from "@/components/ui/icons";

interface ReportItemModalProps {
    onClose: () => void;
}

// PLACEHOLDER: replace the body with the real report form when it is built.
export default function ReportItemModal({ onClose }: ReportItemModalProps) {
    return (
        <Modal label="Reportar un objeto" onClose={onClose} className="w-[min(32rem,92vw)]">
        <div className="relative p-6 md:p-8">
            <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="absolute right-5 top-5 grid h-8 w-8 place-items-center rounded-full text-usco-ink transition hover:bg-usco-cream"
            >
            <IconClose className="h-4 w-4" />
            </button>

            <h2 className="pr-8 text-2xl font-bold text-usco-ink">Reportar un objeto</h2>
            <p className="mt-2 text-usco-muted">El formulario de reporte estará disponible pronto.</p>
        </div>
        </Modal>
    );
}