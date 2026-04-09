import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive, ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { EventService } from '../events/event.service';
import { EventKontextService } from './event-kontext.service';

@Component({
  selector: 'app-event-kontext-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './event-kontext-layout.component.html',
  styleUrl: './event-kontext-layout.component.css',
})
export class EventKontextLayoutComponent implements OnInit {
  readonly eventKontextService = inject(EventKontextService);
  private readonly eventService = inject(EventService);
  readonly gruppe = toSignal(
    inject(ActivatedRoute).data.pipe(map(d => d['gruppe'] as string)),
  );

  ngOnInit(): void {
    this.eventService.getAll().subscribe({
      next: events => this.eventKontextService.events.set(events),
    });
  }

  eventWechseln(e: Event): void {
    const value = (e.target as HTMLSelectElement).value;
    this.eventKontextService.selectedEventId.set(value ? Number(value) : null);
  }

  datumAnzeige(datum: string): string {
    if (!datum) return '–';
    const [year, month, day] = datum.split('-');
    return `${day}.${month}.${year}`;
  }
}
