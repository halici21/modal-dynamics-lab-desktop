import { useEffect, useMemo, useRef, useState } from "react";
import type { SimulationClock } from "../animation/SimulationClock";
import { chain } from "../physics/systems";
import { modalResponse, solveModal } from "../physics/modal";
import { rendererDefaults } from "../design/visualization";

type Prototype = "svg" | "three-2.5d" | "three-spatial";
const names: Record<Prototype, string> = {
  svg: "A · Refined SVG",
  "three-2.5d": "B · Three.js 2.5D",
  "three-spatial": "C · Spatial Three.js",
};

function useStudySolution() {
  return useMemo(() => {
    const system = chain([1, 1, 1], [100, 100, 100, 100], "fixed-fixed");
    const modal = solveModal(system);
    return modalResponse(modal, [0.1, 0, 0], [0, 0, 0]);
  }, []);
}

function SvgPrototype({ clock, solution }: { clock: SimulationClock; solution: ReturnType<typeof useStudySolution> }) {
  const root = useRef<SVGSVGElement>(null);
  useEffect(() => clock.subscribe((t) => {
    const sample = solution.sample(t);
    root.current?.querySelectorAll<SVGGElement>("[data-study-mass]").forEach((node, i) => {
      const x = 150 + i * 180 + Math.max(-42, Math.min(42, sample.x[i] * 420));
      node.setAttribute("transform", `translate(${x} 0)`);
    });
  }), [clock, solution]);
  return <svg ref={root} className="r2-prototype-svg" viewBox="0 0 700 250" role="img" aria-label="Prototype A refined SVG three degree of freedom mode">
    <path d="M40 178H660" className="study-rail" />
    <path d="M40 75V178M660 75V178" className="study-support" />
    {[0, 1, 2].map((i) => <g key={i} data-study-mass={i} transform={`translate(${150 + i * 180} 0)`}>
      <line x1="0" x2="0" y1="68" y2="190" className="study-datum" />
      <rect x="-28" y="110" width="56" height="68" rx="8" className="study-mass" />
      <text x="0" y="150" textAnchor="middle" className="study-label">x{i + 1}</text>
    </g>)}
    <text x="40" y="222" className="study-caption">same modal response · t follows the production clock</text>
  </svg>;
}

