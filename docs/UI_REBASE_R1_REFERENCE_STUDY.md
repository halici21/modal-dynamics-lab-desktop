# R1 reference study

Read-only study on 2026-09-06. No reference repository cloned or vendored.

| Source | Availability / material inspected | Useful / adopted | Rejected | Usage / license |
|---|---|---|---|---|
| [sunumatik](https://github.com/ayberkdt/sunumatik) | Public; README, preset inventory | Scientific referents; local assets | WebGL scenes / presentation architecture | Principles only; no root license established, no copying |
| [uida](https://github.com/shadcn-ui/uida) | GitHub API 404; web open failed | None | No inferred content | No use |
| [lunaris](https://github.com/ayberkdt/lunaris/blob/main/docs/UI_THEME.md) | Public; complete UI_THEME.md | SSOT, opaque surfaces, role-based tokens | Qt/PySide, exact palette | Principles only; MIT |
| [shadcn/ui](https://github.com/shadcn-ui/ui) | Public; sidebar implementation, README | Source ownership, collapsible composition | Stock visuals, Tailwind migration, card kit | Principles only; MIT |
| [Radix](https://github.com/radix-ui/primitives) | Public; toggle-group/collapsible implementations | Explicit expanded/controls state, native buttons, focus ownership | Extra primitive dependencies where native semantics suffice | Principles only; MIT |
| [resizable panels](https://github.com/bvaughn/react-resizable-panels) | Public; Group/Panel/Separator API | Bounded keyboard/pointer resizing, pixel dock sizes | Per-frame parent layout state | Package dependency; MIT |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | Public; README | Restrained presence feedback | Second motion engine, physics easing | Principles only; MIT |
| [tweakcn](https://github.com/jnsahaj/tweakcn) | Public; README and theme motivation | Independent semantic palette and typography | Runtime editor, presets | Principles only; Apache-2.0 |
| [Origin experiments](https://github.com/origin-space/ui-experiments) | Public; README, listed Schema Visualizer/Dark Table compositions and terms | Work area hierarchy | Dashboard/crypto/chat composition | Inspiration only. Terms prohibit redistribution/resale even partial; no source reused |
| [Tremor](https://github.com/tremorlabs/tremor) | Public; LineChart legend/axis source excerpts | Compact labeled legends, linear data presentation | Recharts replacement and timers | Principles only; Apache-2.0 |

Dependency assessment: react-resizable-panels 4.12.3 solves accessible bounded dock/deck resizing absent from current stack. React 19 compatible; MIT; no runtime dependencies declared; 552947 bytes unpacked (not delivered bundle cost). Bundled locally, works offline. It owns layout events, never physics time. A home-grown splitter would require extra keyboard/constraint/capture edge-case code. Final total application JS delta versus the historical V2 report is +39.74kB minified / +13.30kB gzip; this includes R1 UI changes and is not an isolated package cost. No Radix/shadcn/Motion/Tailwind/chart package is necessary for native buttons, details and nonmodal contextual panels.
