# VISUAL EXPERIENCE R2 — test matrix

## Commands

- `npm test` — all numerical and animation regression tests.
- `npm run test:ui` — functional, accessibility, lifecycle and visual tests.
- `npm run typecheck` — TypeScript.
- `npm run build` — offline frontend.
- `npm run desktop:dev` — Tauri/WebView2 smoke.
- `npm run desktop:build` — EXE and NSIS installer.
- `npm run test:physics-performance` and `npm run test:physics-oracles` — preserved R1 evidence.

## R2 cases

The renderer study route `/?r2=renderer-study` checks A/B/C against the same 3DOF modal response, selects each prototype by keyboardable buttons, reports backend/DPR/shared-clock status, disposes Three.js geometry on switch, and exposes no page error. Production tests cover all thirteen workspaces, grouped rail navigation, stage resize, dock/deck collapse, inspector, keyboard focus, reduced motion, theme parity, minimum viewport, no duplicate RAF and no per-frame React commits.

## Manual matrix

Dark/light, 900×680, 1440×900 and maximized layouts; SDOF, damping, forcing, mode 1/2/3, N=10, FRF, base, participation, Free-Free rigid modes, spectrum, PSD, bar/beam/frame FEM; reduced motion; resize during playback; minimize/restore; offline packaged Tauri.

## Acceptance interpretation

Browser measurements are development evidence. Tauri/WebView2 is the desktop gate. A screenshot is accepted only when labels, focus, semantic stage state and physical values agree. Visual changes never weaken numerical tolerances.
