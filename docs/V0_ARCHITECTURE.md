# V0 architecture and operating notes

V0 is Phase 0 only. The carriage is an eight-second triangular calibration sweep in display percent. It is not an SDOF response; it has no mass, stiffness, damping, physical frequency, energy or solver. No numerical normalization, eigenvalue tolerance or mode-tracking algorithm is implemented.

## Responsibility and dependency map

```text
app semantic state + education content
          |                     |
controls / selection       explanatory text
          |
animation/SimulationClock (one RAF owner)
          |
features/foundation/demo (explicitly nonphysical fixture)
          |
visualization SVG transforms / cursor / numeric DOM text

app/desktop --> narrow Tauri focus event boundary
physics/contracts --> future pure solver API, no implementation
```

- **Physics:** framework-independent types only; future solutions expose sample(time).
- **Animation:** authoritative elapsed time, playback intent, rate, suspension reasons, coalesced input jobs and diagnostics.
- **Visualization:** receives time and the V0 fixture, converts display percent into SVG geometry. The trace uses five exact corner samples and is rebuilt only when travel changes.
- **UI:** reducer owns active module, lens, travel, linked selection and reset revision. Components own local input drafts, appearance and diagnostic visibility.
- **Native:** default Tauri builder, native window chrome, packaging and focus events. No Rust calculations or custom commands.

## Clock contract

requestAnimationFrame timestamps and performance.now use the same monotonic time domain. Between anchors, elapsed seconds are multiplied by playback rate. Rate changes account for elapsed time at the old rate first. Dropped frames do not slow simulation time.

All stage, trace and time readout subscribers receive the same time. Semantic subscribers fire only for playback state changes. React Profiler reports zero commits during uninterrupted playback.

play/start/resume preserve the current time. pause accounts for the partial frame before stopping. step pauses and advances 0.1 seconds (negative stepping clamps at zero). setTime rejects nonfinite input and supports future scrubbing. reset sets time to zero, rate to 1 and playback to paused. App Reset also restores travel=65%, Motion lens, empty inspection and all numeric drafts; it preserves the current module and appearance.

Parameter changes preserve time and directly change display travel. Module and lens changes preserve the carriage and clock. Module changes clear incompatible inspection. Selecting the carriage or trace pauses playback and shares objectId=carriage-01 across both views.

## Lifecycle and interruption

The clock tracks independent hidden, inactive, native-inactive and reduced-motion reasons. It resumes only when every reason clears and play intent remains true. Suspended wall time is excluded, so restoring a window does not jump forward. A user pause while hidden wins over restoration.

Only the clock schedules RAF. Inputs replace pending work by key, including when paused; a one-shot input frame is permitted in suspended state but no continuous background loop is scheduled. Reset clears pending work. Parameter component unmount cancels its job. Listener registration handles unmount during async Tauri registration. HMR cleans up roots, clocks and the pagehide listener.

Interface border transitions use 180 ms ease-out; educational timing is reserved at 300 ms. V0 has no staged educational animation to queue. User interactions cancel outstanding transitions. Physics transform updates have no CSS easing. Reduced motion disables continuous play and shows static travel extremes while retaining Step and Scrub.

## Native capability choices

Only core:event:allow-listen, core:event:allow-unlisten and core:window:allow-is-focused are enabled. These support native focus suspension. No filesystem, shell, network or plugin permissions are granted. A CSP restricts runtime content to bundled assets and local Tauri IPC.

Default client size is 1440×900; minimum is 900×680. Standard Windows title bar, minimize, maximize and resize remain native. At narrow widths the theory area collapses into a compact inspector below the stage. The stage, primary travel control and playback remain visible. Secondary content can scroll vertically; there is no horizontal page overflow.

All diagrams and traces are SVG, so Canvas DPR handling is not applicable. Fonts use Windows system faces; scripts/styles ship locally.

## Building on this host

Install Node, Rust MSVC, Microsoft C++ Build Tools and WebView2. This run installed the missing Rust and MSVC development toolchains. Rust was installed without changing the persistent PATH; the helper prepends the usual Cargo bin directory for its child process.

```powershell
npm ci
npm run desktop:dev
npm run desktop:build
```

The helper compiles a source copy under %LOCALAPPDATA%/ModalDynamicsLab/build-v0 and copies the resulting executable and installer into artifacts/. It exists because Cargo received access-denied errors writing in this host's Documents workspace. No Windows security settings were changed. Frontend development still uses the original source tree and HMR; restart desktop:dev after changing copied Rust/native sources.

On a workstation without that folder restriction, npm run tauri -- dev and npm run tauri -- build are also available.

The NSIS installer embeds the WebView2 offline installer. This intentionally makes it much larger than the standalone executable. Artifacts are unsigned local builds. Installation on a pristine Windows VM has not been tested.

## Validation

```powershell
npm test
npm run test:ui
npm run typecheck
npm run build
npm run test:performance
```

For native development profiling, launch Tauri with WEBVIEW2_ADDITIONAL_BROWSER_ARGUMENTS=--remote-debugging-port=9223, then run the measurement script with MDL_CDP=http://127.0.0.1:9223. Use this only for local testing; normal production runs do not set this environment variable. The production bundle contains neither the diagnostic controls nor the development clock/Profiler API.

Performance files distinguish RAF interval, input-to-DOM latency and time to the next rendering opportunity. These are not optical measurements of monitor presentation. Renderer load measurements are short TaskDuration samples, not total system CPU or a long soak test.

Visual baselines cover dark, light, narrow and reduced-motion states. Review changes visually before accepting updated snapshots. tests/visual contains the reviewed PNGs.

## Future Phase 1 integration

Replace the explicitly named fixture with a validated pure physical solution. Keep playback rate separate from physical frequency. Add SI parameter models and analytical reference tests in physics, then feed sampled output through the existing shared clock and SVG subscribers. Do not put per-frame positions into the app reducer. No Phase 1 work was started.
