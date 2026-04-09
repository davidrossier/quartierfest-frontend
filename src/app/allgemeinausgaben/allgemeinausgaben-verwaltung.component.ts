import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { AllgemeinausgabeService } from './allgemeinausgabe.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Allgemeinausgabe } from './allgemeinausgabe.model';

@Component({
  selector: 'app-allgemeinausgaben-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './allgemeinausgaben-verwaltung.component.html',
  styleUrl: './allgemeinausgaben-verwaltung.component.css',
})
export class AllgemeinausgabenVerwaltungComponent implements OnInit {
  private readonly ausgabeService = inject(AllgemeinausgabeService);
  readonly eventKontext = inject(EventKontextService);
  private readonly fb = inject(FormBuilder);

  alleAusgaben = signal<Allgemeinausgabe[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);
  formFehler = signal<string | null>(null);
  bearbeitungAusgabe = signal<Allgemeinausgabe | null>(null);

  gefilterteAusgaben = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleAusgaben().filter(a => a.event.id === eventId);
  });

  gesamtbetrag = computed(() =>
    this.gefilterteAusgaben().reduce((sum, a) => sum + a.betrag, 0),
  );

  erfassenForm = this.fb.group({
    beschreibung: ['', Validators.required],
    herkunft: [''],
    betrag: [null as number | null, [Validators.required, Validators.min(0)]],
  });

  ngOnInit(): void {
    this.laden();
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.ausgabeService.getAll().subscribe({
      next: ausgaben => {
        this.alleAusgaben.set(ausgaben);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Allgemeinausgaben konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  bearbeiten(ausgabe: Allgemeinausgabe): void {
    this.bearbeitungAusgabe.set(ausgabe);
    this.erfassenForm.setValue({
      beschreibung: ausgabe.beschreibung,
      herkunft: ausgabe.herkunft ?? '',
      betrag: ausgabe.betrag,
    });
    this.formFehler.set(null);
  }

  abbrechen(): void {
    this.bearbeitungAusgabe.set(null);
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

    const { beschreibung, herkunft, betrag } = this.erfassenForm.value;
    const editAusgabe = this.bearbeitungAusgabe();

    this.ausgabeService
      .save({
        id: editAusgabe?.id,
        event: { id: eventId },
        beschreibung: beschreibung!,
        herkunft: herkunft || undefined,
        betrag: Number(betrag),
      })
      .subscribe({
        next: () => {
          const meldung = editAusgabe
            ? `„${beschreibung}" wurde aktualisiert.`
            : `„${beschreibung}" wurde erfasst.`;
          this.bearbeitungAusgabe.set(null);
          this.erfassenForm.reset();
          this.erfolg.set(meldung);
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Ausgabe konnte nicht gespeichert werden.');
        },
      });
  }

  loeschen(ausgabe: Allgemeinausgabe): void {
    if (!confirm(`„${ausgabe.beschreibung}" wirklich löschen?`)) return;
    this.ausgabeService.delete(ausgabe.id).subscribe({
      next: () => {
        this.erfolg.set(`„${ausgabe.beschreibung}" wurde gelöscht.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Ausgabe konnte nicht gelöscht werden.');
      },
    });
  }

  betragAnzeige(betrag: number): string {
    return `CHF ${betrag.toFixed(2)}`;
  }

  feldUngueltig(feld: string): boolean {
    const control = this.erfassenForm.get(feld);
    return !!control && control.invalid && control.touched;
  }
}
