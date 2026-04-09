---
name: ui-design
description: Wende UI-Design auf Angular-Komponenten an, orientiert am Galaxus Design System (https://www.galaxus.ch/designsystem)
---

# UI Design Guidelines – orientiert am Galaxus Design System

Referenz: https://www.galaxus.ch/designsystem

---

## Design-Prinzipien

Galaxus folgt einem **funktionalen, klaren Design** das Inhalte in den Vordergrund stellt:

- **Klarheit vor Dekoration** – UI-Elemente haben einen Zweck, kein Ornament
- **Konsistenz** – Gleiche Muster für gleiche Aktionen (z.B. immer gleiche Buttons für primäre Aktionen)
- **Zugänglichkeit** – Ausreichende Kontraste (WCAG AA minimum), semantisches HTML
- **Responsive-first** – Layout funktioniert auf allen Bildschirmgrössen
- **Effizienz** – Nutzer kommen schnell zu ihrem Ziel; keine unnötigen Schritte

---

## Farben

Galaxus verwendet ein **neutrales Basisschema** mit sparsamen Akzentfarben.

```css
:root {
  /* Neutrals (dominant) */
  --color-background:     #ffffff;
  --color-surface:        #f8f8f8;   /* Cards, Panels */
  --color-border:         #e0e0e0;
  --color-text-primary:   #1a1a1a;
  --color-text-secondary: #666666;
  --color-text-disabled:  #aaaaaa;

  /* Galaxus Brand */
  --color-primary:        #ff6600;   /* Galaxus Orange – nur für CTAs */
  --color-primary-hover:  #e05a00;

  /* Semantische Farben */
  --color-success:        #2e7d32;
  --color-success-bg:     #e8f5e9;
  --color-error:          #c62828;
  --color-error-bg:       #ffebee;
  --color-warning:        #f57f17;
  --color-warning-bg:     #fff8e1;
  --color-info:           #1565c0;
  --color-info-bg:        #e3f2fd;
}
```

**Regeln:**
- Primärfarbe (Orange) nur für die **eine** wichtigste Aktion pro Seite
- Niemals mehrere verschiedenfarbige Buttons auf derselben Seite
- Text auf weissem Hintergrund: mindestens `#666666` für sekundären Text

---

## Typografie

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

  /* UI Type Scale */
  --font-size-xs:   12px;   /* Labels, Badges, Metainfo */
  --font-size-sm:   14px;   /* Sekundärtext, Tabelleninhalte */
  --font-size-md:   16px;   /* Standardtext, Inputs */
  --font-size-lg:   18px;   /* Subtitel, Kartentitel */
  --font-size-xl:   22px;   /* Seitentitel */
  --font-size-2xl:  28px;   /* Hauptüberschriften */

  --font-weight-regular: 400;
  --font-weight-medium:  500;
  --font-weight-bold:    700;

  --line-height-tight:  1.2;
  --line-height-normal: 1.5;
  --line-height-loose:  1.75;
}
```

**Regeln:**
- Maximal **3 verschiedene Schriftgrössen** pro Seite/Komponente
- Überschriften: `bold` (`700`), Fliesstext: `regular` (`400`)
- Keine Kursivschrift in UI-Elementen

---

## Spacing

Galaxus basiert auf einem **8px-Grid**. Alle Abstände sind Vielfache von 4px.

```css
:root {
  --space-1:  4px;
  --space-2:  8px;
  --space-3:  12px;
  --space-4:  16px;
  --space-5:  20px;
  --space-6:  24px;
  --space-8:  32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
}
```

**Regeln:**
- Innen-Abstände (Padding) von Komponenten: mindestens `--space-4` (16px)
- Zwischen Formularelementen: `--space-6` (24px)
- Section-Abstände auf einer Seite: `--space-10` bis `--space-16`

---

## Grid-System

```css
:root {
  --grid-columns: 12;
  --grid-gutter:  16px;   /* Mobile */
}

