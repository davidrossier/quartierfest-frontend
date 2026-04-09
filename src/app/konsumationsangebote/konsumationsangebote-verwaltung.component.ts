import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { createSortierung, sortiereItems } from '../shared/sortierung';
import { KonsumationsangebotService } from './konsumationsangebot.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Konsumationsangebot } from './konsumationsangebot.model';

@Component({
  selector: 'app-konsumationsangebote-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './konsumationsangebote-verwaltung.component.html',
  styleUrl: './konsumationsangebote-verwaltung.component.css',
})
export class KonsumationsangeboteVerwaltungComponent implements OnInit {
  private readonly angebotService = inject(KonsumationsangebotService);
  readonly eventKontext = inject(EventKontextService);
  private readonly fb = inject(FormBuilder);

  alleAngebote = signal<Konsumationsangebot[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);
  formFehler = signal<string | null>(null);
  bearbeitungAngebot = signal<Konsumationsangebot | null>(null);

  gefilterteAngebote = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleAngebote().filter(a => a.event.id === eventId);
  });

  readonly sort = createSortierung();
  sortierteAngebote = computed(() =>
    sortiereItems(this.gefilterteAngebote(), this.sort.spalte(), this.sort.richtung(), (a, s) => {
      switch (s) {
        case 'bezeichnung': return a.bezeichnung;
        case 'preis': return a.preis;
        default: return '';
      }
    }),
  );

  erfassenForm = this.fb.group({
    bezeichnung: ['', Validators.required],
    preis: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.laden();
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.angebotService.getAll().subscribe({
      next: angebote => {
        this.alleAngebote.set(angebote);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Konsumationsangebote konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  bearbeiten(angebot: Konsumationsangebot): void {
    this.bearbeitungAngebot.set(angebot);
    this.erfassenForm.setValue({ bezeichnung: angebot.bezeichnung, preis: angebot.preis });
    this.formFehler.set(null);
  }

  abbrechen(): void {
    this.bearbeitungAngebot.set(null);
    this.erfassenForm.reset();
    this.formFehler.set(null);
  }

  speichern(): void {
    if (this.erfassenForm.invalid) {
      this.erfassenForm.markAllAsTouched();
      return;
    }
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return;

    const { bezeichnung, preis } = this.erfassenForm.value;
    const editAngebot = this.bearbeitungAngebot();

    this.angebotService
      .save({
        id: editAngebot?.id,
        event: { id: eventId },
        bezeichnung: bezeichnung!,
        preis: Number(preis),
      })
      .subscribe({
        next: () => {
          const meldung = editAngebot
            ? `„${bezeichnung}" wurde aktualisiert.`
            : `„${bezeichnung}" wurde erfasst.`;
          this.bearbeitungAngebot.set(null);
          this.erfassenForm.reset();
          this.erfolg.set(meldung);
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Angebot konnte nicht gespeichert werden.');
        },
      });
  }

  loeschen(angebot: Konsumationsangebot): void {
    if (!confirm(`„${angebot.bezeichnung}" wirklich löschen?`)) return;
    this.angebotService.delete(angebot.id).subscribe({
      next: () => {
        this.erfolg.set(`„${angebot.bezeichnung}" wurde gelöscht.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(
          err.error?.message ?? 'Angebot konnte nicht gelöscht werden (evtl. bestehende Konsumationen).',
        );
      },
    });
  }

  preisAnzeige(preis: number): string {
    return `CHF ${preis.toFixed(2)}`;
  }

  feldUngueltig(feld: string): boolean {
    const control = this.erfassenForm.get(feld);
    return !!control && control.invalid && control.touched;
  }
}
