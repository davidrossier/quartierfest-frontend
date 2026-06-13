import { Component, OnInit, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TeilnahmeService } from '../teilnahmen/teilnahme.service';
import { Teilnahme, TeilnahmeUpdatePayload } from '../teilnahmen/teilnahme.model';
import { BuffetBeitrag } from '../einladungen/einladung.model';

/** UC-016: «Meine Teilnahme» — nur für Rolle PARTEI (Route Guard). */
@Component({
  selector: 'app-meine-teilnahme',
  imports: [ReactiveFormsModule],
  templateUrl: './meine-teilnahme.component.html',
  styleUrl: './meine-teilnahme.component.css',
})
export class MeineTeilnahmeComponent implements OnInit {
  private readonly teilnahmeService = inject(TeilnahmeService);
  private readonly fb = inject(FormBuilder);

  readonly buffetArten: BuffetBeitrag[] = ['KEINER', 'SALAT', 'BROT_ZOPF', 'DESSERT', 'WEITERE'];

  teilnahme = signal<Teilnahme | null>(null);
  keineTeilnahme = signal(false);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);

  form = this.fb.group({
    anzahlPersonenEffektiv: [null as number | null],
    hilftAufstellen: [false],
    hilftAufraumen: [false],
    buffetBeitraege: this.fb.array<FormGroup>([]),
  });

  get buffetBeitraege(): FormArray<FormGroup> {
    return this.form.controls.buffetBeitraege;
  }

  ngOnInit(): void {
    this.teilnahmeService.getMeine().subscribe({
      next: (teilnahme) => {
        this.teilnahme.set(teilnahme);
        this.formBefuellen(teilnahme);
      },
      error: (err) => {
        if (err?.status === 404) {
          this.keineTeilnahme.set(true);
        } else {
          this.fehler.set('Ihre Teilnahme konnte nicht geladen werden.');
        }
      },
    });
  }

  private formBefuellen(teilnahme: Teilnahme): void {
    this.form.patchValue({
      anzahlPersonenEffektiv: teilnahme.anzahlPersonenEffektiv ?? null,
      hilftAufstellen: teilnahme.hilftAufstellen ?? false,
      hilftAufraumen: teilnahme.hilftAufraumen ?? false,
    });
    this.buffetBeitraege.clear();
    for (const beitrag of teilnahme.buffetBeitraege) {
      this.buffetBeitraege.push(this.beitragGroup(beitrag.art, beitrag.beschreibung));
    }
  }

  private beitragGroup(art: BuffetBeitrag = 'SALAT', beschreibung = ''): FormGroup {
    return this.fb.group({ art: [art], beschreibung: [beschreibung ?? ''] });
  }

  beitragHinzufuegen(): void {
    this.buffetBeitraege.push(this.beitragGroup());
  }

  beitragEntfernen(index: number): void {
    this.buffetBeitraege.removeAt(index);
  }

  speichern(): void {
    const teilnahme = this.teilnahme();
    if (!teilnahme) return;
    const { anzahlPersonenEffektiv, hilftAufstellen, hilftAufraumen } = this.form.getRawValue();
    const payload: TeilnahmeUpdatePayload = {
      anzahlPersonenEffektiv: anzahlPersonenEffektiv ?? undefined,
      hilftAufstellen: hilftAufstellen ?? false,
      hilftAufraumen: hilftAufraumen ?? false,
      buffetBeitraege: this.buffetBeitraege.getRawValue() as TeilnahmeUpdatePayload['buffetBeitraege'],
    };
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.erfolg.set(null);
    this.teilnahmeService.update(teilnahme.id, payload).subscribe({
      next: (aktualisiert) => {
        this.ladevorgang.set(false);
        this.teilnahme.set(aktualisiert);
        this.formBefuellen(aktualisiert);
        this.erfolg.set('Ihre Angaben wurden gespeichert.');
      },
      error: () => {
        this.ladevorgang.set(false);
        this.fehler.set('Speichern fehlgeschlagen. Bitte versuchen Sie es erneut.');
      },
    });
  }
}