/* Breakpoints */
/* xs:  < 576px  – 1 Spalte, kein Gutter */
/* sm:  ≥ 576px  – 2 Spalten */
/* md:  ≥ 768px  – gutter: 24px */
/* lg:  ≥ 1024px – gutter: 32px */
/* xl:  ≥ 1280px – max-width: 1280px, zentriert */
```

---

## Border-Radius & Schatten

```css
:root {
  --radius-sm:  4px;
  --radius-md:  8px;
  --radius-lg:  12px;
  --radius-full: 9999px;

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
  --shadow-md: 0 2px 8px rgba(0,0,0,0.10);
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);
}
```

---

## Navigationsstruktur

Die Navigation spiegelt die **UC-Package-Struktur** des Use-Case-Diagramms wider. Jedes Package ist eine eigene Gruppe in der Top-Navigation.

```html
<!-- app.html -->
<nav class="app-nav">
  <span class="app-nav__brand">Quartierfest</span>

  <div class="nav-group">
    <span class="nav-group__label">Stammdaten</span>
    <a routerLink="/personen" routerLinkActive="app-nav__link--active">Personen</a>
    <a routerLink="/parteien" routerLinkActive="app-nav__link--active">Parteien</a>
  </div>

  <div class="nav-separator"></div>

  <div class="nav-group">
    <span class="nav-group__label">Event-Planung</span>
    <a routerLink="/events" routerLinkActive="app-nav__link--active">Events</a>
    <a routerLink="/planung" routerLinkActive="app-nav__link--active">Planung</a>
  </div>

  <div class="nav-separator"></div>

  <!-- Weitere Packages analog -->
</nav>
```

```css
.app-header { background: var(--color-text-primary); position: sticky; top: 0; z-index: 100; }
.app-nav { max-width: 1280px; margin: 0 auto; padding: 0 var(--space-4); display: flex; align-items: center; gap: var(--space-4); height: 56px; }
.app-nav__brand { font-weight: var(--font-weight-bold); font-size: var(--font-size-lg); color: #ffffff; }
.nav-group { display: flex; align-items: center; gap: var(--space-3); }
.nav-group__label { font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); color: rgba(255,255,255,0.35); text-transform: uppercase; letter-spacing: 0.08em; }
.nav-separator { width: 1px; height: 20px; background: rgba(255,255,255,0.15); }
.app-nav__link { color: rgba(255,255,255,0.65); text-decoration: none; font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); padding: var(--space-2) 0; border-bottom: 2px solid transparent; transition: color 150ms ease, border-color 150ms ease; }
.app-nav__link:hover { color: #ffffff; }
.app-nav__link--active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
```

---

## Event-Kontext-Layout (geteilter Event-Selector)

Event-abhängige Seiten werden unter einem **gemeinsamen Layout-Component** gruppiert, das den Event-Selector einmalig zeigt. Der gewählte Event persistiert via `EventKontextService` (Singleton) über alle Gruppen hinweg.

```
Route /planung → EventKontextLayoutComponent (data: { gruppe: 'planung' })
  └── /planung/einladungen
  └── /planung/teilnahmen
  ...

Route /durchfuehrung → EventKontextLayoutComponent (data: { gruppe: 'durchfuehrung' })
  └── /durchfuehrung/konsumationsliste
  ...
```

Die `EventKontextLayoutComponent` liest `ActivatedRoute.data['gruppe']` und zeigt die passende Sub-Navigation:

```html
<!-- event-kontext-layout.component.html -->
<div class="event-kontext-bar">
  <!-- Event-Selector -->
</div>
<div class="event-subnav">
  <div class="event-subnav__inner">
    @if (gruppe() === 'planung') {
      <a routerLink="einladungen" routerLinkActive="event-subnav__link--active">Einladungen</a>
      <!-- ... -->
    }
    @if (gruppe() === 'durchfuehrung') {
      <!-- ... -->
    }
  </div>
</div>
<router-outlet />
```

```css
.event-kontext-bar { background: var(--color-surface); border-bottom: 1px solid var(--color-border); padding: var(--space-3) var(--space-4); }
.event-subnav { background: var(--color-background); border-bottom: 1px solid var(--color-border); }
.event-subnav__inner { max-width: 1280px; margin: 0 auto; padding: 0 var(--space-4); display: flex; gap: var(--space-1); }
.event-subnav__link { display: inline-block; padding: var(--space-3) var(--space-4); font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); text-decoration: none; border-bottom: 2px solid transparent; margin-bottom: -1px; }
.event-subnav__link--active { color: var(--color-primary); border-bottom-color: var(--color-primary); }
.event-subnav__separator { width: 1px; height: 20px; background: var(--color-border); align-self: center; margin: 0 var(--space-2); }
```

---

## Komponenten-Standards

### Page Header

Jede Seite hat einen `page-header` mit Titel links und primärer Aktion rechts:

```html
<div class="page-header">
  <h1>Seitentitel</h1>
  <button class="btn btn--primary" type="button">Primäre Aktion</button>
