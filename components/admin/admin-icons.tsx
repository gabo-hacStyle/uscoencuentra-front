import type { SVGProps } from "react";

/**
 * Small stroke icons for the admin panel (no extra dependency).
 * If components/ui already exports equivalent icons, these can be swapped one by one.
 * All icons are decorative by default (aria-hidden); the accessible name comes from the text next to them.
 */

export type IconProps = SVGProps<SVGSVGElement>;

function BaseIcon({ children, className = "size-4", ...props }: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.8}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            focusable="false"
            className={className}
            {...props}
        >
            {children}
        </svg>
    );
}

export function GridIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
            <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
            <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
            <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
        </BaseIcon>
    );
}

export function FileTextIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
            <path d="M14 3v5h5M9 13h6M9 17h6" />
        </BaseIcon>
    );
}

export function CalendarIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <rect x="3.5" y="5" width="17" height="15.5" rx="2" />
            <path d="M3.5 10h17M8 3v4M16 3v4" />
        </BaseIcon>
    );
}

export function MapPinIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M12 21s7-6.1 7-11.5A7 7 0 0 0 5 9.5C5 14.9 12 21 12 21z" />
            <circle cx="12" cy="9.5" r="2.5" />
        </BaseIcon>
    );
}

export function TagIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
            <circle cx="7.5" cy="7.5" r="1.2" />
        </BaseIcon>
    );
}

export function SearchIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="11" cy="11" r="6.5" />
            <path d="m20 20-4.2-4.2" />
        </BaseIcon>
    );
}

export function ChevronDownIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="m6 9 6 6 6-6" />
        </BaseIcon>
    );
}

export function ChevronLeftIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="m15 18-6-6 6-6" />
        </BaseIcon>
    );
}

export function ChevronRightIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="m9 18 6-6-6-6" />
        </BaseIcon>
    );
}

export function EyeIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
            <circle cx="12" cy="12" r="2.8" />
        </BaseIcon>
    );
}

export function TrashIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
        </BaseIcon>
    );
}

export function BarChartIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M4 20h16M7 16v-4M11 16V8M15 16v-6M19 16V5" />
        </BaseIcon>
    );
}

export function CheckCircleIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="m8.2 12.3 2.6 2.6 5-5.4" />
        </BaseIcon>
    );
}

export function AlertTriangleIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M10.3 4.2 2.6 17.5A2 2 0 0 0 4.3 20.5h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0z" />
            <path d="M12 9.5v4M12 17h.01" />
        </BaseIcon>
    );
}

export function XCircleIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="m9 9 6 6M15 9l-6 6" />
        </BaseIcon>
    );
}

export function HelpCircleIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <circle cx="12" cy="12" r="9" />
            <path d="M9.6 9.3a2.5 2.5 0 0 1 4.8.9c0 1.7-2.4 2.2-2.4 3.6M12 17h.01" />
        </BaseIcon>
    );
}

export function HourglassIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M7 3h10M7 21h10M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9" />
        </BaseIcon>
    );
}

export function SpinnerIcon({ className = "size-4", ...props }: IconProps) {
    return (
        <BaseIcon className={`${className} motion-safe:animate-spin`} {...props}>
            <path d="M21 12a9 9 0 1 1-6.2-8.6" />
        </BaseIcon>
    );
}

export function RefreshIcon(props: IconProps) {
    return (
        <BaseIcon {...props}>
            <path d="M20 11a8 8 0 0 0-14.5-4.5L4 8M4 4v4h4M4 13a8 8 0 0 0 14.5 4.5L20 16M20 20v-4h-4" />
        </BaseIcon>
    );
}
