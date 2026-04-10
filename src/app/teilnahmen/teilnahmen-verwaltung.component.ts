import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormArray, FormGroup } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { createSortierung, sortiereItems } from '../shared/sortierung';
import { TeilnahmeService } from './teilnahme.service';
import { EinladungService } from '../einladungen/einladung.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Teilnahme, BuffetBeitragEintrag } from './teilnahme.model';
import { Einladung, BuffetBeitrag } from '../einladungen/einladung.model';

@Component({
  selector: 'app-teilnahmen-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './teilnahmen-verwaltung.component.html',
  styleUrl: './teilnahmen-verwaltung.component.css',
})
export class TeilnahmenVerwaltungComponent implements OnInit {
  private readonly teilnahmeService = inject(TeilnahmeService);
  private readonly einladungService = inject(EinladungService);
  readonly eventKontext = inject(EventKontextService);
  private readonly fb = inject(FormBuilder);

  alleTeilnahmen = signal<Teilnahme[]>([]);
  alleEinladungen = signal<Einladung[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);
  formFehler = signal<string | null>(null);
  bearbeitungTeilnahme = signal<Teilnahme | null>(null);

  gefilterteTeilnahmen = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleTeilnahmen().filter(t => t.einladung.event.id === eventId);
  });

  readonly sort = createSortierung();
  sortierteTeilnahmen = computed(() =>
    sortiereItems(this.gefilterteTeilnahmen(), this.sort.spalte(), this.sort.richtung(), (t, s) => {
      switch (s) {
        case 'partei': return t.einladung.partei.bezeichnung;
        case 'anzahlPersonenEffektiv': return t.anzahlPersonenEffektiv;
        default: return '';
      }
    }),
  );

  einladungenOhneTeilnahme = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    const einladungIdsWithTeilnahme = new Set(this.alleTeilnahmen().map(t => t.einladung.id));
    return this.alleEinladungen().filter(
      e => e.event.id === eventId && e.status === 'ANGEMELDET' && !einladungIdsWithTeilnahme.has(e.id),
    );
  });

  erfassenForm = this.fb.group({
    anzahlPersonenEffektiv: [null as number | null],
    hilftAufstellen: [false],
    hilftAufraumen: [false],
    buffetBeitraege: this.fb.array([]),
  });

  get buffetBeitraegeArray(): FormArray {
    return this.erfassenForm.get('buffetBeitraege') as FormArray;
  }

  ngOnInit(): void {
    this.laden();
    this.einladungService.getAll().subscribe({
      next: einladungen => this.alleEinladungen.set(einladungen),
      error: () => this.fehler.set('Einladungen konnten nicht geladen werden.'),
    });
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.teilnahmeService.getAll().subscribe({
      next: teilnahmen => {
        this.alleTeilnahmen.set(teilnahmen);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Teilnahmen konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  teilnahmenAusEinladungenErstellen(): void {
    const fehlende = this.einladungenOhneTeilnahme();
    if (fehlende.length === 0) {
      this.erfolg.set('Alle Anmeldungen haben bereits eine Teilnahme.');
      setTimeout(() => this.erfolg.set(null), 4000);
      return;
    }

    forkJoin(
      fehlende.map(e => {
        const buffetBeitraege: BuffetBeitragEintrag[] = [];
        if (e.buffetBeitrag && e.buffetBeitrag !== 'KEINER') {
          buffetBeitraege.push({ art: e.buffetBeitrag, beschreibung: e.buffetBeitragBeschreibung ?? undefined });
        }
        return this.teilnahmeService.save({
          einladung: { id: e.id },
          anzahlPersonenEffektiv: e.anzahlPersonen,
          hilftAufstellen: e.hilftAufstellen,
          hilftAufraumen: e.hilftAufraumen,
          buffetBeitraege,
        });
      }),
    ).subscribe({
      next: () => {
        this.erfolg.set(`${fehlende.length} Teilnahme(n) erstellt.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: () => {
        this.fehler.set('Einige Teilnahmen konnten nicht erstellt werden.');
        this.laden();
      },
    });
  }

  bearbeiten(teilnahme: Teilnahme): void {
    this.bearbeitungTeilnahme.set(teilnahme);
    this.erfassenForm.patchValue({
      anzahlPersonenEffektiv: teilnahme.anzahlPersonenEffektiv ?? null,
      hilftAufstellen: teilnahme.hilftAufstellen ?? false,
      hilftAufraumen: teilnahme.hilftAufraumen ?? false,
    });
    while (this.buffetBeitraegeArray.length > 0) {
      this.buffetBeitraegeArray.removeAt(0);
    }
    (teilnahme.buffetBeitraege ?? []).forEach(b => {
      this.buffetBeitraegeArray.push(this.fb.group({ art: [b.art], beschreibung: [b.beschreibung ?? ''] }));
    });
    this.formFehler.set(null);
  }

  abbrechen(): void {
    this.bearbeitungTeilnahme.set(null);
    this.formZuruecksetzen();
  }

  beitragHinzufuegen(): void {
    this.buffetBeitraegeArray.push(this.fb.group({ art: ['SALAT'], beschreibung: [''] }));
  }

  beitragEntfernen(index: number): void {
    this.buffetBeitraegeArray.removeAt(index);
  }

  speichern(): void {
    const editTeilnahme = this.bearbeitungTeilnahme();
    if (!editTeilnahme) return;

    const { anzahlPersonenEffektiv, hilftAufstellen, hilftAufraumen } = this.erfassenForm.value;
    const buffetBeitraege: BuffetBeitragEintrag[] = (this.buffetBeitraegeArray.value as Array<{ art: string; beschreibung: string }>)
      .filter(b => b.art)
      .map(b => ({ art: b.art as BuffetBeitrag, beschreibung: b.beschreibung || undefined }));

    this.teilnahmeService
      .save({
        id: editTeilnahme.id,
        einladung: { id: editTeilnahme.einladung.id },
        anzahlPersonenEffektiv: anzahlPersonenEffektiv != null ? Number(anzahlPersonenEffektiv) : undefined,
        hilftAufstellen: hilftAufstellen ?? false,
        hilftAufraumen: hilftAufraumen ?? false,
        buffetBeitraege,
      })
      .subscribe({
        next: () => {
          this.bearbeitungTeilnahme.set(null);
          this.formZuruecksetzen();
          this.erfolg.set('Teilnahme gespeichert.');
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Teilnahme konnte nicht gespeichert werden.');
        },
      });
  }

  loeschen(teilnahme: Teilnahme): void {
    if (!confirm(`Teilnahme von „${teilnahme.einladung.partei.bezeichnung}" wirklich löschen?`)) return;
    this.teilnahmeService.delete(teilnahme.id).subscribe({
      next: () => {
        this.erfolg.set(`Teilnahme von „${teilnahme.einladung.partei.bezeichnung}" wurde gelöscht.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Teilnahme konnte nicht gelöscht werden.');
      },
    });
  }

  buffetArtLabel(art: BuffetBeitrag): string {
    switch (art) {
      case 'SALAT': return 'Salat';
      case 'BROT_ZOPF': return 'Brot/Zopf';
      case 'DESSERT': return 'Dessert';
      case 'WEITERE': return 'Weitere';
      default: return art;
    }
  }

  private formZuruecksetzen(): void {
    this.erfassenForm.reset({ hilftAufstellen: false, hilftAufraumen: false });
    while (this.buffetBeitraegeArray.length > 0) {
      this.buffetBeitraegeArray.removeAt(0);
    }
    this.formFehler.set(null);
  }
}
