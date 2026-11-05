"use client";

import { useEffect, useState } from "react";
import type { HealthState } from "@/types/admin";
import { fetchAdminHealthAction } from "@/actions/admin";
import {
    AlertTriangleIcon,
    CheckCircleIcon,
    HelpCircleIcon,
    SpinnerIcon,
    XCircleIcon,
    type IconProps,
} from "./admin-icons";

/** Re-check interval. The state always comes from the service, never from this component. */
const HEALTH_REFRESH_MS = 60_000;

type IndicatorState = HealthState | "loading" | "unknown";

const INDICATOR_VIEW: Record<
    IndicatorState,
    { message: string; Icon: (props: IconProps) => React.JSX.Element; className: string; iconClassName: string }
> = {
    operational: {
        message: "Todos los servicios operativos",
        Icon: CheckCircleIcon,
        className: "border-emerald-200 bg-emerald-50 text-emerald-900",
        iconClassName: "text-emerald-600",
    },
    degraded: {
        message: "Algunos servicios presentan inconvenientes",
        Icon: AlertTriangleIcon,
        className: "border-amber-200 bg-amber-50 text-amber-900",
        iconClassName: "text-amber-600",
    },
    unavailable: {
        message: "Servicio no disponible",
        Icon: XCircleIcon,
        className: "border-red-200 bg-red-50 text-red-900",
        iconClassName: "text-red-600",
    },
    loading: {
        message: "Consultando estado del sistema…",
        Icon: SpinnerIcon,
        className: "border-usco-line bg-white text-usco-muted",
        iconClassName: "text-usco-muted",
    },
    unknown: {
        message: "Estado no disponible",
        Icon: HelpCircleIcon,
        className: "border-usco-line bg-white text-usco-muted",
        iconClassName: "text-usco-muted",
    },
};

const HEALTH_STATES: ReadonlyArray<string> = ["operational", "degraded", "unavailable"];

function toIndicatorState(value: unknown): IndicatorState {
    return typeof value === "string" && HEALTH_STATES.includes(value) ? (value as HealthState) : "unknown";
}

/**
 * The only "ESTADO DEL SISTEMA" indicator of the panel. Fixed size so it does not jump when the
 * message changes. Color + icon + text: color is never the only signal.
 * `simulated`: the mock source answers, so the label says it and no real check is implied.
 */
export function SystemStatusIndicator({ simulated }: { simulated: boolean }) {
    const [state, setState] = useState<IndicatorState>("loading");

    useEffect(() => {
        let cancelled = false;

        async function load() {
            try {
                const result = await fetchAdminHealthAction();
                if (!cancelled) setState(result.ok ? toIndicatorState(result.data.status) : "unknown");
            } catch {
                if (!cancelled) setState("unknown");
            }
        }

        void load();
        const intervalId = window.setInterval(() => void load(), HEALTH_REFRESH_MS);
        return () => {
            cancelled = true;
            window.clearInterval(intervalId);
        };
    }, []);

    const view = INDICATOR_VIEW[state];

    return (
        <div
            role="status"
            aria-live="polite"
            className={`flex h-[4.75rem] w-full shrink-0 items-center gap-3 rounded-2xl border px-4 transition-colors sm:w-80 ${view.className}`}
        >
            <view.Icon className={`size-6 shrink-0 ${view.iconClassName}`} />
            <div className="min-w-0">
                <p className="text-[0.68rem] font-bold tracking-[0.14em]">
                    ESTADO DEL SISTEMA{simulated ? " · SIMULADO" : ""}
                </p>
                <p className="line-clamp-2 text-sm font-semibold leading-snug">{view.message}</p>
            </div>
        </div>
    );
}
