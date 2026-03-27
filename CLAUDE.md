# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm start          # Dev server at http://localhost:4200 (hot reload)
npm run build      # Production build (output in dist/)
npm run watch      # Dev build in watch mode
npm test           # Run unit tests with Vitest
```

To generate Angular artifacts:
```bash
npx ng generate component <name>
npx ng generate service <name>
```

## Architecture

Angular 21 standalone application — no NgModules. Every component uses the standalone API (`@Component` with `imports` array).

**Key files:**
- `src/main.ts` — Bootstrap entry point using `bootstrapApplication`
- `src/app/app.config.ts` — Application-level providers and configuration
- `src/app/app.routes.ts` — Route definitions (currently empty)
- `src/app/app.ts` — Root component with `<router-outlet>`

**Testing:** Vitest (not Karma/Jasmine). Test files are `*.spec.ts` alongside source files.

**Formatting:** Prettier with 100-char line width, single quotes. No ESLint configured.

**TypeScript:** Strict mode enabled with `noImplicitOverride`, `noImplicitReturns`, `noFallthroughCasesInSwitch`, and Angular strict template checking.

## Backend
REST API läuft auf http://localhost:8080
Endpunkte und Datenmodell: siehe ../quartierfest-backend/specs/
