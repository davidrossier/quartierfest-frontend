import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { TeilnahmeService } from '../teilnahmen/teilnahme.service';
import { KonsumationsangebotService } from '../konsumationsangebote/konsumationsangebot.service';
import { EventKontextService } from '../event-kontext/event-kontext.service';
import { Teilnahme } from '../teilnahmen/teilnahme.model';
import { Konsumationsangebot } from '../konsumationsangebote/konsumationsangebot.model';

@Component({
  selector: 'app-konsumationsliste',
  imports: [],
  templateUrl: './konsumationsliste.component.html',
  styleUrl: './konsumationsliste.component.css',
})
export class KonsumationslisteComponent implements OnInit {
  private readonly teilnahmeService = inject(TeilnahmeService);
  private readonly angebotService = inject(KonsumationsangebotService);
  readonly eventKontext = inject(EventKontextService);

  alleTeilnahmen = signal<Teilnahme[]>([]);
  alleAngebote = signal<Konsumationsangebot[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);

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
    this.ladevorgang.set(true);
    this.fehler.set(null);
    let geladen = 0;
    const fertig = () => {
      geladen++;
      if (geladen === 2) this.ladevorgang.set(false);
    };
    this.teilnahmeService.getAll().subscribe({
      next: t => { this.alleTeilnahmen.set(t); fertig(); },
      error: () => { this.fehler.set('Teilnahmen konnten nicht geladen werden.'); fertig(); },
    });
    this.angebotService.getAll().subscribe({
      next: a => { this.alleAngebote.set(a); fertig(); },
      error: () => { this.fehler.set('Konsumationsangebote konnten nicht geladen werden.'); fertig(); },
    });
  }

  drucken(): void {
    window.print();
  }

  preisAnzeige(preis: number): string {
    return `CHF ${preis.toFixed(2)}`;
  }

  datumAnzeige(datum: string): string {
    return new Date(datum).toLocaleDateString('de-CH');
  }
}
