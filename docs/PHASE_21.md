# Phase 21 — RACA Session Completeness & Mobile Shell

_Created: 2026-03-11 | Status: Planning_

## Goal

Make the RACA session experience fully functional end-to-end — all built components wired, all missing UX paths activated — and ensure the app is usable on mobile viewports now that the navigation shell is live (INC-008 resolved).

## Issues

| ID     | Title                                                   | Priority | Dependencies     |
| ------ | ------------------------------------------------------- | -------- | ---------------- |
| P21-01 | Wire SessionModeSelector before session starts          | P1       | —                |
| P21-02 | Wire BreakOffering on regulation drop                   | P1       | P21-01           |
| P21-03 | Wire RegulationCheckIn between state transitions        | P1       | P21-01           |
| P21-04 | Wire TransitionAnnouncement on state change             | P2       | —                |
| P21-05 | Wire DiagnosticBanner for session health                | P2       | —                |
| P21-06 | Show SessionSummaryCard at session end                  | P1       | —                |
| P21-07 | Mobile-responsive layout for shell and dashboard        | P1       | INC-008 merged ✓ |
| P21-08 | useLearningTranscript export entry point in ProfilePage | P2       | —                |

## Deferred to Phase 22+

- Parent↔educator direct messaging (realtime infrastructure spike)
- CCSS standards export UI
- INC-011 audit timing fix (only relevant when VITE_RACA_ENABLE_AUDIT=true)