</div>
```

```css
.page-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-8); }
h1 { font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); margin: 0; }
```

### Container-Breiten

- Formular-lastige Seiten: `max-width: 800px`
- Breite Tabellen / Matrix-Ansichten: `max-width: 1280px`

```css
.container { max-width: 800px; margin: 0 auto; padding: var(--space-8) var(--space-4); }
```

### Buttons

```css
/* Primär – nur 1× pro Seite/Bereich */
.btn--primary { background: var(--color-primary); color: #ffffff; border: none; border-radius: var(--radius-md); padding: var(--space-3) var(--space-6); font-size: var(--font-size-md); font-weight: var(--font-weight-medium); cursor: pointer; }
.btn--primary:hover { background: var(--color-primary-hover); }
.btn--primary:disabled { opacity: 0.4; cursor: not-allowed; }

/* Sekundär */
.btn--secondary { background: transparent; color: var(--color-text-primary); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-3) var(--space-6); }
.btn--secondary:hover { background: var(--color-surface); }

/* Danger */
.btn--danger { background: var(--color-error); color: #ffffff; border: none; border-radius: var(--radius-md); padding: var(--space-3) var(--space-6); }

/* Klein – für inline/kompakte Kontexte */
.btn--sm { padding: var(--space-1) var(--space-3); font-size: var(--font-size-xs); }
```

**Regeln:**
- Primär-Button: 1× pro Sektion
- Danger-Button: nur für destruktive Aktionen
- `.btn--sm` für Aktionen innerhalb von Tabellenzeilen oder Detail-Panels
- Klassen: BEM-ähnlich mit `--` (`.btn--primary`, nicht `.btn-primary`)

### Inputs & Formulare

```css
.form-field { display: flex; flex-direction: column; gap: var(--space-1); margin-bottom: var(--space-6); }
.form-field--wide { flex: 1; }
.form-row { display: flex; gap: var(--space-4); align-items: flex-start; margin-bottom: var(--space-4); }
.form-actions { display: flex; gap: var(--space-3); margin-top: var(--space-4); }

label { font-size: var(--font-size-sm); font-weight: var(--font-weight-medium); color: var(--color-text-secondary); }

input, select, textarea {
  border: 1px solid var(--color-border); border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4); font-size: var(--font-size-md);
  color: var(--color-text-primary); background: var(--color-background);
  transition: border-color 150ms ease; width: 100%;
}
input:focus, select:focus { outline: none; border-color: var(--color-primary); box-shadow: 0 0 0 3px rgba(255,102,0,0.15); }

.feldFehler { font-size: var(--font-size-xs); color: var(--color-error); }

