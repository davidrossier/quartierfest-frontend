import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin, Observable } from 'rxjs';
import { KonsumationService } from './konsumation.service';
import { TeilnahmeService } from '../teilnahmen/teilnahme.service';
import { KonsumationsangebotService } from '../konsumationsangebote/konsumationsangebot.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Teilnahme } from '../teilnahmen/teilnahme.model';
import { Konsumationsangebot } from '../konsumationsangebote/konsumationsangebot.model';

@Component({
  selector: 'app-konsumationen-verwaltung',
  imports: [],
  templateUrl: './konsumationen-verwaltung.component.html',
  styleUrl: './konsumationen-verwaltung.component.css',
})
export class KonsumationenVerwaltungComponent implements OnInit {
  private readonly konsumationService = inject(KonsumationService);
  private readonly teilnahmeService = inject(TeilnahmeService);
  private readonly angebotService = inject(KonsumationsangebotService);
  readonly eventKontext = inject(EventKontextService);

  alleTeilnahmen = signal<Teilnahme[]>([]);
  alleAngebote = signal<Konsumationsangebot[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);

  // Aktuelle Eingabewerte: key = `${teilnahmeId}-${angebotId}`
  matrixWerte = signal<Record<string, number>>({});
  // Gespeicherte Konsumations-IDs: key = `${teilnahmeId}-${angebotId}`
  konsumationIds = signal<Record<string, number>>({});

  teilnahmenFuerEvent = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleTeilnahmen().filter(t => t.einladung.event.id === eventId);
  });

  angeboteFuerEvent = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleAngebote().filter(a => a.event.id === eventId);
  });

  keinAngebot = computed(
    () => this.eventKontext.selectedEventId() != null && this.angeboteFuerEvent().length === 0,
  );

  keineTeilnahmen = computed(
    () => this.eventKontext.selectedEventId() != null && this.teilnahmenFuerEvent().length === 0,
  );

  ngOnInit(): void {
    this.laden();
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    forkJoin({
      teilnahmen: this.teilnahmeService.getAll(),
      angebote: this.angebotService.getAll(),
      konsumationen: this.konsumationService.getAll(),
    }).subscribe({
      next: ({ teilnahmen, angebote, konsumationen }) => {
        this.alleTeilnahmen.set(teilnahmen);
        this.alleAngebote.set(angebote);
        const werte: Record<string, number> = {};
        const ids: Record<string, number> = {};
        for (const k of konsumationen) {
          const key = `${k.teilnahme.id}-${k.konsumationsangebot.id}`;
          werte[key] = k.anzahl;
          ids[key] = k.id;
        }
        this.matrixWerte.set(werte);
        this.konsumationIds.set(ids);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Daten konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  getWert(teilnahmeId: number, angebotId: number): number {
    return this.matrixWerte()[`${teilnahmeId}-${angebotId}`] ?? 0;
  }

  setWert(teilnahmeId: number, angebotId: number, rawValue: string): void {
    const anzahl = parseInt(rawValue, 10);
    if (isNaN(anzahl)) return;
    this.matrixWerte.update(m => ({ ...m, [`${teilnahmeId}-${angebotId}`]: anzahl }));
  }

  totalFuerTeilnahme(teilnahme: Teilnahme): number {
    return this.angeboteFuerEvent().reduce((sum, a) => {
      const anzahl = this.matrixWerte()[`${teilnahme.id}-${a.id}`] ?? 0;
      return sum + anzahl * a.preis;
    }, 0);
  }

  hatUngueltigeWerte(): boolean {
    return Object.values(this.matrixWerte()).some(v => v < 0);
  }

  speichern(): void {
    if (this.hatUngueltigeWerte()) {
      this.fehler.set('Negative Anzahlen sind nicht erlaubt.');
      return;
    }
    this.fehler.set(null);

    const werte = this.matrixWerte();
    const ids = this.konsumationIds();
    const requests: Observable<unknown>[] = [];

    for (const t of this.teilnahmenFuerEvent()) {
      for (const a of this.angeboteFuerEvent()) {
        const key = `${t.id}-${a.id}`;
        const anzahl = werte[key] ?? 0;
        const existingId = ids[key];

        if (anzahl > 0) {
          requests.push(
            this.konsumationService.save({
              id: existingId,
              teilnahme: { id: t.id },
              konsumationsangebot: { id: a.id },
              anzahl,
            }),
          );
        } else if (existingId) {
          requests.push(this.konsumationService.delete(existingId));
        }
      }
    }

    if (requests.length === 0) {
      this.erfolg.set('Keine Änderungen vorhanden.');
      setTimeout(() => this.erfolg.set(null), 3000);
      return;
    }

    forkJoin(requests).subscribe({
      next: () => {
        this.erfolg.set('Konsumationen gespeichert.');
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Konsumationen konnten nicht gespeichert werden.');
      },
    });
  }

  preisAnzeige(preis: number): string {
    return `CHF ${preis.toFixed(2)}`;
  }
}
