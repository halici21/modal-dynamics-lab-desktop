/**
 * Modal Dynamics Studio — derivation content.
 *
 * Every formula here is the formula that drives the live computation; the
 * numbers interpolated into the steps come from the frozen solver's own output
 * (`AGENTS.md` §7, `mdl-pedagogy` gate). Nothing is hand-authored as an
 * illustrative equation.
 */
import type { Modal } from "../../physics/modal";
import type { SdofSolution } from "../../physics/sdof";
import type { System } from "../../physics/systems";
import { token } from "../selection";
import type { DerivationStep, EquationLine, Segment } from "./LiveMath";

const g = (tex: string): Segment => ({ tex });
const t = (tex: string, tokens: string[], text: string): Segment => ({
  tex,
  tokens,
  text,
});

const line = (id: string, segments: Segment[], note?: string): EquationLine => ({
  id,
  segments,
  note,
});

const M = token.mass(0);
const K = token.spring(0);
const C = token.damper(0);
const X = token.displacement(0);
const V = token.velocity(0);
const A = token.acceleration(0);
const W = token.omega(0);

const n = (v: number, d = 4) =>
  Number.isFinite(v) ? Number(v.toFixed(d)).toString() : "—";

/* ------------------------------------------------------------------ */
/* GATE 11 — Undamped SDOF, full step-by-step                          */
/* ------------------------------------------------------------------ */

