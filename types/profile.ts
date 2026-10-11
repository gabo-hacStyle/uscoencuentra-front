/** Response of GET /profile and PATCH /profile (only what the frontend uses). */
export interface ProfileResponse {
  numero: string | null; // E.164 without separators: "+573124567890". null = no number registered
  image: string | null; // URL of the user's PROFILE photo (not an item photo); null = Google's photo or initials
  shareContact: boolean; // true = the phone is offered in the private contact of the user's reports
}

/** Body of PATCH /profile: at least one field. */
export interface UpdateProfileRequest {
  numero?: string; // E.164 (the frontend adds +57 before sending)
  shareContact?: boolean;
}

/** What the phone Server Action returns to the modal. */
export type PhoneUpdateResult =
  | { ok: true; numero: string | null }
  | { ok: false; field: "numero" | "form"; error: string };

/** What the share-contact Server Action returns to the privacy card. */
export type ShareContactResult =
  | { ok: true; shareContact: boolean }
  | { ok: false; error: string };