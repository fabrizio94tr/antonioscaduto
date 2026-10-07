import type { TransferStatus } from "./types";

/** Temperatura di una trattativa (0-100) per il "Mercato Radar". */
export const HEAT: Record<TransferStatus, number> = { rumors: 22, trattativa: 52, vicino: 82, ufficiale: 100, sfumato: 12 };
export const STATUS_LABEL: Record<TransferStatus, string> = {
  ufficiale: "Ufficiale", vicino: "Vicino", trattativa: "In trattativa", rumors: "Rumors", sfumato: "Sfumato",
};
