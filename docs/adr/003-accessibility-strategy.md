# ADR-003: Accessibility Strategy (WCAG 2.1 AA)

## Status

Accepted (2026-03-02)

## Context

NeuroLearn's target audience includes neurodivergent learners (ADHD, dyslexia, autism spectrum). The platform must exceed standard accessibility requirements and provide specialized accommodations.

## Decision

- Target WCAG 2.1 AA compliance minimum
- Implement neurodivergent-specific features:
  - **Dyslexia-friendly fonts:** OpenDyslexic toggle via CDN
  - **Reduced motion:** Respects OS `prefers-reduced-motion` + app toggle
  - **Focus mode:** Distraction-free learning view
  - **Text scaling:** 3 sizes (small/medium/large) via settings
  - **High contrast:** Toggle for increased contrast ratios
  - **Screen reader hints:** Extra ARIA descriptions for complex interactions
- Focus management with keyboard navigation detection
- Skip links for main content navigation
- Focus trapping in modals with Escape key close
- ARIA roles and landmarks on all interactive components

## Implementation

- `src/lib/focus-manager.ts` — Focus trap with previous element restoration
- `src/lib/keyboard-nav.ts` — Tab/mouse detection, skip link, arrow key navigation
- `src/lib/reduced-motion.ts` — OS + app preference union
- `src/lib/dyslexia-fonts.ts` — OpenDyslexic CDN toggle
- `src/styles/index.css` — sr-only, skip-link, keyboard-nav, reduced-motion CSS
- `src/store/settingsStore.ts` — Persisted accessibility preferences

## Consequences

- OpenDyslexic font loaded from CDN (external dependency)
- CSS custom property `--font-family-base` used for font switching
- All animations must check `prefers-reduced-motion` or `useReducedMotion()`
