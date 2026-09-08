# V2 / PHASE 2 VERDICT

**BLOCKED at the final native validation gate.** Phase 2 implementation, numerical checks, all automated UI/visual regressions, frontend build, Windows EXE/installer build, packaged offline calculations and actual native resize checks are complete. A controlled native performance run and automatic minimize/restore playback verification could not be completed reliably with the current Windows focus/automation state. This is not reported as a passing native measurement.

## 1. Phase 1 regression status

Before edits: 29 unit tests and 25 interaction/visual tests passed. Final: all original tests and all nine unchanged V1 screenshots passed as part of 39 unit tests and 49 UI/visual tests. No Phase 1 test was deleted or weakened. The c=0 branch produces identical snapshots for the undamped reference cases and free translation.

## 2. What was implemented

Damped SDOF in the existing instrument, version 0.2.0: underdamped, critical and overdamped response; safe k=0 viscous slowing; c/ζ authority; five presets; parallel damper; signed damping force; dissipated energy and power; fixed response windows and true envelopes; decaying phase space; linked characteristic-root derivation; two guided experiments and expanded inspection. Phase 3 was not started.

## 3. Damped SDOF physics model

Assume SI units, constant m>0, k>=0, c>=0, finite initial conditions, small displacement, linear viscous damping and no forcing.

m ẍ+c ẋ+kx=0; omega=sqrt(k/m); cc=2sqrt(km); ζ=c/cc (k>0); alpha=c/(2m).

- Undamped: x=x0 cos(omega t)+(v0/omega)sin(omega t).
- Underdamped: wd=omega sqrt(1−ζ²); B=(v0+alpha x0)/wd; x=exp(−alpha t)[x0 cos(wd t)+B sin(wd t)]. v=exp(−alpha t)[v0 cos(wd t)−(alpha v0+omega²x0)sin(wd t)/wd].
- Critical: x=[x0+(v0+omega x0)t]exp(−omega t); v=[v0−omega(v0+omega x0)t]exp(−omega t).
- Overdamped: r1,2=−alpha±sqrt(alpha²−omega²); C1=(v0−r2 x0)/(r1−r2), C2=(r1 x0−v0)/(r1−r2); x=C1 exp(r1t)+C2 exp(r2t), v=r1 C1 exp(r1t)+r2 C2 exp(r2t).
- k=0,c>0: beta=c/m; v=v0 exp(−beta t); x=x0+(v0/beta)[1−exp(−beta t)].
- k=c=0: x=x0+v0t, v=v0, a=0.

In every branch a=(−kx−cv)/m, Fs=−kx, Fd=−cv. KE=mv²/2, PE=kx²/2, E=KE+PE, Pd=cv², dE/dt=−Pd, dissipated energy=E0−E. Residual=m a+c v+k x. Acceleration and energy derivatives are independently verified, not accepted solely from the residual construction.

The optional envelope is ±R exp(−alpha t), R=hypot(x0,(v0+alpha x0)/wd); it is not incorrectly approximated by |x0|.

## 4. Numerical strategy

Critical classification uses |ζ−1|<=1e-8. The tolerance changes only the label; physical parameters are not snapped. Stable fundamental functions solve the exact side of the boundary, with a sinc series for small wd*t, an exact repeated-root branch and expm1-based real-root evaluation. The slow real root is rationalized to avoid cancellation. See V2_ARCHITECTURE.md for the full implementation formulas.

At k=0, ζ is null and ratio authority is disabled; c is preserved. expm1 handles the small-time viscous translation limit. Coefficient authority preserves c; ratio authority preserves ζ and derives c=2ζsqrt(km). Toggling does not reset the physical system.

Reference comparisons use 1e-10×max(1,|expected|). Sweeps allow 1e-10 J energy roundoff; independent finite differences use quantity-specific tolerances of 1e-6 for v, 1e-5 for a and 1e-4 for the energy derivative. Simpson energy-loss checks use 1e-9 J.

## 5. Physics architecture

One framework-independent createSdof factory, one unchanged SimulationClock, direct frame subscribers and semantic React state. No Rust physics, native permission expansion, backend or second clock. All derived values and SVG samples originate in the same solution. Numeric commits are now synchronous, fixing a real race where a queued numeric edit could be reinterpreted after an authority switch. Continuous sliders still coalesce.

## 6. User experience

Coefficient and ratio controls expose which quantity stays fixed; five presets use ζ=0,0.1,0.4,1,2 with m=1,k=100,x0=0.1,v0=0. Ordinary edits preserve simulation time; presets pause at zero. The mass, spring and added damper share the same stage.