function ThreePrototype({ clock, solution, spatial }: { clock: SimulationClock; solution: ReturnType<typeof useStudySolution>; spatial: boolean }) {
  const host = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState("WebGL initialising");
  useEffect(() => {
    let disposed = false;
    let cleanup = () => {};
    void (async () => {
      const THREE = await import("three");
      const mount = host.current;
      if (!mount || disposed) return;
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(getComputedStyle(document.documentElement).getPropertyValue("--surface-stage").trim() || "#17191d");
      const width = Math.max(320, mount.clientWidth), height = Math.max(230, mount.clientHeight);
      const camera = spatial ? new THREE.PerspectiveCamera(32, width / height, 0.1, 100) : new THREE.OrthographicCamera(-5, 5, 3, -3, 0.1, 100);
      camera.position.set(spatial ? 7 : 0, spatial ? 5 : 0, spatial ? 10 : 10);
      camera.lookAt(0, 0, 0);
      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
      renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
      renderer.setSize(width, height, false);
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      mount.appendChild(renderer.domElement);
      scene.add(new THREE.AmbientLight(0xb8c8d4, 1.7));
      const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(3, 6, 8); scene.add(key);
      const floor = new THREE.Mesh(new THREE.BoxGeometry(10, 0.06, 1.2), new THREE.MeshStandardMaterial({ color: 0x516270, roughness: 0.68, metalness: 0.18 })); floor.position.y = -1.35; scene.add(floor);
      const masses = [0, 1, 2].map((i) => { const material = new THREE.MeshStandardMaterial({ color: i === 0 ? 0x80c7df : i === 1 ? 0xa996e9 : 0xe9b47e, roughness: 0.32, metalness: 0.45 }); const mesh = new THREE.Mesh(new THREE.BoxGeometry(1.05, 0.95, spatial ? 0.72 : 0.24), material); mesh.position.set((i - 1) * 3.0, -0.72, 0); scene.add(mesh); return mesh; });
      const springs = [0, 1, 2, 3].map((i) => { const geometry = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(-5 + i * 3.3, -0.72, 0), new THREE.Vector3(-3.9 + i * 3.3, -0.72, 0)]); const line = new THREE.Line(geometry, new THREE.LineBasicMaterial({ color: 0xc2d0d8 })); scene.add(line); return line; });
      const resize = () => { const w = Math.max(320, mount.clientWidth), h = Math.max(230, mount.clientHeight); renderer.setSize(w, h, false); if (camera instanceof THREE.PerspectiveCamera) camera.aspect = w / h; camera.updateProjectionMatrix(); };
      const observer = new ResizeObserver(resize); observer.observe(mount);
      const unsubscribe = clock.subscribe((t) => { const sample = solution.sample(t); masses.forEach((mesh, i) => { mesh.position.x = (i - 1) * 3 + Math.max(-0.9, Math.min(0.9, sample.x[i] * 8)); }); springs.forEach((line, i) => { const a = i === 0 ? -5 : masses[i - 1].position.x + 0.55; const b = i === 3 ? 5 : masses[i].position.x - 0.55; line.geometry.setFromPoints([new THREE.Vector3(a, -0.72, 0), new THREE.Vector3(b, -0.72, 0)]); }); renderer.render(scene, camera); });
      setStatus(`WebGL · ${rendererDefaults.backend.toUpperCase()} contract · DPR ${Math.min(2, window.devicePixelRatio || 1).toFixed(1)} · shared clock`);
      cleanup = () => { unsubscribe(); observer.disconnect(); renderer.dispose(); masses.forEach((m) => { m.geometry.dispose(); (m.material as { dispose(): void }).dispose(); }); springs.forEach((line) => { line.geometry.dispose(); (line.material as { dispose(): void }).dispose(); }); if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement); };
    })();
    return () => { disposed = true; cleanup(); };
  }, [clock, solution, spatial]);
  return <div ref={host} className="r2-three-host" role="img" aria-label={spatial ? "Prototype C spatial Three.js modal stage" : "Prototype B Three.js two and a half dimensional modal stage"}><span className="r2-renderer-status">{status}</span></div>;
}
export function RendererStudy({ clock }: { clock: SimulationClock }) {
  const [prototype, setPrototype] = useState<Prototype>("svg");
  const [reduced, setReduced] = useState(() => matchMedia("(prefers-reduced-motion: reduce)").matches);
  const solution = useStudySolution();
  useEffect(() => { const m = matchMedia("(prefers-reduced-motion: reduce)"); const f = () => setReduced(m.matches); m.addEventListener("change", f); return () => m.removeEventListener("change", f); }, []);
  return <main className="r2-study" aria-label="Visual Experience R2 renderer study">
    <header className="r2-study-header"><div><span className="r2-kicker">VISUAL EXPERIENCE R2</span><h1>Renderer decision lab</h1><p>One production modal response, three visual projections. The simulation clock is shared.</p></div><div className="r2-study-meta"><span>3DOF fixed-fixed</span><span>{reduced ? "Reduced motion" : "Motion enabled"}</span></div></header>
    <nav className="r2-prototype-tabs" aria-label="Renderer prototypes">{(Object.keys(names) as Prototype[]).map((key) => <button key={key} aria-pressed={prototype === key} onClick={() => setPrototype(key)}>{names[key]}</button>)}</nav>
    <section className="r2-study-stage"><div className="r2-stage-eyebrow">{names[prototype]}</div>{prototype === "svg" ? <SvgPrototype clock={clock} solution={solution} /> : <ThreePrototype clock={clock} solution={solution} spatial={prototype === "three-spatial"} />}</section>
    <section className="r2-study-notes"><div><strong>Real state</strong><span>x(t), mode vector and frequency come from solveModal/modalResponse.</span></div><div><strong>Renderer contract</strong><span>No physics dependency on DOM, Three.js or camera state.</span></div><div><strong>Accessibility</strong><span>Prototype selection is keyboardable; final workspaces retain semantic lists and inspector controls.</span></div></section>
  </main>;
}




