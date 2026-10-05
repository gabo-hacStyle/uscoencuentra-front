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

export function IconSearch({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <circle cx="11" cy="11" r="7" />
        <path d="m20 20-3.5-3.5" />
        </svg>
    );
}

export function IconUser({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 21a8 8 0 0 1 16 0" />
        </svg>
    );
}

export function IconMenu({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M4 6h16M4 12h16M4 18h16" />
        </svg>
    );
}

export function IconSparkles({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" />
        <path d="M19 15v4M17 17h4" />
        </svg>
    );
}

export function IconShield({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6l7-3Z" />
        <path d="m9 12 2 2 4-4" />
        </svg>
    );
}

export function IconLaptop({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <rect x="4" y="5" width="16" height="11" rx="2" />
        <path d="M2 20h20" />
        </svg>
    );
}

export function IconDocument({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
        <path d="M14 3v5h5M9 13h6M9 17h6" />
        </svg>
    );
}

export function IconBox({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <rect x="3" y="4" width="18" height="5" rx="1" />
        <path d="M5 9v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V9M10 13h4" />
        </svg>
    );
}

export function IconCube({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Z" />
        <path d="m4 7 8 4 8-4M12 11v10" />
        </svg>
    );
}

export function IconChevronRight({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="m9 6 6 6-6 6" />
        </svg>
    );
}

export function IconPlus({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M12 5v14M5 12h14" />
        </svg>
    );
}

export function IconImage({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <circle cx="9" cy="10" r="1.5" />
        <path d="m21 16-5-5-8 8" />
        </svg>
    );
}

export function IconCamera({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="M4 8h3l2-3h6l2 3h3v11H4V8Z" />
        <circle cx="12" cy="13" r="3.5" />
        </svg>
    );
}

export function IconCheck({ className }: IconProps) {
    return (
        <svg {...svgProps} className={className}>
        <path d="m5 12 5 5 9-10" />
        </svg>
    );
}