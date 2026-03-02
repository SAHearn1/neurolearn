# Screen Reader Testing Guide

## Scope

NeuroLearn is tested with the following screen readers to ensure accessibility for blind and low-vision users:

| Screen Reader | OS | Browser | Version |
|---|---|---|---|
| NVDA | Windows 10/11 | Firefox | 2024.x+ |
| VoiceOver | macOS | Safari | Built-in |
| VoiceOver | iOS | Safari | Built-in |
| TalkBack | Android | Chrome | Built-in |

## Test Environment Setup

### NVDA (Windows)
1. Download from https://www.nvaccess.org/download/
2. Install with default settings
3. Open Firefox (recommended browser pairing)
4. Key reference: `Insert` = NVDA modifier key
5. Toggle speech viewer: NVDA menu > Tools > Speech Viewer

### VoiceOver (macOS)
1. System Settings > Accessibility > VoiceOver > Enable
2. Shortcut: `Cmd+F5` to toggle
3. Use Safari for best compatibility
4. VoiceOver modifier: `Ctrl+Option` (VO)

## Test Scripts

### Flow 1: Login Page

1. Navigate to `/login`
2. **NVDA**: Press `Insert+F7` to open Elements List — verify "Email" and "Password" labels appear
3. Press `Tab` to focus Email field — screen reader should announce "Email, edit text"
4. Press `Tab` to focus Password field — should announce "Password, password edit text"
5. Press `Tab` to focus Sign In button — should announce "Sign in, button"
6. Enter invalid credentials and press `Enter`
7. Verify error alert is announced automatically (role="alert")
8. **Expected**: All form controls have accessible names, error messages are announced

### Flow 2: Sign Up Page

1. Navigate to `/signup`
2. Tab through all fields: Full name, Email, Password, Age confirmation checkbox
3. **Age gate checkbox**: Should announce "I confirm I am 13 years of age or older (or have parental consent), checkbox, not checked"
4. Press `Space` to check — should announce "checked"
5. Tab to Create Account button — should announce "Create account, button"
6. Submit without required fields — verify validation errors are announced
7. **Expected**: Age gate is clearly announced, required fields are identified

### Flow 3: Course Navigation

1. Navigate to `/courses`
2. Press `H` to navigate by headings — all course titles should be reachable
3. Press `K` to navigate by links — "Continue course" links should be reachable
4. Activate a course link
5. On course page, press `H` to navigate lesson headings
6. Press `B` to navigate buttons — "Previous", "Next", "Mark complete" should be reachable
7. **Expected**: All content is reachable via heading and link navigation

### Flow 4: Dashboard

1. Navigate to `/dashboard`
2. Press `H` to navigate headings — "Welcome back", "Recommended for You" should appear
3. Verify progress bars announce their values (e.g., "72% complete")
4. Tab to navigation links — "Browse courses", "View profile", "Update settings"
5. **Expected**: Dynamic content (progress bars, recommendations) is announced

### Flow 5: Modal Dialogs

1. Navigate to educator portal and trigger a modal (e.g., create class)
2. Verify focus moves into modal when it opens
3. Press `Tab` repeatedly — focus should be trapped inside modal
4. Press `Escape` — modal closes and focus returns to the trigger button
5. **Expected**: Focus management follows WAI-ARIA dialog pattern

### Flow 6: Skip Navigation

1. Navigate to any page
2. Press `Tab` once from page load — "Skip to main content" link should be first focus
3. Press `Enter` to activate — focus should jump to main content area
4. **Expected**: Skip link is the first focusable element on every page

## Accessibility Landmarks

Verify the following landmarks are present on every page:

| Landmark | Element | Purpose |
|---|---|---|
| banner | `<header>` | Site header/navigation |
| main | `<main>` | Primary content area |
| navigation | `<nav>` | Navigation links |
| complementary | `<aside>` | Sidebar content (if present) |

## Known Limitations

1. **jsdom**: Automated axe tests run in jsdom which doesn't support all ARIA behaviors — manual screen reader testing is still required
2. **Dynamic content**: RACA cognitive state transitions may not announce automatically — use `aria-live="polite"` regions
3. **Rich text editor**: Draft editor in RACA sessions may have limited screen reader support — provide alternative text input mode

## Test Frequency

- **Before each major release**: Full test script execution with NVDA and VoiceOver
- **After UI changes**: Re-test affected flows
- **Quarterly**: Full regression with all 4 screen readers
- **On demand**: After accessibility bug reports

## Reporting

Document test results in the following format:

| Flow | Screen Reader | Result | Notes |
|---|---|---|---|
| Login | NVDA/Firefox | Pass/Fail | Details |
| Sign Up | VoiceOver/Safari | Pass/Fail | Details |
| ... | ... | ... | ... |

File issues for any failures with the label `a11y` and severity based on impact.
