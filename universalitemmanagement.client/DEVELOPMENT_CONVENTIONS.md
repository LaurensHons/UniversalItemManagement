# Client Development Conventions

This document outlines conventions for the Angular frontend of UniversalItemManagement.

## Component File Structure

**IMPORTANT: Never put templates or styles inline in the TypeScript file.**

Every component must use separate files:
- `component.ts` — logic only, with `templateUrl` and `styleUrls`
- `component.html` — template
- `component.scss` — styles

```typescript
// ✅ CORRECT
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss'],
})

// ❌ WRONG — never use inline template/styles
@Component({
  selector: 'app-example',
  template: `<div>...</div>`,
  styles: [`.foo { color: red; }`],
})
```

## Warm Workshop Design System

All components must use the `--ww-*` CSS variable system defined in `src/styles.scss`.

### CSS Variables

| Category | Examples |
|----------|---------|
| Palette | `--ww-cream`, `--ww-ink`, `--ww-terracotta`, `--ww-sage`, `--ww-honey`, `--ww-sky`, `--ww-rose` |
| Surfaces | `--ww-surface`, `--ww-surface-raised`, `--ww-surface-sunken` |
| Borders | `--ww-border`, `--ww-border-strong` |
| Shadows | `--ww-shadow-sm`, `--ww-shadow-md`, `--ww-shadow-lg`, `--ww-shadow-focus` |
| Typography | `--ww-font-display` (Sora), `--ww-font-body` (Nunito Sans), `--ww-font-mono` (Source Code Pro) |
| Radii | `--ww-radius-sm` (6px), `--ww-radius-md` (10px), `--ww-radius-lg` (14px), `--ww-radius-xl` (20px) |
| Transitions | `--ww-ease`, `--ww-duration` |

### RGB Variables for Alpha

When you need a color with transparency, use the `-rgb` variant:
```scss
// CORRECT
background: rgba(var(--ww-white-rgb), 0.2);
box-shadow: 0 0 0 2px rgba(var(--ww-terracotta-rgb), 0.15);

// WRONG
background: rgba(255, 255, 255, 0.2);
box-shadow: 0 0 0 2px rgba(196, 93, 62, 0.15);
```

Available RGB variables: `--ww-white-rgb`, `--ww-terracotta-rgb`, `--ww-ink-rgb`

### Do Not Use

- Hardcoded hex colors like `#fff`, `#333`, `white` (use `--ww-white`, `--ww-ink`, etc.)
- Hardcoded `rgba()` values (use `--ww-*-rgb` variables with `rgba()`)
- Generic Material Design card styling (`mat-card` for layout)
- Bootstrap classes (`d-flex`, `row`, etc.)
- Default system fonts

### CSS Naming Convention (BEM-like)

Each component gets a short prefix:
- `fg__` — field-grid
- `rl__` — record-list
- `rc__` — record
- `nr__` — new-record
- `pc__` — property-creator
- `fm__` — field-mover
- `pcd__` — property-creator-dialog
- `sf__` — sub-fields (text/boolean/date)

```scss
// Block
.rl { ... }

// Element
.rl__sidebar { ... }
.rl__sidebar-item { ... }

// Modifier
.rl__sidebar-item--active { ... }
.rl__btn--primary { ... }
```

### Common UI Patterns

**Panel** — rounded container with toolbar header:
```scss
.xx__panel {
  background: var(--ww-surface-raised);
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius-lg);
  overflow: hidden;
}

.xx__panel-toolbar {
  padding: 10px 16px;
  background: var(--ww-surface-sunken);
  border-bottom: 1px solid var(--ww-border);
}
```

**Button** — compact, display font, with icon support:
```scss
.xx__btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 5px 12px;
  border: 1px solid var(--ww-border);
  border-radius: var(--ww-radius-sm);
  background: var(--ww-surface-raised);
  font-family: var(--ww-font-display);
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 150ms var(--ww-ease);
}
```

**Type badges** — color-coded by field type using `data-type` attribute:
- Text → `--ww-sky` / `--ww-sky-light`
- Date → `--ww-honey` / `--ww-honey-light`
- Boolean → `--ww-sage` / `--ww-sage-pale`

## Component Architecture

- All components are **standalone** (no NgModules)
- State management via NgRx facades (`RecordFacade`, `FieldFacade`, etc.)
- Facades use `providedIn: 'root'`
- CRUD: `addEntity()`, `updateEntity()`, `removeEntity()`, `getEntity()`, `getEntities()`

### Data Access Rule

**IMPORTANT: Never inject or call facades directly from components.**

Components must always go through a dedicated service layer. Facades are an implementation detail of state management and should not be referenced in component code.

```typescript
// ✅ CORRECT — component uses a service
constructor(private recordService: RecordService) {}

// ❌ WRONG — component uses a facade directly
constructor(private recordFacade: RecordFacade) {}
```

Services encapsulate the facade calls and any additional business logic (mapping, orchestration, error handling). This keeps components thin and makes testing easier.

## Testing

- Framework: Jasmine/Karma with ChromeHeadless
- Mock facades with `useValue` overrides in TestBed
- Known broken tests: AppComponent, NewRecordComponent, RecordListComponent (missing Store provider)