Solid Fs and dashed Fd preserve direction and disclose their independent relative scales. Energy bars use a fixed E0 denominator, with the unfilled portion representing dissipation. Response and phase curves are analytical and fixed during playback. The damped graph does not repeat periodically; beyond its finite initial window the cursor is hidden with an explicit explanation. Scrubbing restores inspection within the window.

Five derivation steps link m/k/x/c to geometry. “Add damping” and “Find critical damping” are user-stepped, pausable, skippable and interruptible. The critical-return comparison is explicitly a release from rest. The inspector includes t/x/v/a/Fs/Fd/KE/PE/E/Pd/E0−E/residual; ζ and roots remain visible beside it.

## 7. Files created / modified

See [V2_FILES.md](V2_FILES.md) and [V2_ARCHITECTURE.md](V2_ARCHITECTURE.md). Frozen specifications, native capabilities and the clock/lifecycle implementation are unchanged.

## 8. Numerical validation

Full-precision values, six times per case, boundary results and independent quadrature are in [validation/v2-numerical.json](validation/v2-numerical.json).

| Case | ωn | ζ | ωd | Roots |
|---|---:|---:|---:|---|
| D | 10 | 0.2 | 9.797958971132712 | -2 ± 9.797958971132712i |
| E | 10 | 1 | not oscillatory | -10 |
| F | 10 | 2 | not oscillatory | -2.679491924311227; -37.32050807568878 |
| G | 0 | undefined (k=0) | not oscillatory | 0; -2 |
| H | 10 | 0 | 10 | 0 ± 10i |

Selected samples at t=0.2 s, SI units:

| Case | x | v | a | residual | E | E0−E |
|---|---:|---:|---:|---:|---:|---:|
| D | -0.012748444506208389 | -0.6330824697088734 | 3.8071743294563323 | -2.220446049250313e-16 | 0.20852284859273704 | 0.29147715140726294 |
| E | 0.040600584970983816 | -0.2706705664732254 | 1.3533528323661264 | 0 | 0.11905165277677221 | 0.3809483472232278 |
| F | 0.06303600222780176 | -0.16875084366851426 | 0.44643352396039404 | 0 | 0.21291530246258905 | 0.28708469753741095 |
| G | 0.1824199884910902 | 0.33516002301781966 | -0.6703200460356393 | 0 | 0.11233224102930543 | 0.1376677589706946 |
| H | -0.04161468365471424 | -0.9092974268256817 | 4.161468365471424 | 0 | 0.5 | 0 |

The 5,832-sample sweep found max |residual|=8.398837181289309e-14 N, max numerical energy increase=5.329070518200751e-15 J and max normalized finite-difference energy-derivative error=5.6093681396378715e-6.

At t=2 s, independent Simpson integration of Pd differed from E0−E by 0 J for c=0, 8.615330671091215e-14 J for c=4, 2.1309620734655255e-12 J for c=20 and 8.533174167268953e-12 J for c=40.

## 9. Boundary validation

ζ=1+epsilon tested for epsilon=−2e-8,−5e-9,−1e-12,0,1e-12,5e-9,2e-8, at t=0,0.001,0.2,1,10. All outputs remained finite and continuous and force residuals passed. Wider sweeps include ζ=0,1e-10,0.1,0.9,1±1e-9,1,2,10; all IC, force-direction, derivative and energy checks passed.

Bounded sampling additionally resolves the initial transient for m=0.25,k=0,c=500,v0=1 with points before 0.0001 s and at most 4097 total samples.

## 10. Test results

| Command | Result |
|---|---|
| npm test | 39 passed, 0 failed, 5 files |
| npm run test:ui | 49 passed, 0 failed: 25 interaction/accessibility + 24 visual |
| npm run typecheck | Passed |
| npm run build | Passed |
| npm run desktop:build | Passed, EXE and NSIS installer |
| node scripts/validate-damping.mjs | 5 reference groups, 5,832 sweep samples, boundaries and four quadratures passed |
| npx playwright test damping-visual.spec.ts --update-snapshots | 15 new reviewed V2 baselines; unchanged V1 baselines retained |
| node scripts/measure-performance-v2.mjs | Chromium measurement completed |
| node scripts/measure-scrub-v2.mjs | Chromium scrub measurement completed |
| node scripts/measure-production-v2.mjs | Not accepted: native focus/playing state did not remain valid |

One intermediate screenshot run overlapped a development hot update; the isolated repeat and final clean 49-test run passed without changing that baseline. Two initial test-authoring errors (range input syntax and matching explanatory “undefined” text) were corrected without reducing numeric coverage.

