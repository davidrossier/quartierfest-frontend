import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BenutzerService } from './benutzer.service';
import { Benutzer, BenutzerPayload } from './benutzer.model';
import { ParteiService } from '../parteien/partei.service';
import { Partei } from '../parteien/partei.model';
import { Rolle } from '../auth/auth.service';

/** UC-015: Benutzerverwaltung — nur für ORGANISATOR (Route Guard). */
@Component({
  selector: 'app-benutzer-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './benutzer-verwaltung.component.html',
  styleUrl: './benutzer-verwaltung.component.css',
})
export class BenutzerVerwaltungComponent implements OnInit {
  private readonly benutzerService = inject(BenutzerService);
  private readonly parteiService = inject(ParteiService);
  private readonly fb = inject(FormBuilder);

  benutzer = signal<Benutzer[]>([]);
  parteien = signal<Partei[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);

  erfassenForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    passwort: ['', [Validators.required, Validators.minLength(10)]],
    rolle: ['PARTEI' as Rolle, Validators.required],
    parteiId: [null as number | null],
  });

  ngOnInit(): void {
    this.laden();
    this.parteiService.getAll().subscribe({
      next: (parteien) => this.parteien.set(parteien),
      error: () => this.fehler.set('Parteien konnten nicht geladen werden.'),
    });
  }

  laden(): void {
    this.benutzerService.getAll().subscribe({
      next: (benutzer) => this.benutzer.set(benutzer),
      error: () => this.fehler.set('Benutzer konnten nicht geladen werden.'),
    });
  }

  erstellen(): void {
    if (this.erfassenForm.invalid) {
      this.erfassenForm.markAllAsTouched();
      return;
    }
    const { email, passwort, rolle, parteiId } = this.erfassenForm.getRawValue();
    if (rolle === 'PARTEI' && !parteiId) {
      this.fehler.set('Für die Rolle PARTEI muss eine Partei zugeordnet werden.');
      return;
    }
    const payload: BenutzerPayload = {
      email: email!,
      passwort: passwort!,
      rolle: rolle!,
      partei: rolle === 'PARTEI' && parteiId ? { id: parteiId } : null,
    };
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.erfolg.set(null);
    this.benutzerService.create(payload).subscribe({
      next: (neu) => {
        this.ladevorgang.set(false);
        this.erfolg.set(`Account ${neu.email} angelegt.`);
        this.erfassenForm.reset({ email: '', passwort: '', rolle: 'PARTEI', parteiId: null });
        this.laden();
      },
      error: (err) => {
        this.ladevorgang.set(false);
        this.fehler.set(
          err?.status === 409
            ? 'Für diese E-Mail-Adresse existiert bereits ein Account.'
            : 'Account konnte nicht angelegt werden.',
        );
      },
    });
  }

  passwortZuruecksetzen(benutzer: Benutzer): void {
    const neuesPasswort = window.prompt(
      `Neues Initialpasswort für ${benutzer.email} (mind. 10 Zeichen):`,
    );
    if (!neuesPasswort) return;
    if (neuesPasswort.length < 10) {
      this.fehler.set('Das Passwort muss mindestens 10 Zeichen lang sein.');
      return;
    }
    this.fehler.set(null);
    this.benutzerService.passwortSetzen(benutzer.id, neuesPasswort).subscribe({
      next: () => this.erfolg.set(`Passwort für ${benutzer.email} zurückgesetzt.`),
      error: () => this.fehler.set('Passwort konnte nicht zurückgesetzt werden.'),
    });
  }

  loeschen(benutzer: Benutzer): void {
    if (!window.confirm(`Account ${benutzer.email} wirklich löschen?`)) return;
    this.fehler.set(null);
    this.erfolg.set(null);
    this.benutzerService.delete(benutzer.id).subscribe({
      next: () => {
        this.erfolg.set(`Account ${benutzer.email} gelöscht.`);
        this.laden();
      },
      error: (err) =>
        this.fehler.set(
          err?.status === 409
            ? 'Der letzte Organisator-Account kann nicht gelöscht werden.'
            : 'Account konnte nicht gelöscht werden.',
        ),
    });
  }
}
