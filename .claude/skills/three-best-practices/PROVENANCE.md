# Provenance

- Source repository: https://github.com/zebbern/claude-code-guide
- Skill path in source: skills/three-best-practices
- Retrieved: 2026-09-08
- License: MIT (see LICENSE in this folder, copied verbatim from the source repo root)
- Copied: verbatim, no content modifications
- Notes: the source repository (zebbern/claude-code-guide) is a large, mostly unrelated collection (network/web penetration-testing and red-team skills sit alongside this one). Only this single skill folder was inspected and copied; nothing else from that repository was installed or reviewed for security purposes. Version metadata in this skill's frontmatter claims "three-version: 0.182.0+"; Modal Dynamics Lab pins three@0.180.0 (package.json). The APIs this skill's rule files reference (Scene/Camera/Renderer lifecycle, geometry/material disposal, delta-time animation, draw-call counts) are stable across that gap, so the version drift is noted but non-blocking. This skill is a performance/memory REVIEW overlay, not a competing implementation authority — threejs-core/camera/geometry/materials/lighting/performance (alton47) remain the authorship layer, and mdl-threejs-scientific-viewport remains the architectural authority.
