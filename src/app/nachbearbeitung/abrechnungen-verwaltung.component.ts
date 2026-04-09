import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { AbrechnungService } from './abrechnung.service';
import { TeilnahmeService } from '../teilnahmen/teilnahme.service';
import { AllgemeinausgabeService } from '../allgemeinausgaben/allgemeinausgabe.service';
import { KonsumationService } from '../konsumationen/konsumation.service';
import { ParteiService } from '../parteien/partei.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Abrechnung, ZustellungsKanal } from './abrechnung.model';

@Component({
  selector: 'app-abrechnungen-verwaltung',
  imports: [],
  templateUrl: './abrechnungen-verwaltung.component.html',
  styleUrl: './abrechnungen-verwaltung.component.css',
})
export class AbrechnungenVerwaltungComponent implements OnInit {
  private readonly abrechnungService = inject(AbrechnungService);
  private readonly teilnahmeService = inject(TeilnahmeService);
  private readonly ausgabeService = inject(AllgemeinausgabeService);
  private readonly konsumationService = inject(KonsumationService);
  private readonly parteiService = inject(ParteiService);
  readonly eventKontext = inject(EventKontextService);

  alleAbrechnungen = signal<Abrechnung[]>([]);
  ladevorgang = signal(false);
  erstelleVorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);

  // Ausstehende Kanal-Änderungen pro Abrechnung-ID
  kanalEdits = signal<Record<number, ZustellungsKanal>>({});

  abrechnungenFuerEvent = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleAbrechnungen().filter(
      a => a.teilnahme.einladung.event.id === eventId,
    );
  });

  readonly kanaele: { value: ZustellungsKanal; label: string }[] = [
    { value: 'TWINT', label: 'Twint' },
    { value: 'EMAIL', label: 'E-Mail' },
    { value: 'PAPIER', label: 'Papier' },
  ];

  ngOnInit(): void {
    this.laden();
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.abrechnungService.getAll().subscribe({
      next: abrechnungen => {
        this.alleAbrechnungen.set(abrechnungen);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Abrechnungen konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  abrechnungenErstellen(): void {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return;
    this.erstelleVorgang.set(true);
    this.fehler.set(null);

    forkJoin({
      teilnahmen: this.teilnahmeService.getAll(),
      ausgaben: this.ausgabeService.getAll(),
      konsumationen: this.konsumationService.getAll(),
      parteien: this.parteiService.getAll(),
    }).subscribe({
      next: ({ teilnahmen, ausgaben, konsumationen, parteien }) => {
        const evtTeilnahmen = teilnahmen.filter(t => t.einladung.event.id === eventId);
        if (evtTeilnahmen.length === 0) {
          this.fehler.set('Keine Teilnahmen mit effektiver Personenzahl vorhanden.');
          this.erstelleVorgang.set(false);
          return;
        }

        const gesamtPersonen = evtTeilnahmen.reduce(
          (sum, t) => sum + (t.anzahlPersonenEffektiv ?? 0), 0,
        );
        const totalAusgaben = ausgaben
          .filter(a => a.event.id === eventId)
          .reduce((sum, a) => sum + a.betrag, 0);
        const kostenProPerson = gesamtPersonen > 0 ? totalAusgaben / gesamtPersonen : 0;

        const parteiMap = new Map(parteien.map(p => [p.id, p]));

        const konsumationTotals = new Map<number, number>();
        for (const k of konsumationen.filter(k => k.teilnahme.einladung.event.id === eventId)) {
          const prev = konsumationTotals.get(k.teilnahme.id) ?? 0;
          konsumationTotals.set(k.teilnahme.id, prev + k.anzahl * k.konsumationsangebot.preis);
        }

        const payloads = evtTeilnahmen.map(t => {
          const partei = parteiMap.get(t.einladung.partei.id);
          const anteil = kostenProPerson * (t.anzahlPersonenEffektiv ?? 0);
          const konsumation = konsumationTotals.get(t.id) ?? 0;
          return {
            teilnahme: { id: t.id },
            anteilAllgemeinkosten: anteil,
            totalKonsumation: konsumation,
            totalBetrag: anteil + konsumation,
            zustellungskanal: (partei?.twintAktiv ? 'TWINT' : 'EMAIL') as ZustellungsKanal,
          };
        });

        forkJoin(payloads.map(p => this.abrechnungService.save(p))).subscribe({
          next: () => {
            this.erfolg.set('Abrechnungen wurden erstellt.');
            this.erstelleVorgang.set(false);
            this.laden();
            setTimeout(() => this.erfolg.set(null), 3000);
          },
          error: (err: HttpErrorResponse) => {
            this.fehler.set(err.error?.message ?? 'Abrechnungen konnten nicht erstellt werden.');
            this.erstelleVorgang.set(false);
          },
        });
      },
      error: () => {
        this.fehler.set('Daten konnten nicht geladen werden.');
        this.erstelleVorgang.set(false);
      },
    });
  }

  neuBerechnen(): void {
    const bestehende = this.abrechnungenFuerEvent();
    if (bestehende.length === 0) return;
    this.erstelleVorgang.set(true);
    forkJoin(bestehende.map(a => this.abrechnungService.delete(a.id))).subscribe({
      next: () => {
        this.alleAbrechnungen.update(all =>
          all.filter(a => a.teilnahme.einladung.event.id !== this.eventKontext.selectedEventId()),
        );
        this.abrechnungenErstellen();
      },
      error: () => {
        this.fehler.set('Bestehende Abrechnungen konnten nicht gelöscht werden.');
        this.erstelleVorgang.set(false);
      },
    });
  }

  kanalAendern(abrechnungId: number, kanal: ZustellungsKanal): void {
    this.kanalEdits.update(m => ({ ...m, [abrechnungId]: kanal }));
  }

  kanalSpeichern(abrechnung: Abrechnung): void {
    const kanal = this.kanalEdits()[abrechnung.id];
    if (!kanal) return;
    this.abrechnungService
      .save({
        id: abrechnung.id,
        teilnahme: { id: abrechnung.teilnahme.id },
        anteilAllgemeinkosten: abrechnung.anteilAllgemeinkosten,
        totalKonsumation: abrechnung.totalKonsumation,
        totalBetrag: abrechnung.totalBetrag,
        zustellungskanal: kanal,
        zustellungsDatum: abrechnung.zustellungsDatum,
      })
      .subscribe({
        next: () => {
          this.kanalEdits.update(m => {
            const n = { ...m };
            delete n[abrechnung.id];
            return n;
          });
          this.laden();
        },
        error: (err: HttpErrorResponse) => {
          this.fehler.set(err.error?.message ?? 'Zustellungskanal konnte nicht gespeichert werden.');
        },
      });
  }

  alsZugestelltMarkieren(abrechnung: Abrechnung): void {
    this.abrechnungService
      .save({
        id: abrechnung.id,
        teilnahme: { id: abrechnung.teilnahme.id },
        anteilAllgemeinkosten: abrechnung.anteilAllgemeinkosten,
        totalKonsumation: abrechnung.totalKonsumation,
        totalBetrag: abrechnung.totalBetrag,
        zustellungskanal: this.kanalEdits()[abrechnung.id] ?? abrechnung.zustellungskanal,
        zustellungsDatum: new Date().toISOString().substring(0, 10),
      })
      .subscribe({
        next: () => this.laden(),
        error: (err: HttpErrorResponse) => {
          this.fehler.set(err.error?.message ?? 'Abrechnung konnte nicht aktualisiert werden.');
        },
      });
  }

  loeschen(abrechnung: Abrechnung): void {
    if (!confirm(`Abrechnung für „${abrechnung.teilnahme.einladung.partei.bezeichnung}" wirklich löschen?`))
      return;
    this.abrechnungService.delete(abrechnung.id).subscribe({
      next: () => this.laden(),
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Abrechnung konnte nicht gelöscht werden.');
      },
    });
  }

  getKanal(abrechnung: Abrechnung): ZustellungsKanal {
    return this.kanalEdits()[abrechnung.id] ?? abrechnung.zustellungskanal;
  }

  kanalGeaendert(abrechnung: Abrechnung): boolean {
    const edit = this.kanalEdits()[abrechnung.id];
    return !!edit && edit !== abrechnung.zustellungskanal;
  }

  datumAnzeige(datum: string): string {
    const [y, m, d] = datum.split('-');
    return `${d}.${m}.${y}`;
  }

  betragAnzeige(betrag: number): string {
    return `CHF ${betrag.toFixed(2)}`;
  }

  kanalLabel(kanal: ZustellungsKanal): string {
    return this.kanaele.find(k => k.value === kanal)?.label ?? kanal;
  }
}
