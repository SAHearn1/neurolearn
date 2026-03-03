# ARIA Roles and Attributes Strategy

## Principles

1. Use semantic HTML first — ARIA is a supplement, not a replacement
2. Every interactive element must be keyboard accessible
3. Dynamic content changes must be announced to screen readers
4. Complex widgets (modals, menus, tabs) must follow WAI-ARIA patterns

## Landmark Roles

| HTML Element | ARIA Role       | Usage                                  |
| ------------ | --------------- | -------------------------------------- |
| `<main>`     | `main`          | Primary page content (one per page)    |
| `<nav>`      | `navigation`    | Header nav, sidebar nav, breadcrumbs   |
| `<header>`   | `banner`        | Site header (one per page)             |
| `<footer>`   | `contentinfo`   | Site footer                            |
| `<aside>`    | `complementary` | Sidebar content, related info          |
| `<section>`  | `region`        | Named sections (requires `aria-label`) |

## Interactive Component Patterns

### Modal (`role="dialog"`)

- `aria-modal="true"` on dialog container
- `aria-labelledby` pointing to title element
- Focus trapped inside modal
- Escape key closes modal
- Focus returns to trigger element on close

### Tabs (`role="tablist"`)

- `role="tablist"` on container
- `role="tab"` on each tab button
- `role="tabpanel"` on each panel
- `aria-selected="true"` on active tab
- `aria-controls` linking tab to panel
- Arrow keys navigate between tabs

### Alert (`role="alert"`)

- Used for error messages and validation feedback
- `aria-live="assertive"` for critical alerts
- `aria-live="polite"` for status updates

### Progress (`role="progressbar"`)

- `aria-valuenow`, `aria-valuemin`, `aria-valuemax`
- `aria-label` describing what is being measured

### Form Fields

- `<label>` elements with explicit `htmlFor` or wrapping input
- `aria-describedby` for help text and error messages
- `aria-invalid="true"` for fields with validation errors
- `aria-required="true"` for required fields

## Dynamic Content

### Live Regions

- `aria-live="polite"` for non-urgent updates (progress changes, new content loaded)
- `aria-live="assertive"` for errors and critical notifications
- `aria-atomic="true"` when the entire region should be re-read

### Implementation

```typescript
// src/lib/focus-manager.ts
export function announceToScreenReader(message: string): void {
  const el = document.createElement('div')
  el.setAttribute('role', 'status')
  el.setAttribute('aria-live', 'polite')
  el.setAttribute('aria-atomic', 'true')
  el.className = 'sr-only'
  el.textContent = message
  document.body.appendChild(el)
  setTimeout(() => el.remove(), 1000)
}
```

## Component Checklist

| Component   |       Semantic HTML        |           ARIA Attrs           |       Keyboard       |     Focus Mgmt      |
| ----------- | :------------------------: | :----------------------------: | :------------------: | :-----------------: |
| Button      |         `<button>`         |     variant via className      |     Enter/Space      | focus-visible ring  |
| Modal       |   `<div role="dialog">`    |  aria-modal, aria-labelledby   |    Escape closes     |     Focus trap      |
| Input       |   `<input>` in `<label>`   | aria-invalid, aria-describedby |    Tab navigation    | Auto-focus on error |
| Alert       |    `<div role="alert">`    |           aria-live            |          —           |          —          |
| ProgressBar | `<div role="progressbar">` |     aria-valuenow/min/max      |          —           |          —          |
| Tooltip     |   `<div role="tooltip">`   |  aria-describedby on trigger   |          —           |          —          |
| Card        |   `<article>` or `<div>`   |               —                | Tab to links/buttons |          —          |
| Sidebar     |          `<nav>`           |      aria-label="Sidebar"      |      Arrow keys      |          —          |
| Header      |         `<header>`         |               —                |    Tab navigation    | Skip link bypasses  |
