# Pedagogy R1 — internal walkthrough

This is an internal scenario review, not human usability research.

## Beginner — basic calculus/mechanics

The first run starts on moving SDOF and presents “Why does the mass keep moving?” in the learning surface. The beginner can predict, run stiffness experiment, observe the stage, then reveal the equation. Friction: the first lesson still uses engineering terms such as equilibrium and natural frequency; the wording stays short and the stage supplies the referent. Bypass: Explore is one click away.

## Engineering student — equations known, modal analysis new

The student can jump to 2DOF or FRF from the rail, choose Learn for a matrix-origin or input-output sequence, then switch Inspect for M/K, residuals, normalization and FRF values. Useful discovery: coupling is introduced from a physical spring before matrix notation. Friction: the single learning surface is intentionally concise, so deeper derivations remain in Inspect.

## Expert — direct tools

The expert can select any workspace immediately, choose Explore or Inspect, edit matrices and use existing diagnostics. No lesson lock, account, modal carousel or forced resume exists. Useful discovery: progress labels explain the suggested prerequisite without blocking access.

The walkthrough supports the design decision that lessons are a depth layer over the workbench rather than a second application.
