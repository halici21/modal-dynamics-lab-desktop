# Viewport rules mapped to the existing prototype

Line references are to `src/visualization/RendererStudy.tsx` as of VISUAL EXPERIENCE R2 (0.4.0). Re-check line numbers after edits; the mapping is what matters, not the exact line.

| Invariant | Where it is already implemented | What breaks it |
|---|---|---|
| One authoritative clock | `clock.subscribe((t) => { const sample = solution.sample(t); ...; renderer.render(scene, camera); })` inside the `useEffect` | Adding `renderer.setAnimationLoop(...)` or a second `requestAnimationFrame` call anywhere in a Three.js view |
| No physics engine drives motion | `mesh.position.x = (i - 1) * 3 + Math.max(-0.9, Math.min(0.9, sample.x[i] * 8))` — position is a pure function of the solver sample | Importing `@dimforge/rapier3d`, `cannon-es`, or similar and stepping a rigid-body world each frame |
| Capped DPR | `renderer.setPixelRatio(Math.min(2, window.devicePixelRatio \|\| 1))` | Calling `setPixelRatio(window.devicePixelRatio)` uncapped |
| Resize handling | `ResizeObserver` on the mount element, updates `renderer.setSize` and (for `PerspectiveCamera`) `camera.aspect` + `updateProjectionMatrix()` | Fixed-size canvas with no resize handler, or reading `window.innerWidth` instead of the mount element's own size |
| Full disposal | `cleanup = () => { unsubscribe(); observer.disconnect(); renderer.dispose(); masses.forEach(m => { m.geometry.dispose(); m.material.dispose(); }); springs.forEach(...); if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement); }` returned from the effect | Omitting geometry/material disposal, leaving the canvas element attached after unmount, or not disconnecting the `ResizeObserver` |
| Camera restraint | Orthographic camera for the 2.5D prototype (`new THREE.OrthographicCamera(-5, 5, 3, -3, 0.1, 100)`); the spatial prototype uses a narrow 32° `PerspectiveCamera` with a fixed `lookAt(0, 0, 0)`, no `OrbitControls` | Adding `OrbitControls` with no min/max polar-angle or zoom limits, or a wide FOV that distorts scale reading |
| Critical labels stay in the DOM | `aria-label` on the host `div`, plus a visible `<span className="r2-renderer-status">` status line rendered as normal HTML alongside the canvas | Baking a numeric readout into a `THREE.Sprite`/`TextGeometry` inside the WebGL scene where it cannot be selected, translated, or read by a screen reader |
| No bloom / game aesthetic | Plain `MeshStandardMaterial`, one `AmbientLight` + one `DirectionalLight`, no postprocessing pass | Adding `UnrealBloomPass`, emissive-heavy materials, or particle systems for decoration |

## Selection wiring (not yet implemented in the prototype — required before promotion)

`RendererStudy.tsx` currently has no click/selection handling. Before this viewport could be promoted per the "hero scene" clause, it needs a `Raycaster`-based pick that sets the same `PhysicalSelection` state the SVG stage and `EquationDerivation` use (see `mdl-live-mathematics`'s `references/LIVE_MATH_GRAMMAR.md`), plus a visible selection outline (e.g. a duplicated slightly-scaled mesh with a flat unlit material, or an outline post-effect that does not count as "bloom/game aesthetic" if used purely for selection state, not ambience).

## GPU / WebView2 gate checklist (before promoting beyond prototype)

- Confirm `renderer.getContext()` returns a valid WebGL2 context inside the actual Tauri/WebView2 window, not only in a Chrome/Edge dev-server tab.
- Re-measure frame time against the project's existing performance targets (~16.7 ms budget, `AGENTS.md` section 11) with the packaged desktop build (`npm run desktop:build`), not the Vite dev server.
- Confirm minimize/restore does not leave the WebGL context stale or leak a render loop (`AGENTS.md` section 10) — a Three.js scene is more exposed to this than the existing SVG stage because WebGL contexts can be lost independently of React's lifecycle.
