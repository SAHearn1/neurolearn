# Plan 15-02 Summary — Accessibility Testing + Lighthouse CI

**Status:** DONE
**Date:** 2026-03-02

## Completed Tasks

1. **accessibility.test.tsx** — 5 axe-core tests in jsdom: form labels, img alt, buttons, heading hierarchy, input labels
2. **lighthouserc.js** — Updated assertions: Performance >= 90 (warn), Accessibility >= 95 (error), Best Practices >= 90, FCP/TTI/TBT/CLS thresholds
3. **ci.yml** — Added Lighthouse CI job (runs after validate, installs @lhci/cli, runs lhci autorun)
4. **screen-reader-testing.md** — Created with NVDA/VoiceOver setup, 6 test flows (login, signup, courses, dashboard, modals, skip nav), landmarks table, reporting format

## Enhancements Made

- `src/test/accessibility.test.tsx`: 5 axe-core accessibility tests
- `lighthouserc.js`: Raised thresholds (a11y 0.95 error-level), added web vital assertions
- `.github/workflows/ci.yml`: Added lighthouse job after validate
- `docs/compliance/screen-reader-testing.md`: Created with actionable test scripts
- `package.json`: Added jsdom devDependency

## CI Gate

- typecheck: PASS | lint: PASS | test: PASS (30/30) | build: PASS