## 11. Desktop build

Production build succeeded:

- artifacts/modal-dynamics-lab.exe — 9,975,808 bytes.
- artifacts/Modal Dynamics Lab_0.2.0_x64-setup.exe — 265,387,147 bytes.

The installer embeds offline WebView2. The packaged application launched at http://tauri.localhost/ with native Tauri present and no development clock API. With network access disabled, all five presets were scrubbed to t=0.2, returned finite analytical values and displayed local KaTeX and energy results. Evidence: production-v2-smoke.json and production-v2-offline.png. These are unsigned local artifacts; a pristine-machine installer run was not performed.

## 12. Performance

Accepted measurements are from Chromium; they must not be relabeled as native Tauri results.

| Measurement | Chromium |
|---|---:|
| Normal FPS | 60.00300015000751 |
| Average frame interval | 16.66583333333333 ms |
| Worst recent interval | 16.80000000000109 ms |
| Active RAF loops | 1 |
| React commits during 10 s playback | 0 |
| c slider input→SVG p95 / max | 0.6000000089406967 / 1.199999988079071 ms |
| Next rendering opportunity p95 / max | 17.400000005960464 / 18.5 ms |
| Phase-space scrub input→SVG p95 / max | 1.0999999940395355 / 1.4000000059604645 ms |

Slider samples: 295; scrub samples: 283. After 1,000 pause/resume cycles, four Motion subscribers remained and zero RAF loops were active while paused.

Native controlled FPS/interval/commit/latency figures remain **unverified**. The production probe correctly rejected runs when the app remained suspended or playing state changed. Its validation-only RAF/React hooks were not included in the binary. Failed or inactive samples were not presented as usable performance evidence. Input timings are DOM/render-opportunity timings, not optical monitor latency.

## 13. Lifecycle / offline

Actual native client areas of 1440×900, 901×680 and 1920×1009 were observed without horizontal overflow. At minimum, stage width was 660 px and playback bottom y=631. Evidence: native-v2-minimum.json/png and production-v2-smoke.json.

The minimized development sample retained time=0 and frame count=3 across 1.5 s with zero RAF loops; it was already paused. This does **not** establish automatic resume of actively playing physics. Native minimize/restore playback acceptance remains blocked by unreliable focus/control observations during this run.

Packaged offline calculations and local fonts/equations passed. Common device-scale emulation 1,1.25,1.5,2 passed for damping. Physical OS DPI changes and multi-monitor movement were not tested.

## 14. Visual QA

Reviewed damping regimes, true envelope, force directions, energy loss, phase spiral, linked c token, dark/light parity, reduced motion and supported narrow layouts. Fifteen V2 screenshots supplement nine unchanged V1 screenshots. Reduced motion uses sampled window min/max positions rather than falsely reusing symmetric undamped extremes. Supporting content scrolls vertically at small sizes.

## 15. Accessibility

All five damping lenses in both themes passed axe with zero violations; prior Phase 1 audits also remain green. Native semantic controls, keyboard input, focus-visible, strict errors, Step/Scrub and non-color force encoding were verified. Reduced motion disables automatic playback while preserving analytical inspection. Screen-reader and physical touch hardware audits remain unperformed.

## 16. Known limitations

- Controlled native performance and automatic minimize/restore playback verification are incomplete; this prevents final Phase 2 acceptance.
- Windows automation alternately reported a minimized window, user-input interference, and native focus=false while the WebView reported focus. Later playback/parameter state also changed during measurement. These observations do not prove an application lifecycle defect; they do prevent a valid controlled measurement.
- The finite initial graph/phase window may not contain the full settling history. Beyond-window behavior is explicitly disclosed.
- Near criticality, a true underdamped envelope can be very large; enabling it may flatten the visible response scale.
- Full glyph-by-glyph equation morphing and A/B infrastructure were not added.
- Physical DPI/multi-monitor, pristine VM installation, signing, screen-reader/touch hardware and long-soak validation are not complete.
- The local JS chunk is 514.81 kB (158.20 kB gzip), producing Vite’s existing advisory 500 kB warning. It has no runtime network dependency.
- Settings remain session-only; the historical build-v0 staging directory is retained.

## 17. Spec deviations

NONE in frozen implementation scope, runtime or architecture. The incomplete native validation gate is explicitly reported above rather than treated as passed. No Phase 3 functionality was implemented.

## 18. Phase 3 readiness

The analytical core and UI boundaries are ready for a later 2DOF increment. **Do not begin Phase 3 until the outstanding native acceptance checks are completed and the next phase is explicitly authorized.** Stopped at Phase 2.
