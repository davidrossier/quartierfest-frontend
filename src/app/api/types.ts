/**
 * API-001: Hilfstypen für die aus `schema.d.ts` generierten Contract-Typen.
 *
 * Im Backend sind die JPA-Entities zugleich Request- und Response-Schema. Deshalb ist im
 * generierten Schema `id` optional, und Felder, die das Backend in Antworten immer liefert
 * (primitive `boolean`, initialisierte Collections), sind ebenfalls optional.
 *
 * `Persisted<T, K>` beschreibt den Antwort-Typ: `id` ist gesetzt, die Felder `K` sind Pflicht.
 * Die `*Payload`-Typen in den Modellen bleiben handgeschrieben, bis das Backend getrennte
 * Request-/Response-DTOs liefert (API-001 Stufe 2).
 */
export type Persisted<T, K extends keyof T = never> = Omit<T, 'id' | K> &
  Required<Pick<T, K>> & { id: number };
