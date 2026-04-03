import { Component, inject, OnInit, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { PersonService } from './person.service';
import { Person } from './person.model';

@Component({
  selector: 'app-personen-verwaltung',
  imports: [ReactiveFormsModule],
  templateUrl: './personen-verwaltung.component.html',
  styleUrl: './personen-verwaltung.component.css',
})
export class PersonenVerwaltungComponent implements OnInit {
  private readonly personService = inject(PersonService);
  private readonly fb = inject(FormBuilder);

  personen = signal<Person[]>([]);
  ladevorgang = signal(false);
  fehler = signal<string | null>(null);
  erfolg = signal<string | null>(null);
  formFehler = signal<string | null>(null);
  bearbeitungPerson = signal<Person | null>(null);

  erfassenForm = this.fb.group({
    vorname: ['', Validators.required],
    name: ['', Validators.required],
    telefonnummer: [''],
    mobilenummer: [''],
    email: ['', Validators.email],
  });

  ngOnInit(): void {
    this.laden();
  }

  laden(): void {
    this.ladevorgang.set(true);
    this.fehler.set(null);
    this.personService.getAll().subscribe({
      next: personen => {
        this.personen.set(personen);
        this.ladevorgang.set(false);
      },
      error: () => {
        this.fehler.set('Personen konnten nicht geladen werden.');
        this.ladevorgang.set(false);
      },
    });
  }

  bearbeiten(person: Person): void {
    this.bearbeitungPerson.set(person);
    this.erfassenForm.setValue({
      vorname: person.vorname,
      name: person.name,
      telefonnummer: person.telefonnummer ?? '',
      mobilenummer: person.mobilenummer ?? '',
      email: person.email ?? '',
    });
    this.formFehler.set(null);
  }

  abbrechen(): void {
    this.bearbeitungPerson.set(null);
    this.erfassenForm.reset();
    this.formFehler.set(null);
  }

  speichern(): void {
    if (this.erfassenForm.invalid) {
      this.erfassenForm.markAllAsTouched();
      return;
    }
    this.formFehler.set(null);
    const { vorname, name, telefonnummer, mobilenummer, email } = this.erfassenForm.value;
    const payload = {
      vorname: vorname!,
      name: name!,
      telefonnummer: telefonnummer || undefined,
      mobilenummer: mobilenummer || undefined,
      email: email || undefined,
    };

    const editPerson = this.bearbeitungPerson();
    if (editPerson) {
      this.personService.update(editPerson.id, payload).subscribe({
        next: () => {
          this.bearbeitungPerson.set(null);
          this.erfassenForm.reset();
          this.erfolg.set(`„${payload.vorname} ${payload.name}" wurde aktualisiert.`);
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Person konnte nicht gespeichert werden.');
        },
      });
    } else {
      this.personService.create(payload).subscribe({
        next: () => {
          this.erfassenForm.reset();
          this.erfolg.set('Person erfolgreich erfasst.');
          this.laden();
          setTimeout(() => this.erfolg.set(null), 3000);
        },
        error: (err: HttpErrorResponse) => {
          this.formFehler.set(err.error?.message ?? 'Person konnte nicht gespeichert werden.');
        },
      });
    }
  }

  loeschen(person: Person): void {
    if (!confirm(`Person „${person.vorname} ${person.name}" wirklich löschen?`)) return;
    this.personService.delete(person.id).subscribe({
      next: () => {
        this.erfolg.set(`„${person.vorname} ${person.name}" wurde gelöscht.`);
        this.laden();
        setTimeout(() => this.erfolg.set(null), 3000);
      },
      error: (err: HttpErrorResponse) => {
        this.fehler.set(
          err.error?.message ?? 'Person konnte nicht gelöscht werden. Möglicherweise ist sie einer Partei zugeordnet.',
        );
      },
    });
  }

  feldUngueltig(feld: string): boolean {
    const control = this.erfassenForm.get(feld);
    return !!control && control.invalid && control.touched;
  }
}
