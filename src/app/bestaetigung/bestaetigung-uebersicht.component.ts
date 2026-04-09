import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { EinladungService } from '../einladungen/einladung.service';
import { KonsumationsangebotService } from '../konsumationsangebote/konsumationsangebot.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Einladung, BuffetBeitrag } from '../einladungen/einladung.model';
import { Konsumationsangebot } from '../konsumationsangebote/konsumationsangebot.model';

@Component({
  selector: 'app-bestaetigung-uebersicht',
  imports: [],
  templateUrl: './bestaetigung-uebersicht.component.html',
  styleUrl: './bestaetigung-uebersicht.component.css',
})
export class BestaetigungUebersichtComponent implements OnInit {
  private readonly einladungService = inject(EinladungService);
  private readonly angebotService = inject(KonsumationsangebotService);
  readonly eventKontext = inject(EventKontextService);

  alleEinladungen = signal<Einladung[]>([]);
  alleAngebote = signal<Konsumationsangebot[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);

  angemeldeteEinladungen = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleEinladungen().filter(e => e.event.id === eventId && e.status === 'ANGEMELDET');
  });

  angeboteFuerEvent = computed(() => {
    const eventId = this.eventKontext.selectedEventId();
    if (!eventId) return [];
    return this.alleAngebote().filter(a => a.event.id === eventId);
  });

  keinAngebot = computed(() => this.eventKontext.selectedEventId() != null && this.angeboteFuerEvent().length === 0);

  buffetZusammenstellung = computed(() => {
    const gruppen = new Map<BuffetBeitrag, string[]>();
    for (const e of this.angemeldeteEinladungen()) {
      if (!e.buffetBeitrag || e.buffetBeitrag === 'KEINER') continue;
      if (!gruppen.has(e.buffetBeitrag)) gruppen.set(e.buffetBeitrag, []);
      const beschreibung =
        e.buffetBeitrag === 'WEITERE' && e.buffetBeitragBeschreibung
          ? `${e.partei.bezeichnung} (${e.buffetBeitragBeschreibung})`
          : e.partei.bezeichnung;
      gruppen.get(e.buffetBeitrag)!.push(beschreibung);
    }
    return Array.from(gruppen.entries()).map(([beitrag, parteien]) => ({ beitrag, parteien }));
  });

  unversendeteAnzahl = computed(
    () => this.angemeldeteEinladungen().filter(e => !e.bestaetigungVersendet).length,
  );

  ngOnInit(): void {
    this.laden();
    this.angebotService.getAll().subscribe({
      next: angebote => this.alleAngebote.set(angebote),
      error: () => this.fehler.set('Konsumationsangebote konnten nicht geladen werden.'),
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

  markiereVersendet(einladung: Einladung): void {
    this.einladungService
      .save({
        id: einladung.id,
        event: { id: einladung.event.id },
        partei: { id: einladung.partei.id },
        status: einladung.status,
        anzahlPersonen: einladung.anzahlPersonen,
        hilftAufstellen: einladung.hilftAufstellen,
        hilftAufraumen: einladung.hilftAufraumen,
        buffetBeitrag: einladung.buffetBeitrag,
        buffetBeitragBeschreibung: einladung.buffetBeitragBeschreibung,
        bestaetigungVersendet: true,
      })
      .subscribe({
        next: () => {
          this.erfolg.set(`Bestätigung für „${einladung.partei.bezeichnung}" als versendet markiert.`);
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.fehler.set(err.error?.message ?? 'Markierung konnte nicht gespeichert werden.');
        },
      });
  }

  alleMarkieren(): void {
    const unversendet = this.angemeldeteEinladungen().filter(e => !e.bestaetigungVersendet);
    if (unversendet.length === 0) return;

    forkJoin(
      unversendet.map(e =>
        this.einladungService.save({
          id: e.id,
          event: { id: e.event.id },
          partei: { id: e.partei.id },
          status: e.status,
          anzahlPersonen: e.anzahlPersonen,
          hilftAufstellen: e.hilftAufstellen,
          hilftAufraumen: e.hilftAufraumen,
          buffetBeitrag: e.buffetBeitrag,
          buffetBeitragBeschreibung: e.buffetBeitragBeschreibung,
          bestaetigungVersendet: true,
        }),
      ),
    ).subscribe({
      next: () => {
        this.erfolg.set(`${unversendet.length} Bestätigung(en) als versendet markiert.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(err.error?.message ?? 'Markierung konnte nicht gespeichert werden.');
        this.laden();
      },
    });
  }

  zeitAnzeige(zeit?: string): string {
    return zeit ?? '–';
  }

  buffetLabel(beitrag: BuffetBeitrag): string {
    switch (beitrag) {
      case 'SALAT': return 'Salat';
      case 'BROT_ZOPF': return 'Brot/Zopf';
      case 'DESSERT': return 'Dessert';
      case 'WEITERE': return 'Weitere';
      default: return beitrag;
    }
  }

  preisAnzeige(preis: number): string {
    return `CHF ${preis.toFixed(2)}`;
  }
}
