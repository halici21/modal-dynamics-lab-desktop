# VISUAL EXPERIENCE R2 — motion system

Motion has three separate contracts:

- Physics motion comes only from `SimulationClock` time and the validated solution sample.
- Interface motion uses 140–220ms tokenized CSS transitions for selection, panel presence and focus.
- Educational motion uses 250–450ms for a mode reveal, matrix relation or contextual explanation.

Opening assembly is a one-time 500–900ms optional sequence. Module transitions preserve object identity where possible, but they are visual comparisons rather than a physical parameter-switching event. Mode changes settle the stage, swap the selected shape and resume; they never interpolate eigenvectors as if that were a physical transient.

All transitions are interrupted on pointer, keyboard, scrub, reset, module change, resize and pause. Reduced motion removes assembly and camera-like reframing while preserving exact state, mode shape and Step. Three.js prototypes do not own a RAF or a clock; they render from the shared subscription.