export function undampedSdofSteps(s: SdofSolution): DerivationStep[] {
  const { stiffness, x0, v0 } = s.parameters;
  return [
    {
      title: "Newton's second law",
      focus: [M, A],
      lines: [
        line("newton", [
          g(String.raw`\sum F =`),
          t(String.raw`m\ddot{x}`, [M, A], "mass times acceleration"),
        ]),
      ],
      explain:
        "Only one body can move, and it has one coordinate. Whatever forces act on the mass must equal its inertia term.",
    },
    {
      title: "Hooke's law for the spring",
      focus: [K, X],
      lines: [
        line("hooke", [
          g(String.raw`F_s =`),
          g("-"),
          t(String.raw`k`, [K], "stiffness k"),
          t(String.raw`x`, [X], "displacement x"),
        ]),
      ],
      explain: `A linear spring pulls back toward equilibrium in proportion to how far the mass has moved. With k = ${stiffness} N/m, the force is ${stiffness} newtons per metre of displacement, and the minus sign is what makes it restoring rather than driving.`,
    },
    {
      title: "Substitute and rearrange",
      focus: [M, K, X, A],
      lines: [
        line("sub", [
          t(String.raw`m\ddot{x}`, [M, A], "m x double dot"),
          g("="),
          g("-"),
          t(String.raw`k`, [K], "k"),
          t(String.raw`x`, [X], "x"),
        ]),
        line(
          "eom",
          [
            t(String.raw`m\ddot{x}`, [M, A], "m x double dot"),
            g("+"),
            t(String.raw`k`, [K], "k"),
            t(String.raw`x`, [X], "x"),
            g("= 0"),
          ],
          "The equation of motion. Everything after this point follows from it.",
        ),
      ],
      explain:
        "Move the spring force to the left. Inertia plus restoring stiffness equals zero: the system is free, with no forcing and no damping.",
    },
    {
      title: "Assume an exponential solution",
      focus: [X, V, A],
      lines: [
        line("assume", [
          t(String.raw`x(t)`, [X], "x of t"),
          g(String.raw`= Ae^{st}`),
        ]),
        line("d1", [
          t(String.raw`\dot{x}`, [V], "x dot"),
          g(String.raw`= sAe^{st}`),
        ]),
        line("d2", [
          t(String.raw`\ddot{x}`, [A], "x double dot"),
          g(String.raw`= s^{2}Ae^{st}`),
        ]),
      ],
      explain:
        "A linear constant-coefficient equation is satisfied by an exponential. Each derivative brings down one factor of s, which is what turns calculus into algebra.",
    },
    {
      title: "Characteristic equation",
      focus: [M, K],
      lines: [
        line("subst", [
          t(String.raw`m`, [M], "m"),
          g(String.raw`s^{2}Ae^{st} +`),
          t(String.raw`k`, [K], "k"),
          g(String.raw`Ae^{st} = 0`),
        ]),
        line(
          "char",
          [
            t(String.raw`m`, [M], "m"),
            g(String.raw`s^{2} +`),
            t(String.raw`k`, [K], "k"),
            g("= 0"),
          ],
          "Valid because Ae^{st} is never zero for nontrivial motion.",
        ),
      ],
      explain:
        "Substituting reduces the differential equation to a quadratic in s. Dividing out the common exponential is legitimate only because a nonzero motion requires A ≠ 0.",
    },
    {
      title: "Solve for the natural frequency",
      focus: [M, K, W],
      lines: [
        line("s2", [
          g(String.raw`s^{2} = -\dfrac{`),
          t(String.raw`k`, [K], "k"),
          g(String.raw`}{`),
          t(String.raw`m`, [M], "m"),
          g("}"),
        ]),
        line("roots", [g(String.raw`s = \pm i\sqrt{k/m}`)]),
        line(
          "omega",
          [
            t(String.raw`\omega_n`, [W], "omega n"),
            g(String.raw`= \sqrt{\dfrac{`),
            t(String.raw`k`, [K], "k"),
            g(String.raw`}{`),
            t(String.raw`m`, [M], "m"),
            g(String.raw`}} = ` + n(s.omega) + String.raw`\ \mathrm{rad/s}`),
          ],
          `f_n = ω_n / 2π = ${n(s.frequency)} Hz.`,
        ),
      ],
      explain:
        "The roots are purely imaginary, so the motion neither grows nor decays. Their magnitude is the natural angular frequency — set by stiffness and mass alone, never by how hard you pulled.",
    },
    {
      title: "Real form of the solution",
      focus: [X, W],
      lines: [
        line("real", [
          t(String.raw`x(t)`, [X], "x of t"),
          g(String.raw`= C_1\cos(`),
          t(String.raw`\omega_n`, [W], "omega n"),
          g(String.raw`t) + C_2\sin(`),
          t(String.raw`\omega_n`, [W], "omega n"),
          g(String.raw`t)`),
        ]),
      ],
      explain:
        "A pair of complex-conjugate roots combines into a real cosine and sine at the same frequency. Two unknown constants remain, matching the two initial conditions a second-order system needs.",
    },
    {
      title: "Apply the initial conditions",
      focus: [X, V, W],
      lines: [
        line("ic", [
          g(String.raw`x(0) = ` + n(x0) + String.raw`,\quad \dot{x}(0) = ` + n(v0)),
        ]),
        line("consts", [
          g(String.raw`C_1 = x_0,\quad C_2 = \dfrac{v_0}{`),
          t(String.raw`\omega_n`, [W], "omega n"),
          g("}"),
        ]),
        line(
          "final",
          [
            t(String.raw`x(t)`, [X], "x of t"),
            g(String.raw`= x_0\cos(`),
            t(String.raw`\omega_n`, [W], "omega n"),
            g(String.raw`t) + \dfrac{v_0}{`),
            t(String.raw`\omega_n`, [W], "omega n"),
            g(String.raw`}\sin(`),
            t(String.raw`\omega_n`, [W], "omega n"),
            g(String.raw`t)`),
          ],
          s.amplitude !== null
            ? `Amplitude ${n(s.amplitude)} m, period ${n(s.period ?? 0)} s.`
            : undefined,
        ),
      ],
      explain:
        "The constants are fixed by where the mass started and how fast it was moving. This is the exact expression the viewport and the response plot are both sampling right now.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* GATE 12 — Damped and forced SDOF                                    */
/* ------------------------------------------------------------------ */

export function dampedSdofSteps(s: SdofSolution): DerivationStep[] {
  const disc = s.damping * s.damping - 4 * s.parameters.mass * s.parameters.stiffness;
  return [
    {
      title: "Add the viscous damper",
      focus: [M, C, K, X, V, A],
      lines: [
        line("eom", [
          t(String.raw`m\ddot{x}`, [M, A], "m x double dot"),
          g("+"),
          t(String.raw`c\dot{x}`, [C, V], "c x dot"),
          g("+"),
          t(String.raw`k`, [K], "k"),
          t(String.raw`x`, [X], "x"),
          g("= 0"),
        ]),
      ],
      explain: `A linear dashpot resists velocity, not position. With c = ${n(s.damping, 3)} N·s/m it removes energy whenever the mass is moving, and does nothing at the turning points.`,
    },
    {
      title: "Characteristic equation",
      focus: [M, C, K],
      lines: [
        line("char", [
          t(String.raw`m`, [M], "m"),
          g(String.raw`s^{2} +`),
          t(String.raw`c`, [C], "c"),
          g("s +"),
          t(String.raw`k`, [K], "k"),
          g("= 0"),
        ]),
      ],
      explain:
        "The same exponential substitution now gives a quadratic with a first-order term. Its discriminant decides everything about the shape of the motion.",
    },
    {
      title: "Discriminant and roots",
      focus: [M, C, K],
      lines: [
        line("disc", [
          g(String.raw`\Delta =`),
          t(String.raw`c^{2}`, [C], "c squared"),
          g("- 4"),
          t(String.raw`m`, [M], "m"),
          t(String.raw`k`, [K], "k"),
          g("=" + " " + n(disc, 3)),
        ]),
        line("roots", [
          g(
            String.raw`s_{1,2} = \dfrac{-c \pm \sqrt{\Delta}}{2m} = ` +
              s.roots
                .map(
                  (r) =>
                    n(r.real, 3) +
                    (r.imaginary ? (r.imaginary > 0 ? " + " : " - ") + n(Math.abs(r.imaginary), 3) + "i" : ""),
                )
                .join(",\\ "),
          ),
        ]),
      ],
      explain:
        "A negative discriminant gives a complex pair and oscillation inside a decaying envelope. Zero gives one repeated real root. Positive gives two distinct real roots and no oscillation at all.",
    },
    {
      title: "Regime",
      focus: [C],
      lines: [
        line("zeta", [
          g(String.raw`\zeta = \dfrac{`),
          t(String.raw`c`, [C], "c"),
          g(String.raw`}{2\sqrt{mk}} = ` + (s.zeta === null ? "undefined" : n(s.zeta))),
        ]),
        line("regime", [g(String.raw`\text{` + s.regime + "}")]),
        line(
          "wd",
          [
            g(
              s.dampedOmega !== null
                ? String.raw`\omega_d = \omega_n\sqrt{1-\zeta^{2}} = ` + n(s.dampedOmega)
                : String.raw`\text{no damped oscillation frequency}`,
            ),
          ],
          "Critical damping is the fastest non-oscillatory return, not the strongest damping.",
        ),
      ],
      explain:
        "The root structure and the damping ratio are two views of the same fact. Underdamped roots are complex; critical is the boundary; overdamped roots are both real and negative.",
    },
  ];
}

export function forcedSdofSteps(
  mass: number,
  damping: number,
  stiffness: number,
  amplitude: number,
  omega: number,
): DerivationStep[] {
  return [
    {
      title: "Forced equation of motion",
      focus: [M, C, K, X],
      lines: [
        line("eom", [
          t(String.raw`m\ddot{x}`, [M, A], "m x double dot"),
          g("+"),
          t(String.raw`c\dot{x}`, [C, V], "c x dot"),
          g("+"),
          t(String.raw`k`, [K], "k"),
          t(String.raw`x`, [X], "x"),
          g(String.raw`= F(t)`),
        ]),
      ],
      explain: `An external force now appears on the right. Here F(t) = ${n(amplitude, 3)} cos(${n(omega, 3)} t) N.`,
    },
    {
      title: "Split the solution",
      focus: [X],
      lines: [
        line("split", [
          t(String.raw`x(t)`, [X], "x of t"),
          g(String.raw`= x_h(t) + x_p(t)`),
        ]),
      ],
      explain:
        "The homogeneous part is the free response you already derived; it decays whenever there is damping. The particular part is driven by the force and persists.",
    },
    {
      title: "Transient and steady state",
      focus: [X],
      lines: [
        line("steady", [
          g(String.raw`x_p(t) = |X|\cos(\Omega t - \phi),\quad |X| = \dfrac{F_0}{\sqrt{(k-m\Omega^{2})^{2} + (c\Omega)^{2}}}`),
        ]),
      ],
      explain:
        "After the transient dies, only the steady state remains, at the excitation frequency — not at the natural frequency. With damping present the displacement peak need not sit exactly at ω_n.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* GATE 13 — 2DOF: forces to matrices to eigenproblem                  */
/* ------------------------------------------------------------------ */

export function twoDofSteps(system: System, modal: Modal | undefined): DerivationStep[] {
  const links = system.links ?? [];
  const k = (label: string) => links.find((l) => l.label === label)?.k ?? 0;
  const k1 = k("k1"), k2 = k("k2"), k3 = k("k3");
  const m1 = system.M[0]?.[0] ?? 1;
  const m2 = system.M[1]?.[1] ?? 1;
  const idx = (label: string) => links.findIndex((l) => l.label === label);
  const K1 = token.spring(Math.max(0, idx("k1")));
  const K2 = token.spring(Math.max(0, idx("k2")));
  const K3 = token.spring(Math.max(0, idx("k3")));
  const M1 = token.mass(0), M2 = token.mass(1);
  const X1 = token.displacement(0), X2 = token.displacement(1);

  const steps: DerivationStep[] = [
    {
      title: "Free body: mass 1",
      focus: [M1, K1, K2, X1, X2],
      lines: [
        line("fbd1", [
          t(String.raw`m_1\ddot{x}_1`, [M1], "m1 x1 double dot"),
          g("= -"),
          t(String.raw`k_1x_1`, [K1, X1], "k1 x1"),
          g("-"),
          t(String.raw`k_2(x_1-x_2)`, [K2, X1, X2], "k2 times x1 minus x2"),
        ]),
        line(
          "eom1",
          [
            t(String.raw`m_1\ddot{x}_1`, [M1], "m1 x1 double dot"),
            g("+ ("),
            t(String.raw`k_1`, [K1], "k1"),
            g("+"),
            t(String.raw`k_2`, [K2], "k2"),
            g(")"),
            t(String.raw`x_1`, [X1], "x1"),
            g("-"),
            t(String.raw`k_2`, [K2], "k2"),
            t(String.raw`x_2`, [X2], "x2"),
            g("= 0"),
          ],
          `k₁ = ${k1} N/m, k₂ = ${k2} N/m.`,
        ),
      ],
      explain:
        "Mass 1 feels its own ground spring and the coupling spring. The coupling force depends on the DIFFERENCE of the two displacements, which is where coupling comes from.",
    },
    {
      title: "Free body: mass 2",
      focus: [M2, K2, K3, X1, X2],
      lines: [
        line("fbd2", [
          t(String.raw`m_2\ddot{x}_2`, [M2], "m2 x2 double dot"),
          g("= -"),
          t(String.raw`k_3x_2`, [K3, X2], "k3 x2"),
          g("-"),
          t(String.raw`k_2(x_2-x_1)`, [K2, X1, X2], "k2 times x2 minus x1"),
        ]),
        line(
          "eom2",
          [
            t(String.raw`m_2\ddot{x}_2`, [M2], "m2 x2 double dot"),
            g("-"),
            t(String.raw`k_2`, [K2], "k2"),
            t(String.raw`x_1`, [X1], "x1"),
            g("+ ("),
            t(String.raw`k_2`, [K2], "k2"),
            g("+"),
            t(String.raw`k_3`, [K3], "k3"),
            g(")"),
            t(String.raw`x_2`, [X2], "x2"),
            g("= 0"),
          ],
          `k₃ = ${k3} N/m.`,
        ),
      ],
      explain:
        "The same coupling spring appears in both equations with opposite sign, because it pulls the two masses toward each other. Selecting k₂ lights both rows at once for exactly this reason.",
    },
    {
      title: "Assemble into matrices",
      focus: [M1, M2, K1, K2, K3, token.cell("K", 0, 0), token.cell("K", 0, 1), token.cell("K", 1, 0), token.cell("K", 1, 1)],
      lines: [
        line("matrix", [
          g(String.raw`M\ddot{x} + Kx = 0`),
        ]),
        line("mk", [
          g(
            String.raw`M = \begin{bmatrix}` + m1 + ` & 0\\\\0 & ` + m2 + String.raw`\end{bmatrix},\quad K = \begin{bmatrix}` +
              (k1 + k2) + ` & ` + -k2 + `\\\\` + -k2 + ` & ` + (k2 + k3) +
              String.raw`\end{bmatrix}`,
          ),
        ]),
      ],
      explain:
        "Nothing new is happening — the two scalar equations are the two rows of one matrix equation. M is diagonal because each inertia term involves only its own coordinate; K is not, and its off-diagonal entries are precisely the coupling.",
    },
    {
      title: "Where the coupling spring lands",
      focus: [K2, token.cell("K", 0, 0), token.cell("K", 0, 1), token.cell("K", 1, 0), token.cell("K", 1, 1)],
      lines: [
        line("local", [
          g(
            String.raw`k_2\begin{bmatrix}1 & -1\\\\-1 & 1\end{bmatrix} \rightarrow K_{11}\!+\!k_2,\ K_{12}\!-\!k_2,\ K_{21}\!-\!k_2,\ K_{22}\!+\!k_2`,
          ),
        ]),
      ],
      explain:
        "One spring contributes a rank-one 2×2 block. The signs are not decoration: the positive diagonal resists each mass moving alone, and the negative off-diagonal is what lets them move together for free.",
    },
    {
      title: "Eigenproblem",
      focus: [token.mode(0), token.mode(1)],
      lines: [
        line("assume", [
          g(String.raw`x(t) = \varphi e^{i\omega t} \Rightarrow \ddot{x} = -\omega^{2}\varphi e^{i\omega t}`),
        ]),
        line("gen", [g(String.raw`(K - \omega^{2}M)\varphi = 0`)]),
        line(
          "det",
          [g(String.raw`\det(K - \omega^{2}M) = 0`)],
          "A nontrivial mode shape exists only where the matrix is singular.",
        ),
      ],
      explain:
        "Assume every coordinate moves at the same frequency with a fixed relative pattern. That turns the differential system into a generalized eigenproblem: the frequencies are the eigenvalues, the patterns are the eigenvectors.",
    },
  ];

  if (modal)
    steps.push({
      title: "Solutions",
      focus: modal.modes.map((_, i) => token.mode(i)),
      lines: modal.modes.map((m, i) =>
        line(
          "mode" + i,
          [
            {
              tex: String.raw`\omega_` + (i + 1) + " = " + n(m.omega) + String.raw`\ \mathrm{rad/s}`,
              tokens: [token.omega(i), token.mode(i)],
              text: `omega ${i + 1}`,
            },
            g(
              String.raw`,\quad f_` + (i + 1) + " = " + n(m.frequency) +
                String.raw`\ \mathrm{Hz},\quad \varphi_` + (i + 1) + String.raw` = \begin{bmatrix}` +
                m.phi.map((v) => n(v / Math.max(...m.phi.map(Math.abs)), 3)).join(String.raw`\\\\`) +
                String.raw`\end{bmatrix}`,
            ),
          ],
          i === 0
            ? "In-phase: both masses move the same way, so the coupling spring barely stretches."
            : "Out-of-phase: the coupling spring works hardest, which is why this mode is stiffer and faster.",
        ),
      ),
      explain:
        "Selecting a solution animates that mode in the viewport immediately. φ and −φ describe the same physical mode.",
    });

  return steps;
}

/* ------------------------------------------------------------------ */
/* GATE 14 — MDOF generalization                                       */
/* ------------------------------------------------------------------ */

export function mdofSteps(system: System, modal: Modal | undefined): DerivationStep[] {
  const N = system.M.length;
  const elastic = modal?.modes.filter((m) => m.kind === "elastic").length ?? N;
  const zero = (modal?.modes.length ?? N) - elastic;
  return [
    {
      title: "The same equation, N coordinates",
      focus: [],
      lines: [
        line("eom", [g(String.raw`M\ddot{x} + Kx = 0,\quad x \in \mathbb{R}^{` + N + "}")]),
      ],
      explain:
        "Nothing about the derivation changes when you add coordinates. The bookkeeping grows; the physics does not. This is why the symbolic determinant is not expanded here — it teaches nothing past 2×2.",
    },
    {
      title: "Generalized eigenproblem",
      focus: [],
      lines: [
        line("eig", [g(String.raw`K\varphi_i = \omega_i^{2}M\varphi_i,\quad i = 1\ldots` + N)]),
        line(
          "count",
          [g(String.raw`N = ` + N + String.raw`\ \text{DOF} \Rightarrow ` + N + String.raw`\ \text{modal directions}`)],
          zero
            ? `${zero} of them are rigid-body modes at ω = 0; ${elastic} are elastic.`
            : "All modes are elastic; every one stores strain energy.",
        ),
      ],
      explain:
        "N degrees of freedom give N modal directions. A mode's index is a position in the frequency ordering, not a claim about how large its displacement is.",
    },
    {
      title: "Orthogonality and the modal basis",
      focus: [],
      lines: [
        line("orth", [
          g(String.raw`\varphi_i^{T}M\varphi_j = 0,\quad \varphi_i^{T}K\varphi_j = 0\quad (i \neq j)`),
        ]),
        line(
          "gram",
          [g(String.raw`\Phi^{T}M\Phi = I,\quad \Phi^{T}K\Phi = \Lambda`)],
          modal
            ? `Measured: max |ΦᵀMΦ − I| = ${modal.massError.toExponential(2)}, max |ΦᵀKΦ − Λ| = ${modal.stiffnessError.toExponential(2)}.`
            : undefined,
        ),
      ],
      explain:
        "Modes are orthogonal with respect to both mass and stiffness. That is what lets the coupled system be rewritten as N independent single-degree-of-freedom problems.",
    },
    {
      title: "Visualization scale is display only",
      focus: [],
      lines: [
        line("visual", [g(String.raw`u_{\text{visual}} = A_{\text{visual}}\,\varphi_i\,s(t)`)]),
      ],
      explain:
        "The animated amplitude is chosen so the shape is legible. It is not a physical response amplitude, and switching between max-normalised and mass-normalised changes the numbers without changing the relative pattern — same mode, different representation.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* GATE 15 — Free-free                                                 */
/* ------------------------------------------------------------------ */

export function freeFreeSteps(modal: Modal | undefined): DerivationStep[] {
  const zeros = modal?.modes.filter((m) => m.kind === "zero") ?? [];
  return [
    {
      title: "Remove every support",
      focus: [],
      lines: [
        line("k", [g(String.raw`K\varphi_{RB} = 0`)]),
      ],
      explain:
        "With no boundary condition, some motions produce no strain at all. For those shapes the stiffness matrix returns exactly zero — the structure is not resisting, it is simply moving.",
    },
    {
      title: "Zero eigenvalues",
      focus: [],
      lines: [
        line("lambda", [g(String.raw`\lambda = 0 \Rightarrow \omega = 0 \Rightarrow f = 0`)]),
        line(
          "count",
          [
            g(
              String.raw`\text{rigid modes found} = ` + zeros.length +
                (modal ? String.raw`,\quad \text{tolerance } ` + modal.zeroTolerance.toExponential(2) : ""),
            ),
          ],
          "These are physics, not solver noise: they are the price of removing the supports.",
        ),
      ],
      explain:
        "A rigid-body mode has zero frequency because it stores no strain energy. Counting them first is what stops you calling mode 7 'the seventh elastic mode'.",
    },
    {
      title: "The zero eigenspace is not a named basis",
      focus: [],
      lines: [
        line("space", [
          g(String.raw`\varphi \in \mathrm{null}(K),\quad \dim = ` + zeros.length),
        ]),
      ],
      explain:
        "Any linear combination of rigid-body motions is also a rigid-body motion. A solver returns SOME basis of that null space — not guaranteed to be exactly Tx, Ty, Tz, Rx, Ry, Rz. The named six are a convenient basis you choose, not something the eigensolver promises.",
    },
    {
      title: "Six rigid motions in three dimensions",
      focus: [],
      lines: [
        line("six", [
          g(String.raw`\{T_x, T_y, T_z, R_x, R_y, R_z\}\ \text{spans the null space of an unconstrained 3D body}`),
        ]),
      ],
      explain:
        "Three translations and three rotations. Select one in the viewport to see it applied to the body; the axes and the camera are there to make a rotation unmistakably a rotation.",
    },
  ];
}

/* ------------------------------------------------------------------ */
/* GATE 16 — FEM assembly                                              */
/* ------------------------------------------------------------------ */

export function femSteps(
  kind: string,
  elementCount: number,
  freeCount: number,
  fixedCount: number,
  modal: Modal | undefined,
  selectedElement: number | null,
  local?: { K: number[][]; M: number[][]; dofs: number[]; L: number },
  labels: string[] = [],
): DerivationStep[] {
  const mat = (a: number[][], digits = 3) =>
    String.raw`\begin{bmatrix}` +
    a
      .map((r) => r.map((v) => Number(v.toPrecision(digits)).toExponential(2)).join(" & "))
      .join(String.raw`\\\\`) +
    String.raw`\end{bmatrix}`;
  return [
    {
      title: "One element at a time",
      focus: selectedElement !== null ? [token.element(selectedElement)] : [],
      lines: local
        ? [
            line("ke", [g(String.raw`K_e = ` + mat(local.K))]),
            line("me", [g(String.raw`M_e = ` + mat(local.M))], `Element length L = ${n(local.L, 4)} m.`),
          ]
        : [line("pick", [g(String.raw`\text{Select an element to see } K_e, M_e`)])],
      explain: `A ${kind} element carries its own stiffness and consistent mass matrix, written in its own local degrees of freedom. Nothing global has happened yet.`,
    },
    {
      title: "Element to global DOF mapping",
      focus: selectedElement !== null ? [token.element(selectedElement)] : [],
      lines: local
        ? [
            line("map", [
              g(
                String.raw`\text{local } [` +
                  local.dofs.map((_, i) => i + 1).join(", ") +
                  String.raw`] \rightarrow \text{global } [` +
                  local.dofs.map((d) => d + 1).join(", ") +
                  "]",
              ),
            ]),
            line(
              "names",
              [g(String.raw`\text{` + local.dofs.map((d) => labels[d] ?? "dof " + (d + 1)).join(", ") + "}")],
              "Every local entry is added into exactly one global position.",
            ),
          ]
        : [line("pick2", [g(String.raw`\text{Select an element}`)])],
      explain:
        "Assembly is nothing more than addition at the right addresses. Two elements that share a node add into the same global row and column, which is what makes the structure continuous.",
    },
    {
      title: "Global matrices",
      focus: [],
      lines: [
        line("global", [
          g(String.raw`K = \sum_{e=1}^{` + elementCount + String.raw`} L_e^{T}K_eL_e,\quad M = \sum_{e=1}^{` + elementCount + String.raw`} L_e^{T}M_eL_e`),
        ]),
      ],
      explain:
        "Summing every element's contribution gives the unconstrained global matrices. At this point the structure still has all its degrees of freedom, including the ones the supports will remove.",
    },
    {
      title: "Boundary conditions",
      focus: [],
      lines: [
        line("bc", [
          g(
            String.raw`\text{eliminate } ` + fixedCount + String.raw`\text{ constrained DOF} \Rightarrow \bar{K}, \bar{M} \in \mathbb{R}^{` +
              freeCount + String.raw`\times` + freeCount + "}",
          ),
        ]),
      ],
      explain:
        fixedCount === 0
          ? "Nothing is eliminated here — this model is free-free, so rigid-body modes survive into the eigenproblem."
          : "Essential constraints remove their rows and columns entirely. Those DOFs are not free to move, so they do not participate in the eigenproblem.",
    },
    {
      title: "Reduced eigenproblem and mode shape",
      focus: [],
      lines: [
        line("eig", [g(String.raw`\bar{K}\varphi_i = \omega_i^{2}\bar{M}\varphi_i`)]),
        line(
          "modes",
          [
            g(
              modal
                ? String.raw`f_1 = ` + n(modal.modes[0].frequency) + String.raw`\ \mathrm{Hz}`
                : String.raw`\text{no modal solution}`,
            ),
          ],
          "Displayed deformation is amplified for legibility; it is not a response amplitude.",
        ),
      ],
      explain:
        "The same generalized eigenproblem as every other study in this app, now on matrices a mesh produced. Refining the mesh changes the approximation, not the physical question.",
    },
  ];
}
