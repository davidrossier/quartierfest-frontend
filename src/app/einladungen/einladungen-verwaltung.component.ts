import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { EinladungService } from './einladung.service';
import { ParteiService } from '../parteien/partei.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Einladung, EinladungStatus, BuffetBeitrag } from './einladung.model';
import { Partei } from '../parteien/partei.model';

@Component({
  selector: 'app-einladungen-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './einladungen-verwaltung.component.html',
  styleUrl: './einladungen-verwaltung.component.css',
})
export class EinladungenVerwaltungComponent implements OnInit {
  private readonly einladungService = inject(EinladungService);
  private readonly parteiService = inject(ParteiService);
  readonly eventKontext = inject(EventKontextService);
  private readonly fb = inject(FormBuilder);

  alleEinladungen = signal<Einladung[]>([]);
  parteien = signal<Partei[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);
  formFehler = signal<string | null>(null);
  bearbeitungEinladung = signal<Einladung | null>(null);

  gefilterteEinladungen = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleEinladungen().filter(e => e.event.id === eventId);
  });

  nichtEingeladeneParteien = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    const eingeladeneIds = new Set(
      this.alleEinladungen()
        .filter(e => eventId != null && e.event.id === eventId)
        .map(e => e.partei.id),
    );
    return this.parteien().filter(p => !eingeladeneIds.has(p.id));
  });

  isAngemeldet = computed(() => this.erfassenForm.get('status')?.value === 'ANGEMELDET');
  isWeitere = computed(() => this.erfassenForm.get('buffetBeitrag')?.value === 'WEITERE');

  erfassenForm = this.fb.group({
    parteiId: ['' as string],
    status: ['OFFEN' as EinladungStatus, Validators.required],
    anzahlPersonen: [null as number | null],
    hilftAufstellen: [false],
    hilftAufraumen: [false],
    buffetBeitrag: ['KEINER' as string],
    buffetBeitragBeschreibung: [''],
  });

  ngOnInit(): void {
    this.laden();
    this.parteiService.getAll().subscribe({
      next: parteien => this.parteien.set(parteien),
      error: () => this.fehler.set('Parteien konnten nicht geladen werden.'),
    });
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.einladungService.getAll().subscribe({
      next: einladungen => {
        this.alleEinladungen.set(einladungen);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Einladungen konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  einladungenFuerAlleErstellen(): void {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return;

    const nichtEingeladen = this.nichtEingeladeneParteien();
    if (nichtEingeladen.length === 0) {
      this.erfolg.set('Alle Parteien haben bereits eine Einladung für diesen Event.');
      setTimeout(() => this.erfolg.set(null), 4000);
      return;
    }

    forkJoin(
      nichtEingeladen.map(p =>
        this.einladungService.save({
          event: { id: eventId },
          partei: { id: p.id },
          status: 'OFFEN',
          bestaetigungVersendet: false,
        }),
      ),
    ).subscribe({
      next: () => {
        this.erfolg.set(`${nichtEingeladen.length} Einladung(en) erstellt.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: () => {
        this.fehler.set('Einige Einladungen konnten nicht erstellt werden.');
        this.laden();
      },
    });
  }

  bearbeiten(einladung: Einladung): void {
    this.bearbeitungEinladung.set(einladung);
    this.erfassenForm.patchValue({
      status: einladung.status,
      anzahlPersonen: einladung.anzahlPersonen ?? null,
      hilftAufstellen: einladung.hilftAufstellen ?? false,
      hilftAufraumen: einladung.hilftAufraumen ?? false,
      buffetBeitrag: einladung.buffetBeitrag ?? 'KEINER',
      buffetBeitragBeschreibung: einladung.buffetBeitragBeschreibung ?? '',
    });
    this.formFehler.set(null);
  }

  abbrechen(): void {
    this.bearbeitungEinladung.set(null);
    this.formZuruecksetzen();
  }

  speichern(): void {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return;
    const editEinladung = this.bearbeitungEinladung();

    if (editEinladung) {
      this.rueckmeldungSpeichern(editEinladung, eventId);
    } else {
      this.neueEinladungSpeichern(eventId);
    }
  }

  loeschen(einladung: Einladung): void {
    if (!confirm(`Einladung für „${einladung.partei.bezeichnung}" wirklich löschen?`)) return;
    this.einladungService.delete(einladung.id).subscribe({
      next: () => {
        this.erfolg.set(`Einladung für „${einladung.partei.bezeichnung}" wurde gelöscht.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Einladung konnte nicht gelöscht werden.');
      },
    });
  }

  statusBadgeKlasse(status: EinladungStatus): string {
    switch (status) {
      case 'OFFEN': return 'badge badge--neutral';
      case 'ANGEMELDET': return 'badge badge--success';
      case 'ABGEMELDET': return 'badge badge--error';
    }
  }

  statusLabel(status: EinladungStatus): string {
    switch (status) {
      case 'OFFEN': return 'Offen';
      case 'ANGEMELDET': return 'Angemeldet';
      case 'ABGEMELDET': return 'Abgemeldet';
    }
  }

  buffetLabel(beitrag?: BuffetBeitrag | null): string {
    switch (beitrag) {
      case 'SALAT': return 'Salat';
      case 'BROT_ZOPF': return 'Brot/Zopf';
      case 'DESSERT': return 'Dessert';
      case 'WEITERE': return 'Weitere';
      default: return '–';
    }
  }

  feldUngueltig(feld: string): boolean {
    const control = this.erfassenForm.get(feld);
    return !!control && control.invalid && control.touched;
  }

  private neueEinladungSpeichern(eventId: number): void {
    const parteiId = this.erfassenForm.get('parteiId')?.value;
    if (!parteiId) {
      this.formFehler.set('Bitte eine Partei auswählen.');
      return;
    }
    this.einladungService
      .save({
        event: { id: eventId },
        partei: { id: Number(parteiId) },
        status: 'OFFEN',
        bestaetigungVersendet: false,
      })
      .subscribe({
        next: () => {
          this.formZuruecksetzen();
          this.erfolg.set('Einladung erfolgreich erstellt.');
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Einladung konnte nicht erstellt werden.');
        },
      });
  }

  private rueckmeldungSpeichern(einladung: Einladung, eventId: number): void {
    if (this.erfassenForm.invalid) {
      this.erfassenForm.markAllAsTouched();
      return;
    }
    const { status, anzahlPersonen, hilftAufstellen, hilftAufraumen, buffetBeitrag, buffetBeitragBeschreibung } =
      this.erfassenForm.value;
    const angemeldet = status === 'ANGEMELDET';

    this.einladungService
      .save({
        id: einladung.id,
        event: { id: eventId },
        partei: { id: einladung.partei.id },
        status: status as EinladungStatus,
        anzahlPersonen: angemeldet && anzahlPersonen != null ? Number(anzahlPersonen) : undefined,
        hilftAufstellen: angemeldet ? (hilftAufstellen ?? false) : undefined,
        hilftAufraumen: angemeldet ? (hilftAufraumen ?? false) : undefined,
        buffetBeitrag: angemeldet && buffetBeitrag ? (buffetBeitrag as BuffetBeitrag) : undefined,
        buffetBeitragBeschreibung:
          angemeldet && buffetBeitrag === 'WEITERE' ? (buffetBeitragBeschreibung ?? '') : undefined,
        bestaetigungVersendet: einladung.bestaetigungVersendet,
      })
      .subscribe({
        next: () => {
          this.bearbeitungEinladung.set(null);
          this.formZuruecksetzen();
          this.erfolg.set('Rückmeldung gespeichert.');
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Rückmeldung konnte nicht gespeichert werden.');
        },
      });
  }

  private formZuruecksetzen(): void {
    this.erfassenForm.reset({
      parteiId: '',
      status: 'OFFEN',
      buffetBeitrag: 'KEINER',
      hilftAufstellen: false,
      hilftAufraumen: false,
    });
    this.formFehler.set(null);
  }
}
