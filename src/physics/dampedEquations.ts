export const DAMPED_EQUATIONS = [
  String.raw`m\ddot{x}+c\dot{x}+kx=0`,
  String.raw`\ddot{x}+\frac{c}{m}\dot{x}+\frac{k}{m}x=0`,
  String.raw`\omega_n^2=k/m,\quad 2\zeta\omega_n=c/m`,
  String.raw`r^2+2\zeta\omega_n r+\omega_n^2=0`,
  String.raw`r_{1,2}=-\zeta\omega_n\pm\omega_n\sqrt{\zeta^2-1}`,
];
export const DAMPED_EXPLANATIONS = [
  "Inertia balances spring and viscous damping terms. Select c to inspect the damper; Fd = −cv opposes velocity.",
  "Divide by positive mass. Viscous dissipation removes mechanical energy at Pd = cv².",
  "For k > 0, c critical = 2√(km) and ζ = c/c critical. At k = 0, ζ is undefined; solve v = v₀ exp(−ct/m) directly.",
  "Substitute x = exp(rt). The characteristic equation determines the free response.",
  "For k > 0: ζ < 1 gives conjugate roots; ζ = 1 a repeated root; ζ > 1 two real roots. The critical label uses |ζ−1| ≤ 10⁻⁸; the numerical solution remains exact on either side.",
];
