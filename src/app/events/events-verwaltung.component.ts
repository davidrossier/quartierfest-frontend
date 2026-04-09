import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { EventService } from './event.service';
import { Event } from './event.model';

@Component({
  selector: 'app-events-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './events-verwaltung.component.html',
  styleUrl: './events-verwaltung.component.css',
})
export class EventsVerwaltungComponent implements OnInit {
  private readonly eventService = inject(EventService);
  private readonly fb = inject(FormBuilder);

  events = signal<Event[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);
  formFehler = signal<string | null>(null);
  bearbeitungEvent = signal<Event | null>(null);

  erfassenForm = this.fb.group({
    datum: ['', Validators.required],
    startzeit: ['', Validators.required],
    standort: ['', Validators.required],
    alternativerStandort: [''],
    zeitAufstellen: [''],
    zeitAufraumen: [''],
  });

  ngOnInit(): void {
    this.laden();
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.eventService.getAll().subscribe({
      next: events => {
        this.events.set(events);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Events konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  bearbeiten(event: Event): void {
    this.bearbeitungEvent.set(event);
    this.erfassenForm.setValue({
      datum: event.datum,
      startzeit: event.startzeit,
      standort: event.standort,
      alternativerStandort: event.alternativerStandort ?? '',
      zeitAufstellen: event.zeitAufstellen ?? '',
      zeitAufraumen: event.zeitAufraumen ?? '',
    });
    this.formFehler.set(null);
  }

  abbrechen(): void {
    this.bearbeitungEvent.set(null);
    this.erfassenForm.reset();
    this.formFehler.set(null);
  }

  speichern(): void {
    if (this.erfassenForm.invalid) {
      this.erfassenForm.markAllAsTouched();
      return;
    }
    this.formFehler.set(null);
    const { datum, startzeit, standort, alternativerStandort, zeitAufstellen, zeitAufraumen } =
      this.erfassenForm.value;
    const payload = {
      datum: datum!,
      startzeit: startzeit!,
      standort: standort!,
      alternativerStandort: alternativerStandort || undefined,
      zeitAufstellen: zeitAufstellen || undefined,
      zeitAufraumen: zeitAufraumen || undefined,
    };

    const editEvent = this.bearbeitungEvent();
    if (editEvent) {
      this.eventService.update(editEvent.id, payload).subscribe({
        next: () => {
          this.bearbeitungEvent.set(null);
          this.erfassenForm.reset();
          this.erfolg.set(`Event „${payload.standort}" wurde aktualisiert.`);
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Event konnte nicht gespeichert werden.');
        },
      });
    } else {
      this.eventService.create(payload).subscribe({
        next: () => {
          this.erfassenForm.reset();
          this.erfolg.set('Event erfolgreich erfasst.');
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Event konnte nicht gespeichert werden.');
        },
      });
    }
  }

  loeschen(event: Event): void {
    if (!confirm(`Event „${event.standort}, ${this.datumAnzeige(event.datum)}" wirklich löschen?`))
      return;
    this.eventService.delete(event.id).subscribe({
      next: () => {
        this.erfolg.set(`Event „${event.standort}" wurde gelöscht.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Event konnte nicht gelöscht werden.');
      },
    });
  }

  datumAnzeige(datum: string): string {
    if (!datum) return '–';
    const [year, month, day] = datum.split('-');
    return `${day}.${month}.${year}`;
  }

  zeitAnzeige(zeit?: string): string {
    return zeit ?? '–';
  }

  feldUngueltig(feld: string): boolean {
    const control = this.erfassenForm.get(feld);
    return !!control && control.invalid && control.touched;
  }
}
