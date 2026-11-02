"use client";

import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import type { FilterOption } from "@/types/admin";
import { normalizeSearchText } from "@/lib/admin-filters";
import { CheckIcon, ChevronDownIcon, type IconProps } from "./admin-icons";

/** Space kept between the list and the viewport edges. */
const VIEWPORT_MARGIN = 12;
/** Space between the trigger and the list. */
const TRIGGER_GAP = 6;
/** Preferred maximum list height (~7 options); it shrinks to the space actually available. */
const MAX_LIST_HEIGHT = 288;
/** Approximate height of one option row, used to decide whether the list fits below. */
const OPTION_HEIGHT_ESTIMATE = 40;
const TYPEAHEAD_RESET_MS = 600;

type ListPosition = {
    left: number;
    width: number;
    maxHeight: number;
    top?: number;
    bottom?: number;
};

function computeListPosition(trigger: HTMLElement, optionCount: number): ListPosition {
    const rect = trigger.getBoundingClientRect();
    // clientWidth excludes the vertical scrollbar.
    const viewportWidth = document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight;

    const width = Math.min(rect.width, viewportWidth - VIEWPORT_MARGIN * 2);
    const left = Math.min(Math.max(rect.left, VIEWPORT_MARGIN), viewportWidth - VIEWPORT_MARGIN - width);

    const spaceBelow = viewportHeight - rect.bottom - TRIGGER_GAP - VIEWPORT_MARGIN;
    const spaceAbove = rect.top - TRIGGER_GAP - VIEWPORT_MARGIN;
    const neededHeight = Math.min(MAX_LIST_HEIGHT, optionCount * OPTION_HEIGHT_ESTIMATE + 8);

    // Below by default; above only when the list does not fit below and there is more room above.
    if (spaceBelow >= neededHeight || spaceBelow >= spaceAbove) {
        return { left, width, top: rect.bottom + TRIGGER_GAP, maxHeight: Math.min(MAX_LIST_HEIGHT, spaceBelow) };
    }
    return {
        left,
        width,
        bottom: viewportHeight - rect.top + TRIGGER_GAP,
        maxHeight: Math.min(MAX_LIST_HEIGHT, spaceAbove),
    };
}

type AdminFilterSelectProps = {
    id: string;
    label: string;
    Icon: (props: IconProps) => React.JSX.Element;
    value: string;
    isActive: boolean;
    options: ReadonlyArray<FilterOption>;
    onChange: (value: string) => void;
    disabled?: boolean;
};

