type IconProps = { className?: string };

const svgProps = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
} as const;

export function IconClose({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M18 6 6 18M6 6l12 12" />
        </svg>
    );
}

export function IconLock({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
        </svg>
    );
}

export function IconPin({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z" />
        <circle cx="12" cy="10" r="2.5" />
        </svg>
    );
}

export function IconHelp({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01" />
        </svg>
    );
}