# Changelog

## Unreleased

- Sidebar widget is now a compact "¥" button with no inline balance/spend text, so it no longer overlaps sibling footer-action buttons.
- Clicking the button opens a draggable floating window (centered in the viewport, clamped while dragging) showing balance, today's spend, tokens and per-model costs; close via × or Esc, refresh from the window header.

## 0.2.4 - 2026-08-18

- Added the required `dsh.bundle` manifest and `cordis.patch.yml` so `dsh plugin add` can install the package directly.
- Added a regression test for marketplace and npm installation metadata.
- Documented migration from the archived `dsh-stats-dashboard` repository and the full inherited dashboard feature set.

## 0.2.3 - 2026-08-14

- Included external vision calls in the statistics dashboard call log.

## 0.2.2 - 2026-08-14

- Fixed default reading of the external vision usage log.

## 0.2.0 - 2026-08-14

- Merged the `dsh-stats-dashboard` projection, model aggregates, call log, cache-rate metrics, TTFT metrics, cost estimates, filters, and CSV export.