export function AdminFilterSelect({ id, label, Icon, value, isActive, options, onChange, disabled }: AdminFilterSelectProps) {
    const triggerRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);
    const typeaheadRef = useRef({ text: "", timer: 0 });
    /** null = closed. */
    const [position, setPosition] = useState<ListPosition | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const isOpen = position !== null && !disabled;
    // Same as a native <select>: an unknown value shows the first option.
    const selectedIndex = Math.max(
        0,
        options.findIndex((option) => option.value === value),
    );
    const labelId = `${id}-label`;
    const listboxId = `${id}-listbox`;
    const optionId = (index: number) => `${id}-option-${index}`;

    function open(index = selectedIndex) {
        if (disabled || options.length === 0 || !triggerRef.current) return;
        setActiveIndex(index);
        setPosition(computeListPosition(triggerRef.current, options.length));
    }

    function close() {
        setPosition(null);
    }

    function select(index: number) {
        const option = options[index];
        close();
        // A native <select> does not fire onChange when the same option is chosen again.
        if (option && option.value !== value) onChange(option.value);
    }

    /** Index of the next option whose label starts with what the user typed, or -1. */
    function findByTypeahead(key: string, fromIndex: number): number {
        const state = typeaheadRef.current;
        window.clearTimeout(state.timer);
        state.text += normalizeSearchText(key);
        state.timer = window.setTimeout(() => {
            state.text = "";
        }, TYPEAHEAD_RESET_MS);

        // Repeating the same letter cycles through the options that start with it.
        const isCycling = [...state.text].every((char) => char === state.text[0]);
        const query = isCycling ? state.text[0] : state.text;
        const start = isCycling ? fromIndex + 1 : fromIndex;
        for (let offset = 0; offset < options.length; offset++) {
            const index = (start + offset) % options.length;
            if (normalizeSearchText(options[index].label).startsWith(query)) return index;
        }
        return -1;
    }

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (disabled || options.length === 0) return;
        const lastIndex = options.length - 1;

        if (!isOpen) {
            switch (event.key) {
                case "ArrowDown":
                case "ArrowUp":
                case "Enter":
                case " ":
                    event.preventDefault();
                    open();
                    return;
                case "Home":
                    event.preventDefault();
                    open(0);
                    return;
                case "End":
                    event.preventDefault();
                    open(lastIndex);
                    return;
            }
        } else {
            switch (event.key) {
                case "ArrowDown":
                    event.preventDefault();
                    setActiveIndex(Math.min(activeIndex + 1, lastIndex));
                    return;
                case "ArrowUp":
                    event.preventDefault();
                    if (event.altKey) select(activeIndex);
                    else setActiveIndex(Math.max(activeIndex - 1, 0));
                    return;
                case "Home":
                    event.preventDefault();
                    setActiveIndex(0);
                    return;
                case "End":
                    event.preventDefault();
                    setActiveIndex(lastIndex);
                    return;
                case "Enter":
                case " ":
                    event.preventDefault();
                    select(activeIndex);
                    return;
                case "Escape":
                    event.preventDefault();
                    close();
                    return;
                case "Tab":
                    close();
                    return;
            }
        }

        if (event.key.length === 1 && !event.ctrlKey && !event.metaKey && !event.altKey) {
            const match = findByTypeahead(event.key, isOpen ? activeIndex : selectedIndex);
            if (match === -1) return;
            event.preventDefault();
            if (isOpen) setActiveIndex(match);
            else open(match);
        }
    }

    // While open: close on outside press, on page scroll (the list is fixed) and on resize.
    useEffect(() => {
        if (!isOpen) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!triggerRef.current?.contains(target) && !listRef.current?.contains(target)) setPosition(null);
        };
        const handleScroll = (event: Event) => {
            if (event.target !== listRef.current) setPosition(null);
        };
        const handleResize = () => setPosition(null);

        document.addEventListener("pointerdown", handlePointerDown);
        window.addEventListener("scroll", handleScroll, true);
        window.addEventListener("resize", handleResize);
        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            window.removeEventListener("scroll", handleScroll, true);
            window.removeEventListener("resize", handleResize);
        };
    }, [isOpen]);

    // Keep the active option visible inside the scrollable list.
    useEffect(() => {
        if (!isOpen) return;
        const list = listRef.current;
        const option = list?.children[activeIndex] as HTMLElement | undefined;
        if (!list || !option) return;
        if (option.offsetTop < list.scrollTop) {
            list.scrollTop = option.offsetTop;
        } else if (option.offsetTop + option.offsetHeight > list.scrollTop + list.clientHeight) {
            list.scrollTop = option.offsetTop + option.offsetHeight - list.clientHeight;
        }
    }, [isOpen, activeIndex]);

    return (
        <div className="relative min-w-0">
            <span id={labelId} className="sr-only">
                {label}
            </span>
            <Icon className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-usco-wine" />
            <div
                ref={triggerRef}
                id={id}
                role="combobox"
                tabIndex={disabled ? -1 : 0}
                aria-labelledby={labelId}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-controls={isOpen ? listboxId : undefined}
                aria-activedescendant={isOpen ? optionId(activeIndex) : undefined}
                aria-disabled={disabled || undefined}
                onClick={() => (isOpen ? close() : open())}
                onKeyDown={handleKeyDown}
                onBlur={close}
                className={`flex h-11 w-full cursor-pointer select-none items-center rounded-full border bg-white pl-10 pr-10 text-sm font-medium text-usco-ink shadow-sm transition-colors hover:border-usco-wine/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-usco-wine/40 aria-disabled:cursor-not-allowed aria-disabled:opacity-60 ${
                    isActive ? "border-usco-wine/50 bg-usco-wine/5" : "border-usco-line"
                }`}
            >
                <span className="truncate">{options[selectedIndex]?.label}</span>
            </div>
            <ChevronDownIcon
                className={`pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-usco-muted transition-transform ${
                    isOpen ? "rotate-180" : ""
                }`}
            />

            {isOpen && position ? (
                <ul
                    ref={listRef}
                    id={listboxId}
                    role="listbox"
                    aria-labelledby={labelId}
                    // Keeps focus on the trigger while pressing an option or the scrollbar.
                    onMouseDown={(event) => event.preventDefault()}
                    style={position}
                    className="fixed z-50 overflow-y-auto overscroll-contain rounded-2xl border border-usco-line bg-white p-1 text-sm shadow-xl"
                >
                    {options.map((option, index) => {
                        const isSelected = option.value === value;
                        return (
                            <li
                                key={option.value}
                                id={optionId(index)}
                                role="option"
                                aria-selected={isSelected}
                                onClick={() => select(index)}
                                onMouseMove={() => {
                                    if (index !== activeIndex) setActiveIndex(index);
                                }}
                                className={`flex cursor-pointer items-start gap-2 rounded-xl px-3 py-2 ${
                                    index === activeIndex ? "bg-usco-cream" : ""
                                } ${isSelected ? "font-semibold text-usco-wine" : "font-medium text-usco-ink"}`}
                            >
                                <span className="min-w-0 flex-1 wrap-break-word">{option.label}</span>
                                {isSelected ? <CheckIcon className="mt-0.5 size-4 shrink-0" /> : null}
                            </li>
                        );
                    })}
                </ul>
            ) : null}
        </div>
    );
}
