import type {
  Teilnahme as ApiTeilnahme,
  TeilnahmeBuffetBeitrag,
  TeilnahmeUpdateRequest,
} from '../api/schema';
import { Persisted } from '../api/types';
import { BuffetBeitrag, Einladung } from '../einladungen/einladung.model';

/** Ein Büffetbeitrag der Teilnahme; `art` ist im Backend nicht `@NotNull`, im Frontend aber immer gesetzt. */
export type BuffetBeitragEintrag = Omit<TeilnahmeBuffetBeitrag, 'art'> & { art: BuffetBeitrag };

/** Antwort-Typ aus dem OpenAPI-Schema (API-001); `buffetBeitraege` ist im Backend immer initialisiert. */
export type Teilnahme = Persisted<Omit<ApiTeilnahme, 'einladung' | 'buffetBeitraege'>> & {
  einladung: Einladung;
  buffetBeitraege: BuffetBeitragEintrag[];
};

export interface TeilnahmePayload {
  einladung: { id: number };
  anzahlPersonenEffektiv?: number;
  hilftAufstellen?: boolean;
  hilftAufraumen?: boolean;
  buffetBeitraege: BuffetBeitragEintrag[];
}

/** UC-016: PUT /api/teilnahmen/{id} — Whitelist ohne einladung (Schema `TeilnahmeUpdateRequest`). */
export type TeilnahmeUpdatePayload = Omit<TeilnahmeUpdateRequest, 'buffetBeitraege'> & {
  buffetBeitraege: BuffetBeitragEintrag[];
};
