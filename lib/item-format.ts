const dateFormatter = new Intl.DateTimeFormat("es-CO", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "America/Bogota", // same output on server and browser (avoids hydration errors)
});

export function formatPublishedDate(iso: string): string {
    return dateFormatter.format(new Date(iso)); // "12 jun, 12:08 p. m."
}

export function formatPhone(e164: string): string {
    const digits = e164.replace(/\D/g, "");
    if (digits.startsWith("57") && digits.length === 12) {
        return `+57 ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
    return e164; // not a Colombian mobile number: show it as received
}