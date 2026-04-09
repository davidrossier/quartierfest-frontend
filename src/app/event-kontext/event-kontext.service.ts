import { computed, Injectable, signal } from '@angular/core';
import { Event as QuartierfestEvent } from '../events/event.model';

@Injectable({ providedIn: 'root' })
export class EventKontextService {
  readonly events = signal<QuartierfestEvent[]>([]);
  readonly selectedEventId = signal<number | null>(null);

  readonly selectedEvent = computed(() => {
    const id = this.selectedEventId();
    if (!id) return null;
    return this.events().find(e => e.id === id) ?? null;
  });
}
