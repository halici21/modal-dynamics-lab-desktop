# Scientific color semantics

Source of truth: `src/app/tokens.css`. Reproduced here (dark theme values; each has a light-theme override in the same file, same physical meaning, different lightness/saturation) so this mapping can be checked without opening the token file every time — but `tokens.css` remains the actual source of truth if the two ever drift.

| Token | Dark value | Physical meaning | Used in |
|---|---|---|---|
| `--displacement` | `#83c4e0` | Position / displacement quantity | Response plot, phase space, stage datum |
| `--velocity` | `#b9a2ed` | Velocity quantity | Phase space, force-balance views |
| `--force` | `#edb078` | Force quantity (spring/damper/external) | Force-vector overlays, force readouts |
| `--energy` | `#82c4a1` | Energy quantity (kinetic/potential/total/dissipated) | Energy views |
| `--mode-1` | `#83c4e0` | First mode identity | Mode-shape plots, mode selector |
| `--mode-2` | `#b9a2ed` | Second mode identity | Mode-shape plots, mode selector |
| `--warning` | `#e5bd81` | Non-physical: invalid-input / edge-case warning | Input validation |
| `--error` | `#ffaaaa` | Non-physical: invalid state | Input validation, NaN guards |

Note `--mode-1` currently reuses the same hue as `--displacement`, and `--mode-2` reuses `--velocity`'s hue. That is acceptable today because mode identity and displacement/velocity never appear as competing series in the same plot — but it means a future view that needs to show *both* a mode identity and a displacement/velocity series together must not reuse these tokens interchangeably; assign the mode a distinct hue for that view instead of assuming the token name alone disambiguates it.

## Rule for adding a new physical-quantity color (e.g. a future FEM stress or strain field)

1. Compute the new color's hue distance from every existing physical-quantity hue above (displacement/mode-1 ~200°, velocity/mode-2 ~265°, force ~30°, energy ~150° in OKLCH-ish terms — re-measure from the actual token values, do not eyeball).
2. Keep at least 15 degrees of hue separation from every existing physical-quantity color, matching `better-colors`'s "treat anything within 15° of hue as the same color" rule.
3. Derive light/dark variants the same way the existing tokens do: same hue, adjusted lightness/chroma per theme, never a hue shift between themes (a physical quantity's color identity should not appear to change meaning when the user switches theme).
4. Route the new color through a named semantic token in `tokens.css` (e.g. `--stress`), never a raw hex value inline in a component — this keeps `better-colors`'s token-naming rules and this skill's physical-semantics rule satisfied simultaneously.
5. Update this table.

## Anti-patterns specific to this project

- Using `--force` (orange) as a generic warm UI accent unrelated to force — collides with its physical meaning the moment a force vector and a UI accent appear in the same view.
- Introducing a second color for "energy" in a new module (e.g. FEM strain energy) instead of reusing `--energy`, when the quantity is genuinely the same physical concept.
- Letting a mode-shape plot's per-mode coloring drift from `--mode-1`/`--mode-2` when only two modes are shown, or failing to define a clear, consistent extension (e.g. a perceptually even sequence) when more than two modes need simultaneous color identity.