/* Formular-Bereich (Card) */
.form-section { background: var(--color-surface); padding: var(--space-6); border-radius: var(--radius-md); border: 1px solid var(--color-border); }
.form-section.disabled { opacity: 0.6; }
```

**Regeln:**
- Labels immer **über** dem Input (kein Floating Label)
- Fehlermeldung-Klasse: `.feldFehler` (direkt unter dem betroffenen Input)
- Pflichtfelder mit `*` im Label kennzeichnen
- `form-row` für horizontale Anordnung mehrerer Felder

### Tabellen

```css
table { width: 100%; border-collapse: collapse; font-size: var(--font-size-sm); }
thead th { text-align: left; font-weight: var(--font-weight-medium); font-size: var(--font-size-xs); text-transform: uppercase; letter-spacing: 0.05em; color: var(--color-text-secondary); padding: var(--space-3) var(--space-4); border-bottom: 2px solid var(--color-border); }
tbody tr { border-bottom: 1px solid var(--color-border); transition: background 100ms ease; }
tbody tr:hover { background: var(--color-surface); }
td { padding: var(--space-3) var(--space-4); color: var(--color-text-primary); vertical-align: middle; }
.aktionen { text-align: right; white-space: nowrap; }
.betrag-zelle { font-variant-numeric: tabular-nums; white-space: nowrap; text-align: right; }
```

**Regeln:**
- Kein Zebra-Striping – Hover-Highlight stattdessen
- Aktionsspalte (Löschen etc.) immer ganz rechts: Klasse `.aktionen`
- Geldbeträge: `font-variant-numeric: tabular-nums`, format `CHF x.xx`
- Leerer Zustand: `<p class="leerhinweis">` statt leerem `<table>`

### Expandierbare Tabellenzeilen

Für Detail-Ansichten innerhalb einer Tabelle (z.B. Zahlungen pro Abrechnung):

```html
<tr class="haupt-zeile" [class.expandiert]="expandierteId() === item.id">
  <!-- Hauptdaten + Toggle-Button -->
</tr>
@if (expandierteId() === item.id) {
  <tr class="detail-zeile">
    <td [attr.colspan]="spaltenAnzahl">
      <div class="detail-panel">
        <!-- Zweispaltig mit CSS Grid -->
      </div>
    </td>
  </tr>
}
```

```css
.haupt-zeile.expandiert { background: var(--color-surface); }
.detail-zeile td { padding: 0 !important; border-bottom: 2px solid var(--color-primary) !important; }
.detail-panel { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); padding: var(--space-6); background: var(--color-surface); }
@media (max-width: 768px) { .detail-panel { grid-template-columns: 1fr; } }
```

### Matrix-Tabellen (z.B. Konsumationserfassung)

Für Zeilen × Spalten Eingabemasken:

```css
.konsumations-tabelle { table-layout: fixed; }
.anzahl-input { width: 100%; text-align: center; border: 1px solid var(--color-border); border-radius: var(--radius-sm); padding: var(--space-2); }
.anzahl-input--fehler { border-color: var(--color-error); background: var(--color-error-bg); }
```

### Cards / Panels

```css
.card { background: var(--color-background); border: 1px solid var(--color-border); border-radius: var(--radius-md); padding: var(--space-6); box-shadow: var(--shadow-md); }
```

### Badges / Tags

```css
.badge { display: inline-flex; align-items: center; padding: 2px var(--space-2); border-radius: var(--radius-sm); font-size: var(--font-size-xs); font-weight: var(--font-weight-medium); }
.badge--success { background: var(--color-success-bg); color: var(--color-success); }
.badge--error   { background: var(--color-error-bg);   color: var(--color-error);   }
.badge--warning { background: var(--color-warning-bg); color: var(--color-warning); }
.badge--neutral { background: var(--color-surface);    color: var(--color-text-secondary); border: 1px solid var(--color-border); }
.badge--info    { background: var(--color-info-bg);    color: var(--color-info);    }
```

### Alerts / Meldungen

```css
.alert { padding: var(--space-4); border-radius: var(--radius-md); font-size: var(--font-size-sm); margin-bottom: var(--space-4); }
.alert--success { background: var(--color-success-bg); color: var(--color-success); }
.alert--error   { background: var(--color-error-bg);   color: var(--color-error);   }
.alert--warning { background: var(--color-warning-bg); color: var(--color-warning); }

