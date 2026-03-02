# Screen Reader Testing Guide

## Overview

NeuroLearn is tested for screen reader compatibility with NVDA (Windows) and VoiceOver (macOS/iOS). This document outlines the testing procedures, known patterns, and current compliance status.

## Screen Readers Tested

| Reader | Platform | Version |
|--------|----------|---------|
| NVDA | Windows | 2024.1+ |
| VoiceOver | macOS | Ventura+ |
| VoiceOver | iOS | 17+ |
| TalkBack | Android | Latest |

## Testing Checklist

### Navigation
- [ ] Skip link navigates to main content
- [ ] Tab order follows visual reading order
- [ ] All interactive elements reachable via keyboard
- [ ] Focus indicators visible on all focusable elements
- [ ] Escape key closes modal dialogs and returns focus
- [ ] Arrow keys navigate within tab panels and lists

### Page Structure
- [ ] Page has exactly one `<h1>`
- [ ] Heading hierarchy is sequential (h1 → h2 → h3, no skips)
- [ ] Landmark regions present: `<main>`, `<nav>`, `<header>`
- [ ] Page title updates on route change
- [ ] Loading states announced via `aria-live="polite"`

### Forms
- [ ] All inputs have associated labels
- [ ] Required fields marked with `aria-required="true"`
- [ ] Error messages linked via `aria-describedby`
- [ ] Form submission feedback announced
- [ ] Password fields have visibility toggle with accessible label

### Interactive Components
- [ ] Buttons have descriptive text (not just "Click here")
- [ ] Links distinguish between navigation and actions
- [ ] Modal dialogs trap focus when open
- [ ] Tooltips accessible on focus (not just hover)
- [ ] Tabs use `role="tablist"`, `role="tab"`, `aria-selected`

### RACA Session (Cognitive Architecture)
- [ ] Cognitive state transitions announced
- [ ] Agent messages have `role="log"` with `aria-live="polite"`
- [ ] Regulation intervention is announced as an alert
- [ ] Draft editor accessible with screen reader
- [ ] Progress through 9 states is conveyed

### Milestone Celebrations
- [ ] Dialog announced when milestone triggered
- [ ] Respects `prefers-reduced-motion` (no animation)
- [ ] Auto-dismiss does not steal focus unexpectedly
- [ ] Celebration icon has `aria-hidden="true"`

## Existing Accessibility Features

### Implemented
1. **Skip link** — "Skip to main content" link at page top (`src/main.tsx`)
2. **Focus trap** — Modal component traps focus within dialog (`src/components/ui/Modal.tsx`)
3. **Reduced motion** — `useReducedMotion` hook checks OS + app preference
4. **Dyslexia font** — OpenDyslexic toggle in settings
5. **Keyboard navigation** — Arrow key handlers for lists and tabs
6. **High contrast mode** — Configurable in accessibility preferences
7. **Screen reader hints** — Configurable in user profile
8. **ARIA attributes** — `role`, `aria-selected`, `aria-live` on interactive components

### WCAG 2.1 AA Compliance Notes
- **1.1.1 Non-text Content**: All images require alt text (enforced by axe rules)
- **1.4.3 Contrast**: Minimum 4.5:1 ratio (see `docs/compliance/color-contrast-audit.md`)
- **2.1.1 Keyboard**: All functionality available via keyboard
- **2.4.1 Bypass Blocks**: Skip link present
- **2.4.6 Headings and Labels**: Descriptive headings on all pages
- **4.1.2 Name, Role, Value**: ARIA attributes on custom widgets

## Testing Procedure

### NVDA (Windows)
1. Install NVDA from nvaccess.org
2. Start NeuroLearn dev server: `npm run dev`
3. Open Chrome, navigate to localhost:5173
4. Press Insert+Space to enter forms mode / browse mode
5. Navigate using Tab, arrows, h (headings), f (forms)
6. Verify all checklist items above

### VoiceOver (macOS)
1. Enable VoiceOver: Cmd+F5
2. Navigate with VO+Right/Left arrows
3. Use VO+Shift+Down to interact with groups
4. Verify rotor (VO+U) shows proper headings and links

### Automated Testing
- `axe-core` configuration in `src/lib/axe-setup.ts`
- Run in tests: `const results = await runAxeCheck(container)`
- CI pipeline runs accessibility checks via Lighthouse (see `lighthouserc.js`)

## Known Issues

| Issue | Severity | Status | Notes |
|-------|----------|--------|-------|
| Dashboard cards lack group labels | Low | Open | Add `aria-label` to stat cards |
| Tab panels need `aria-labelledby` | Medium | Open | Connect tab to panel |

## Resources

- [NVDA User Guide](https://www.nvaccess.org/files/nvda/documentation/userGuide.html)
- [VoiceOver User Guide](https://support.apple.com/guide/voiceover)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [axe-core Rules](https://github.com/dequelabs/axe-core/blob/develop/doc/rule-descriptions.md)
