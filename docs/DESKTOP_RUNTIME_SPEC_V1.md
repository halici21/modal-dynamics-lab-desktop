# Modal Dynamics Lab — Desktop Runtime Specification V1

**Status:** Frozen V1 runtime direction  
**Target platform:** Windows desktop  
**Application shell:** Tauri 2  
**Frontend:** Vite + React + TypeScript  
**Core operating model:** Local-first / offline-first

---

# 1. Runtime Principle

Modal Dynamics Lab is a desktop scientific application.

It must not be architected as:
- a website,
- a hosted SaaS application,
- a Next.js product,
- a cloud-dependent teaching tool.

The core V1 experience must run without network access after installation.

---

# 2. Frozen V1 Stack

Use:

```text
Tauri 2
├── Rust native shell
└── WebView frontend
    └── Vite
        └── React
            └── TypeScript
```

Do not introduce Next.js, SSR, API routes, or Vercel-specific architecture.

---

# 3. Why Tauri

Tauri is selected because the application requires:

- a Windows executable / installer,
- lightweight desktop packaging,
- local execution,
- high-quality SVG / Canvas / CSS animation,
- future native file integration,
- a narrow Rust/native boundary,
- lower overhead than a full bundled Chromium desktop runtime where possible.

This decision is frozen for V1 unless a verified technical blocker is discovered.

---

# 4. V1 Native Layer Scope

Rust/Tauri should remain intentionally small.

V1 native responsibilities may include:

- application startup,
- desktop window configuration,
- application metadata,
- packaging,
- future-safe command boundary,
- native lifecycle hooks only when needed.

Do not move SDOF/2DOF/MDOF V1 calculations into Rust merely because Rust exists.

For \(N\le10\), frontend-side numerical work is expected to be trivial.

---

# 5. Offline Requirement

Core V1 must work with:

```text
network connection = unavailable
```

No required:
- remote API,
- authentication,
- CDN dependency at runtime,
- cloud database,
- telemetry service,
- hosted font,
- hosted equation renderer,
- remote visualization dependency.

All runtime assets required for the core experience should ship with the application.

Development tooling may of course use package registries during installation/build.

---

# 6. Desktop Window

The application should launch into a primary resizable desktop window.

Requirements:

- clear minimum usable size,
- smooth resize,
- stable layout,
- no browser chrome,
- no address bar,
- no web-navigation feel,
- native minimize/maximize/close behavior remains reliable.

A custom title bar may be explored only if it does not compromise:
- drag behavior,
- resize,
- accessibility,
- standard Windows controls,
- DPI behavior.

Custom chrome is polish, not a Phase 0 requirement.

---

# 7. Window Size Strategy

Phase 0 should define and test:

- recommended default window size,
- minimum supported window size,
- behavior under narrow desktop windows,
- maximized layout,
- resize transitions.

The Physics Stage remains the highest-priority visual region.

Do not force a mobile web layout model onto the desktop app.

---

# 8. DPI and Scaling

The application must be usable at common Windows scaling values:

- 100%
- 125%
- 150%
- 200%

Requirements:

- text remains crisp,
- SVG remains crisp,
- Canvas respects `devicePixelRatio`,
- hit targets remain usable,
- plots do not become blurry,
- window movement between displays with different scaling does not permanently degrade rendering.

---

# 9. High-Refresh Displays

Animation timing must not assume a fixed 60 Hz display.

The same simulation clock must behave correctly at:

- 60 Hz,
- 90 Hz,
- 120 Hz,
- other common refresh rates.

Physics time is based on elapsed time, not rendered frame count.

---

# 10. Window Lifecycle

When:
- minimized,
- hidden,
- backgrounded,
- restored,

the application must not create duplicate clocks or stale animation loops.

Nonessential continuous work should pause or throttle when not visible.

On restore:
- semantic state remains valid,
- simulation resumes deterministically according to product behavior,
- graph/stage synchronization remains intact.

---

# 11. Multi-Monitor Behavior

Where possible, validate moving the window between displays with different:

- DPI,
- scale factors,
- refresh rates.

Canvas and visualization backends must update appropriately.

---

# 12. Native Capability Principle

Use least privilege.

Do not enable broad filesystem, shell, network, or system capabilities without an explicit V1 need.

Every new Tauri capability should answer:

> Which user-facing V1 feature requires this?

If there is no clear answer, do not enable it.

---

# 13. File Operations

V1 does not require full project persistence.

However, architecture should not block future support for:

- Open Project
- Save Project
- Export CSV
- Export PNG
- Export PDF
- Export JSON

Do not implement these prematurely unless explicitly promoted into V1.

---

# 14. Keyboard Shortcuts

Desktop shortcuts may include:

```text
Space      Play / Pause
R          Reset
← / →      Step
1–9        Mode selection
E          Energy lens
F          Forces lens
M          Mathematics lens
```

System-reserved shortcuts must not be overridden.

Focus inside text/numeric inputs must prevent inappropriate global shortcut capture.

---

# 15. Native Menu

A native application menu is optional for V1.

Do not build a menu merely to make the application feel desktop-like.

If introduced later, keep it consistent with:
- keyboard shortcuts,
- file operations,
- accessibility.

---

# 16. Network Policy

The production V1 app should not need outbound network traffic for its core modules.

If any future optional online feature is introduced:
- it must fail gracefully offline,
- it must not block core simulation,
- it must be explicitly separated from the local physics path.

---

# 17. Packaging

Phase 0 must prove that a production desktop build can be generated.

The project should be structured so release packaging can ultimately produce an installable Windows artifact supported by Tauri.

Exact installer format can be finalized during implementation according to Tauri-supported Windows bundling.

---

# 18. Desktop Build Gate

Phase 0 cannot be marked PASS solely because the frontend works in a browser dev server.

Required:

- Tauri development application launches,
- frontend runs inside Tauri,
- production desktop build succeeds,
- application opens as a desktop app.

---

# 19. Development Browser Use

A browser may be used as a temporary frontend debugging convenience.

However:

- browser success is not the product acceptance criterion,
- desktop lifecycle must be tested in Tauri,
- desktop DPI/resize/build behavior must be verified separately.

---

# 20. Security

Keep the Tauri attack surface minimal.

Requirements:

- least-privilege capabilities,
- no arbitrary shell command execution,
- no unnecessary remote content,
- no broad filesystem access,
- no runtime eval-based architecture,
- dependencies reviewed before use.

---

# 21. Dependency Strategy

Prefer:
- small,
- well-maintained,
- necessary dependencies.

Avoid installing large UI or animation libraries simply to accelerate initial prototyping when a focused implementation is sufficient.

Any dependency that owns continuous animation must not conflict with the single authoritative simulation clock.

---

# 22. V1 Desktop Acceptance Criteria

Desktop runtime passes only if:

- Tauri 2 is the shell,
- app launches on Windows development environment,
- production desktop build succeeds,
- core app works offline,
- window resize is stable,
- no page-level web-navigation behavior appears,
- common DPI scaling is usable,
- high-DPI Canvas is crisp,
- minimize/restore does not duplicate animation loops,
- background CPU work is reasonable,
- frontend physics remains independent of Tauri APIs,
- no unnecessary native capability is enabled.

---

# 23. Future Native Expansion

Potential later native use:

- project-file persistence,
- export,
- native dialogs,
- recent-project list,
- larger numerical backend,
- local computation workers,
- GPU/native acceleration if justified.

None of these should distort V1 architecture prematurely.
