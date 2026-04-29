import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { createSortierung, sortiereItems } from '../shared/sortierung';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { ParteiService } from './partei.service';
import { PersonService } from '../personen/person.service';
import { Partei } from './partei.model';
import { Person } from '../personen/person.model';

@Component({
  selector: 'app-parteien-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './parteien-verwaltung.component.html',
  styleUrl: './parteien-verwaltung.component.css',
})
export class ParteienVerwaltungComponent implements OnInit {
  private readonly parteiService = inject(ParteiService);
  private readonly personService = inject(PersonService);
  private readonly fb = inject(FormBuilder);

  parteien = signal<Partei[]>([]);
  readonly sort = createSortierung();
  sortierteParteien = computed(() =>
    sortiereItems(this.parteien(), this.sort.spalte(), this.sort.richtung(), (p, s) => {
      switch (s) {
        case 'bezeichnung': return p.bezeichnung;
        case 'adresse': return p.adresse;
        case 'twintAktiv': return p.twintAktiv ? 'Ja' : 'Nein';
        case 'twintMobilenummer': return p.twintMobilenummer;
        default: return '';
      }
    }),
  );
  allPersonen = signal<Person[]>([]);
  selectedPersonenIds = signal<Set<number>>(new Set());
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);
  formFehler = signal<string | null>(null);
  bearbeitungPartei = signal<Partei | null>(null);

  erfassenForm = this.fb.group({
    bezeichnung: ['', Validators.required],
    adresse: ['', Validators.required],
    twintAktiv: [false],
    twintMobilenummer: [''],
  });

  twintAktiv = toSignal(this.erfassenForm.get('twintAktiv')!.valueChanges, { initialValue: false });

  ngOnInit(): void {
    this.laden();
    this.personService.getAll().subscribe({
      next: personen => this.allPersonen.set(personen),
      error: () => this.fehler.set('Personen konnten nicht geladen werden.'),
    });
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.parteiService.getAll().subscribe({
      next: parteien => {
        this.parteien.set(parteien);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Parteien konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  togglePerson(id: number): void {
    const current = new Set(this.selectedPersonenIds());
    if (current.has(id)) {
      current.delete(id);
    } else {
      current.add(id);
    }
    this.selectedPersonenIds.set(current);
  }

  personAusgewaehlt(id: number): boolean {
    return this.selectedPersonenIds().has(id);
  }

  bearbeiten(partei: Partei): void {
    this.bearbeitungPartei.set(partei);
    this.erfassenForm.setValue({
      bezeichnung: partei.bezeichnung,
      adresse: partei.adresse,
      twintAktiv: partei.twintAktiv,
      twintMobilenummer: partei.twintMobilenummer ?? '',
    });
    this.selectedPersonenIds.set(new Set(partei.personen.map(p => p.id)));
    this.formFehler.set(null);
  }

  abbrechen(): void {
    this.bearbeitungPartei.set(null);
    this.erfassenForm.reset({ twintAktiv: false });
    this.selectedPersonenIds.set(new Set());
    this.formFehler.set(null);
  }

  speichern(): void {
    if (this.erfassenForm.invalid) {
      this.erfassenForm.markAllAsTouched();
      return;
    }
    this.formFehler.set(null);
    const { bezeichnung, adresse, twintAktiv, twintMobilenummer } = this.erfassenForm.value;
    const payload = {
      bezeichnung: bezeichnung!,
      adresse: adresse!,
      twintAktiv: twintAktiv ?? false,
      twintMobilenummer: twintAktiv && twintMobilenummer ? twintMobilenummer : undefined,
      personenIds: Array.from(this.selectedPersonenIds()),
    };

    const editPartei = this.bearbeitungPartei();
    if (editPartei) {
      this.parteiService.update(editPartei.id, payload).subscribe({
        next: () => {
          this.bearbeitungPartei.set(null);
          this.erfassenForm.reset({ twintAktiv: false });
          this.selectedPersonenIds.set(new Set());
          this.erfolg.set(`„${payload.bezeichnung}" wurde aktualisiert.`);
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Partei konnte nicht gespeichert werden.');
        },
      });
    } else {
      this.parteiService.create(payload).subscribe({
        next: () => {
          this.erfassenForm.reset({ twintAktiv: false });
          this.selectedPersonenIds.set(new Set());
          this.erfolg.set('Partei erfolgreich erfasst.');
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Partei konnte nicht gespeichert werden.');
        },
      });
    }
  }

  loeschen(partei: Partei): void {
    if (!confirm(`Partei „${partei.bezeichnung}" wirklich löschen?`)) return;
    this.parteiService.delete(partei.id).subscribe({
      next: () => {
        this.erfolg.set(`Partei „${partei.adresse}" wurde gelöscht.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Partei konnte nicht gelöscht werden.');
      },
    });
  }

  personenAnzeige(personen: Person[]): string {
    if (personen.length === 0) return '–';
    return personen.map(p => `${p.vorname} ${p.name}`).join(', ');
  }

  feldUngueltig(feld: string): boolean {
    const control = this.erfassenForm.get(feld);
    return !!control && control.invalid && control.touched;
  }
}
