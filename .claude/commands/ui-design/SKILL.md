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

Galaxus unterscheidet eine **UI-Skala** (Interface) von einer **Magazin-Skala** (redaktionell). Für App-Interfaces gilt ausschliesslich die UI-Skala.

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
- Keine Kursivschrift in UI-Elementen (nur in redaktionellen Inhalten)

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

Galaxus verwendet ein **12-Spalten-Grid** mit definierten Breakpoints:

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
  --radius-sm:  4px;    /* Badges, Tags, kleine Elemente */
  --radius-md:  8px;    /* Cards, Inputs, Buttons */
  --radius-lg:  12px;   /* Modals, grosse Panels */
  --radius-full: 9999px; /* Pills, runde Icons */

  --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);          /* Hover-Zustand */
  --shadow-md: 0 2px 8px rgba(0,0,0,0.10);           /* Cards */
  --shadow-lg: 0 8px 24px rgba(0,0,0,0.12);          /* Modals, Dropdowns */
}
```

---

## Komponenten-Standards

### Buttons

```css
/* Primär – nur 1× pro Seite/Bereich */
.btn-primary {
  background: var(--color-primary);
  color: #ffffff;
  border: none;
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-6);
  font-size: var(--font-size-md);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
}
.btn-primary:hover { background: var(--color-primary-hover); }

/* Sekundär */
.btn-secondary {
  background: transparent;
  color: var(--color-text-primary);
  border: 1px solid var(--color-border);
  /* gleiche radius/padding wie primär */
}
.btn-secondary:hover { background: var(--color-surface); }

/* Danger */
.btn-danger {
  background: var(--color-error);
  color: #ffffff;
  border: none;
}
```

**Regeln:**
- Primär-Button: 1× pro Sektion (die wichtigste Aktion)
- Danger-Button: nur für destruktive Aktionen (Löschen, Zurücksetzen)
- Disabled-Zustand: `opacity: 0.4; cursor: not-allowed;`
- Keine Buttons ohne sichtbares Label (kein reines Icon-Only ausser mit Tooltip)

### Inputs & Formulare

```css
.form-field {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
  margin-bottom: var(--space-6);
}

label {
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-secondary);
}

input, select, textarea {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-3) var(--space-4);
  font-size: var(--font-size-md);
  color: var(--color-text-primary);
  background: var(--color-background);
  transition: border-color 150ms ease;
}

input:focus, select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255,102,0,0.15);
}

input.error { border-color: var(--color-error); }
.field-error {
  font-size: var(--font-size-xs);
  color: var(--color-error);
}
```

**Regeln:**
- Labels immer **über** dem Input (kein Floating Label)
- Fehlermeldungen direkt unter dem betroffenen Feld
- Pflichtfelder mit `*` markieren, nicht mit Farbe allein
- Checkboxen / Radios: eigene Zeile, nie inline in Fliesstext

### Tabellen

```css
table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--font-size-sm);
}

thead th {
  text-align: left;
  font-weight: var(--font-weight-medium);
  font-size: var(--font-size-xs);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--color-text-secondary);
  padding: var(--space-3) var(--space-4);
  border-bottom: 2px solid var(--color-border);
}

tbody tr {
  border-bottom: 1px solid var(--color-border);
  transition: background 100ms ease;
}
tbody tr:hover { background: var(--color-surface); }

td {
  padding: var(--space-3) var(--space-4);
  color: var(--color-text-primary);
  vertical-align: middle;
}
```

**Regeln:**
- Kein Zebra-Striping – Hover-Highlight stattdessen
- Aktionsspalte (Löschen etc.) immer ganz rechts, rechtsbündig
- Leerer Zustand (keine Daten): zentrierte Nachricht mit Icon, kein leeres `<table>`

### Cards / Panels

```css
.card {
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: var(--space-6);
  box-shadow: var(--shadow-md);
}
```

### Badges / Tags

```css
.badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: 2px var(--space-2);
  border-radius: var(--radius-sm);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
}
.badge-success { background: var(--color-success-bg); color: var(--color-success); }
.badge-error   { background: var(--color-error-bg);   color: var(--color-error);   }
.badge-info    { background: var(--color-info-bg);     color: var(--color-info);    }
```

### Benachrichtigungen (Alerts)

```css
.alert {
  display: flex;
  align-items: flex-start;
  gap: var(--space-3);
  padding: var(--space-4);
  border-radius: var(--radius-md);
  font-size: var(--font-size-sm);
}
.alert-success { background: var(--color-success-bg); color: var(--color-success); }
.alert-error   { background: var(--color-error-bg);   color: var(--color-error);   }
```

---

## Angular-spezifische Umsetzung

### CSS-Variablen zentral definieren

Alle Token in `src/styles.css` (global) definieren:

```css
/* src/styles.css */
:root {
  --color-primary: #ff6600;
  /* ... alle tokens ... */
}
```

### Komponenten-Styles

```typescript
@Component({
  selector: 'app-example',
  template: `...`,
  styles: [`
    :host { display: block; }
    /* Komponenten-lokale Styles nutzen die globalen CSS-Variablen */
    .title { font-size: var(--font-size-xl); }
  `]
})
```

### Responsive Layout mit CSS Grid

```css
.list-layout {
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-4);
}

@media (min-width: 768px) {
  .list-layout { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 1024px) {
  .list-layout { grid-template-columns: repeat(3, 1fr); }
}
```

---

## Was zu vermeiden ist

- Kein `!important` ausser als letzter Ausweg
- Keine hartcodierten Pixelwerte ausserhalb des Token-Systems
- Keine übermässige Verwendung von Schatten oder Farbverläufen
- Kein Text unter 12px
- Keine rein farbbasierten Informationen (immer zusätzlich Icon oder Text)
- Kein Layout das auf `px`-Breakpoints im Template statt CSS basiert

---

## Checkliste vor dem Abschluss einer Komponente

- [ ] CSS-Variablen aus dem Token-Set verwendet (keine Hartkodierungen)
- [ ] Responsive getestet (Mobile, Tablet, Desktop)
- [ ] Leerer Zustand definiert (keine Daten vorhanden)
- [ ] Lade-Zustand definiert (während API-Aufruf)
- [ ] Fehlerzustand definiert
- [ ] Alle interaktiven Elemente haben Hover/Focus-Zustand
- [ ] Primär-Button max. 1× pro Abschnitt
- [ ] Labels für alle Form-Inputs vorhanden
