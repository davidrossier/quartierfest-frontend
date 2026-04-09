import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AbrechnungService } from './abrechnung.service';
import { ZahlungService } from './zahlung.service';
import { MahnungService } from './mahnung.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Abrechnung } from './abrechnung.model';
import { Zahlung } from './zahlung.model';
import { Mahnung } from './mahnung.model';

@Component({
  selector: 'app-inkasso-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './inkasso-verwaltung.component.html',
  styleUrl: './inkasso-verwaltung.component.css',
})
export class InkassoVerwaltungComponent implements OnInit {
  private readonly abrechnungService = inject(AbrechnungService);
  private readonly zahlungService = inject(ZahlungService);
  private readonly mahnungService = inject(MahnungService);
  private readonly fb = inject(FormBuilder);
  readonly eventKontext = inject(EventKontextService);

  alleAbrechnungen = signal<Abrechnung[]>([]);
  alleZahlungen = signal<Zahlung[]>([]);
  alleMahnungen = signal<Mahnung[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);

  expandierteId = signal<number | null>(null);
  aktiveZahlungId = signal<number | null>(null);
  aktiveMahnungId = signal<number | null>(null);
  zahlungFehler = signal<string | null>(null);
  mahnungFehler = signal<string | null>(null);

  zahlungForm = this.fb.group({
    zahlungskanal: ['TWINT' as string, Validators.required],
    datum: [new Date().toISOString().substring(0, 10), Validators.required],
    betrag: [null as number | null, [Validators.required, Validators.min(0.01)]],
  });

  mahnungForm = this.fb.group({
    datum: [new Date().toISOString().substring(0, 10), Validators.required],
    bemerkung: [''],
  });

  abrechnungenFuerEvent = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleAbrechnungen().filter(a => a.teilnahme.einladung.event.id === eventId);
  });

  zahlungenByAbrechnung = computed(() => {
    const abrIds = new Set(this.abrechnungenFuerEvent().map(a => a.id));
    const map: Record<number, Zahlung[]> = {};
    for (const z of this.alleZahlungen()) {
      if (!abrIds.has(z.abrechnung.id)) continue;
      if (!map[z.abrechnung.id]) map[z.abrechnung.id] = [];
      map[z.abrechnung.id].push(z);
    }
    return map;
  });

  mahnungenByAbrechnung = computed(() => {
    const abrIds = new Set(this.abrechnungenFuerEvent().map(a => a.id));
    const map: Record<number, Mahnung[]> = {};
    for (const m of this.alleMahnungen()) {
      if (!abrIds.has(m.abrechnung.id)) continue;
      if (!map[m.abrechnung.id]) map[m.abrechnung.id] = [];
      map[m.abrechnung.id].push(m);
    }
    return map;
  });

  ngOnInit(): void {
    this.laden();
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    forkJoin({
      abrechnungen: this.abrechnungService.getAll(),
      zahlungen: this.zahlungService.getAll(),
      mahnungen: this.mahnungService.getAll(),
    }).subscribe({
      next: ({ abrechnungen, zahlungen, mahnungen }) => {
        this.alleAbrechnungen.set(abrechnungen);
        this.alleZahlungen.set(zahlungen);
        this.alleMahnungen.set(mahnungen);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Daten konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  bezahlt(abrechnungId: number): number {
    return (this.zahlungenByAbrechnung()[abrechnungId] ?? []).reduce(
      (sum, z) => sum + z.betrag, 0,
    );
  }

  offen(abrechnung: Abrechnung): number {
    return abrechnung.totalBetrag - this.bezahlt(abrechnung.id);
  }

  toggleExpand(id: number): void {
    if (this.expandierteId() === id) {
      this.expandierteId.set(null);
      this.aktiveZahlungId.set(null);
      this.aktiveMahnungId.set(null);
    } else {
      this.expandierteId.set(id);
      this.aktiveZahlungId.set(null);
      this.aktiveMahnungId.set(null);
    }
  }

  zahlungFormOeffnen(abrechnungId: number): void {
    this.aktiveZahlungId.set(abrechnungId);
    this.aktiveMahnungId.set(null);
    this.zahlungFehler.set(null);
    this.zahlungForm.reset({
      zahlungskanal: 'TWINT',
      datum: new Date().toISOString().substring(0, 10),
      betrag: null,
    });
  }

  mahnungFormOeffnen(abrechnungId: number): void {
    this.aktiveMahnungId.set(abrechnungId);
    this.aktiveZahlungId.set(null);
    this.mahnungFehler.set(null);
    this.mahnungForm.reset({
      datum: new Date().toISOString().substring(0, 10),
      bemerkung: '',
    });
  }

  zahlungSpeichern(abrechnung: Abrechnung): void {
    if (this.zahlungForm.invalid) {
      this.zahlungForm.markAllAsTouched();
      return;
    }
    const { zahlungskanal, datum, betrag } = this.zahlungForm.value;
    this.zahlungService
      .save({
        abrechnung: { id: abrechnung.id },
        zahlungskanal: zahlungskanal as any,
        datum: datum!,
        betrag: Number(betrag),
      })
      .subscribe({
        next: () => {
          this.aktiveZahlungId.set(null);
          this.laden();
        },
        error: (err: HttpErrorResponse) => {
          this.zahlungFehler.set(err.error?.message ?? 'Zahlung konnte nicht gespeichert werden.');
        },
      });
  }

  zahlungLoeschen(zahlung: Zahlung): void {
    if (!confirm('Zahlung wirklich löschen?')) return;
    this.zahlungService.delete(zahlung.id).subscribe({
      next: () => this.laden(),
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Zahlung konnte nicht gelöscht werden.');
      },
    });
  }

  mahnungSpeichern(abrechnung: Abrechnung): void {
    if (this.mahnungForm.invalid) {
      this.mahnungForm.markAllAsTouched();
      return;
    }
    const { datum, bemerkung } = this.mahnungForm.value;
    this.mahnungService
      .save({
        abrechnung: { id: abrechnung.id },
        datum: datum!,
        bemerkung: bemerkung || undefined,
      })
      .subscribe({
        next: () => {
          this.aktiveMahnungId.set(null);
          this.laden();
        },
        error: (err: HttpErrorResponse) => {
          this.mahnungFehler.set(err.error?.message ?? 'Mahnung konnte nicht gespeichert werden.');
        },
      });
  }

  mahnungLoeschen(mahnung: Mahnung): void {
    if (!confirm('Mahnung wirklich löschen?')) return;
    this.mahnungService.delete(mahnung.id).subscribe({
      next: () => this.laden(),
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Mahnung konnte nicht gelöscht werden.');
      },
    });
  }

  zahlungsFeldUngueltig(feld: string): boolean {
    const c = this.zahlungForm.get(feld);
    return !!c && c.invalid && c.touched;
  }

  mahnungsFeldUngueltig(feld: string): boolean {
    const c = this.mahnungForm.get(feld);
    return !!c && c.invalid && c.touched;
  }

  datumAnzeige(datum: string): string {
    const [y, m, d] = datum.split('-');
    return `${d}.${m}.${y}`;
  }

  betragAnzeige(betrag: number): string {
    return `CHF ${betrag.toFixed(2)}`;
  }
}
