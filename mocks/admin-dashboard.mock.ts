import type { HealthServiceCheck, HealthState } from "@/types/admin";
import type { ItemCategory, ItemType } from "@/types/item";
import type { ItemLocation } from "@/lib/item-locations";

/**
 * FICTITIOUS record-level data for the admin Summary (mock phase only).
 *
 * The mock source of services/admin-mock-source.ts aggregates these records with the same rules
 * the backend must follow (docs/admin-api-contract.md), so every filter combination gets a
 * coherent answer. There are no pre-computed scenarios and no stored percentages.
 *
 * Kept apart from mocks/items.mock.ts on purpose: these records only carry the fields the
 * analytics need. They are generated with a fixed seed (same data on every server start) and
 * dates relative to the server start, so "Hoy" or "Este mes" always have something to show.
 */

export type MockAnalyticsReport = {
    id: string;
    type: ItemType;
    category: ItemCategory;
    location: ItemLocation;
    /** ISO 8601 instant. The period filters apply to this field. */
    publishedAt: string;
};

/**
 * A reunion confirmed by the backend (an explicit, confirmed delivery), NOT a report status.
 * It is anchored to its lost report: period, place and category come from that report.
 */
export type MockConfirmedReunion = {
    id: string;
    lostReportId: string;
    foundReportId: string | null;
};

const TOTAL_REPORTS = 128;
const LOST_REPORTS = 74;
const CONFIRMED_REUNIONS = 38;
const MAX_AGE_DAYS = 400;
const DAY_MS = 86_400_000;
const SEED = 20261027;

const CATEGORY_WEIGHTS: ReadonlyArray<readonly [ItemCategory, number]> = [
    ["Documentos", 32],
    ["Tecnología", 27],
    ["Accesorios", 20],
    ["Llaves", 9],
    ["Ropa", 7],
    ["Otros", 5],
];

const LOCATION_WEIGHTS: ReadonlyArray<readonly [ItemLocation, number]> = [
    ["Bloque Central", 22],
    ["Cafetería", 17],
    ["Biblioteca", 13],
    ["Ingeniería", 9],
    ["Economía", 7],
    ["Restaurante", 7],
    ["Laboratorios", 6],
    ["Bienestar", 5],
    ["Café y Letras", 5],
    ["Artes", 4],
    ["Ágoras", 3],
    ["Ileusco", 2],
];

/** Small deterministic PRNG (mulberry32): same sequence for the same seed. */
function createRandom(seed: number): () => number {
    let state = seed;
    return () => {
        state = (state + 0x6d2b79f5) | 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

function shuffle<T>(values: T[], random: () => number): T[] {
    const copy = [...values];
    for (let index = copy.length - 1; index > 0; index--) {
        const swap = Math.floor(random() * (index + 1));
        [copy[index], copy[swap]] = [copy[swap], copy[index]];
    }
    return copy;
}

function pickWeighted<T>(entries: ReadonlyArray<readonly [T, number]>, random: () => number): T {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0);
    let threshold = random() * total;
    for (const [value, weight] of entries) {
        threshold -= weight;
        if (threshold < 0) return value;
    }
    return entries[entries.length - 1][0];
}

function buildReports(now: number, random: () => number): MockAnalyticsReport[] {
    // Exactly LOST_REPORTS lost and the rest found, in a shuffled order
    const types = shuffle<ItemType>(
        Array.from({ length: TOTAL_REPORTS }, (_, index) => (index < LOST_REPORTS ? "lost" : "found")),
        random,
    );

    return types.map((type, index) => {
        // Squared random: more recent reports than old ones, as in a real catalog
        const ageDays = Math.floor(random() ** 2 * MAX_AGE_DAYS);
        return {
            id: `mock-${index + 1}`,
            type,
            category: pickWeighted(CATEGORY_WEIGHTS, random),
            location: pickWeighted(LOCATION_WEIGHTS, random),
            publishedAt: new Date(now - ageDays * DAY_MS).toISOString(),
        };
    });
}

function buildReunions(reports: ReadonlyArray<MockAnalyticsReport>, random: () => number): MockConfirmedReunion[] {
    const lost = shuffle(
        reports.filter((report) => report.type === "lost"),
        random,
    ).slice(0, CONFIRMED_REUNIONS);
    const availableFound = reports.filter((report) => report.type === "found");

    return lost.map((lostReport, index) => {
        // Pair with a found report of the same category when there is one; it is counted once anyway
        const foundIndex = availableFound.findIndex((found) => found.category === lostReport.category);
        const found = foundIndex >= 0 ? availableFound.splice(foundIndex, 1)[0] : null;
        return { id: `reunion-${index + 1}`, lostReportId: lostReport.id, foundReportId: found?.id ?? null };
    });
}

const random = createRandom(SEED);

export const ADMIN_ANALYTICS_REPORTS_MOCK: ReadonlyArray<MockAnalyticsReport> = buildReports(Date.now(), random);

export const ADMIN_CONFIRMED_REUNIONS_MOCK: ReadonlyArray<MockConfirmedReunion> = buildReunions(
    ADMIN_ANALYTICS_REPORTS_MOCK,
    random,
);

// ---------- System health ----------

/** "request_error" simulates that the health query itself failed ("Estado no disponible"). */
export type MockHealthScenario = HealthState | "request_error";

/** Change this value locally to preview each state of the indicator. */
export const MOCK_HEALTH_SCENARIO = "operational" as MockHealthScenario;

export const HEALTH_MOCK_SERVICES: Record<HealthState, HealthServiceCheck[]> = {
    operational: [
        { name: "api", status: "operational" },
        { name: "database", status: "operational" },
        { name: "storage", status: "operational" },
        { name: "auth", status: "operational" },
    ],
    degraded: [
        { name: "api", status: "operational" },
        { name: "database", status: "operational" },
        { name: "storage", status: "degraded" },
        { name: "auth", status: "operational" },
    ],
    unavailable: [
        { name: "api", status: "unavailable" },
        { name: "database", status: "unavailable" },
        { name: "storage", status: "operational" },
        { name: "auth", status: "operational" },
    ],
};
