import type { User } from "@supabase/supabase-js";

/**
 * Ruoli (app_metadata.role, impostato dal database, non modificabile dall'utente):
 *  - "reader": lettore registrato (solo commenti). Ogni nuovo account creato dal login dei lettori nasce così.
 *  - "editor": redattore. Nessun ruolo o "admin": amministratore.
 */
export const roleOf = (u: Pick<User, "app_metadata"> | null | undefined): string => String((u?.app_metadata as { role?: string } | undefined)?.role ?? "admin");
export const isReader = (u: Pick<User, "app_metadata"> | null | undefined) => roleOf(u) === "reader";
export const isStaff = (u: Pick<User, "app_metadata"> | null | undefined) => !!u && !isReader(u);