.leerhinweis { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
.ladehinweis { color: var(--color-text-secondary); font-size: var(--font-size-sm); }
```

### Druckansichten (`@media print`)

Für druckbare Seiten (z.B. Konsumationsliste):

```css
.no-print { /* Elemente die nicht gedruckt werden */ }

@media print {
  .no-print { display: none !important; }
  .druckbereich { border: none; padding: 0; }

  @page {
    size: A4 landscape;
    margin: 15mm;
  }
}
```

---

## Angular-spezifische Umsetzung

### CSS-Variablen zentral definieren

Alle Token in `src/styles.css` (global) — nie in Komponenten-CSS neu definieren.

### Shared Layout für event-abhängige Seiten

Route-`data` verwenden, um einen Layout-Component für mehrere Gruppen zu parametrisieren:

```typescript
// app.routes.ts
{
  path: 'planung',
  component: EventKontextLayoutComponent,
  data: { gruppe: 'planung' },
  children: [...]
}

// event-kontext-layout.component.ts
readonly gruppe = toSignal(
  inject(ActivatedRoute).data.pipe(map(d => d['gruppe'] as string))
);
```

### Signal-Pattern für Tabellen-Zustände

```typescript
// Für expandierbare Zeilen
expandierteId = signal<number | null>(null);

// Für Inline-Edits (z.B. Zustellungskanal)
kanalEdits = signal<Record<number, ZustellungsKanal>>({});

// Für Matrix-Eingaben (key: `${rowId}-${colId}`)
matrixWerte = signal<Record<string, number>>({});
```

### Responsive Layout mit CSS Grid

```css
.detail-panel {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-6);
}
@media (max-width: 768px) {
  .detail-panel { grid-template-columns: 1fr; }
}
```

---

## Was zu vermeiden ist

- Kein `!important` ausser als letzter Ausweg (Ausnahme: `.no-print` in Druckstyles)
- Keine hartcodierten Pixelwerte ausserhalb des Token-Systems
- Keine übermässige Verwendung von Schatten oder Farbverläufen
- Kein Text unter 12px
- Keine rein farbbasierten Informationen (immer zusätzlich Text oder Badge-Label)
- Kein Layout das auf `px`-Breakpoints im Template statt CSS basiert
- Nicht `.btn-primary` (ohne Doppel-Dash) — immer `.btn--primary`

---

## Checkliste vor dem Abschluss einer Komponente

- [ ] CSS-Variablen aus dem Token-Set verwendet (keine Hartkodierungen)
- [ ] Container-Breite passend gewählt (800px Formular / 1280px Tabelle)
- [ ] Leerer Zustand definiert (`.leerhinweis`)
- [ ] Lade-Zustand definiert (`.ladehinweis`)
- [ ] Fehlerzustand definiert (`.alert--error`)
- [ ] Erfolgs-Feedback mit Auto-Dismiss (3s `setTimeout`)
- [ ] Alle interaktiven Elemente haben Hover/Focus-Zustand
- [ ] Primär-Button max. 1× pro Abschnitt
- [ ] Labels für alle Form-Inputs vorhanden (`*` bei Pflichtfeldern)
- [ ] Geldbeträge: `font-variant-numeric: tabular-nums`, Format `CHF x.xx`
- [ ] Druckseiten: `@media print` mit `@page { size: A4 landscape }` und `.no-print`
- [ ] Expandierbare Zeilen: Detail-Zeile mit `border-bottom: 2px solid var(--color-primary)`
