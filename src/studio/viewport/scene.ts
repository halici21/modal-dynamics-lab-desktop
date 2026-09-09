/**
 * Modal Dynamics Studio — CAD physics viewport scene.
 *
 * Pure Three.js. No React, no physics. It receives already-solved samples and
 * places geometry; it never integrates, never solves an eigenproblem, and
 * never owns time. Per `mdl-threejs-scientific-viewport`:
 *
 *  - no requestAnimationFrame here; the caller renders from the one
 *    SimulationClock subscription,
 *  - orthographic camera by default, restrained orbit,
 *  - DPR capped at 2,
 *  - critical labels stay in the DOM (the caller overlays them),
 *  - every geometry, material, renderer, observer disposed on teardown,
 *  - no bloom, no emissive decoration, no particle effects.
 *
 * Geometry cost is bounded and allocation-free per frame: the spring is one
 * helix tube built once and stretched along its own axis (which is what a real
 * coil does), never rebuilt.
 */
import type * as ThreeNS from "three";

export type ViewName =
  | "front"
  | "back"
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "iso";

export interface ChainSpec {
  kind: "chain";
  /** Rest position of each mass along X, in scene units. */
  positions: number[];
  /** Visual size per mass (already normalised by the caller). */
  sizes: number[];
  labels: string[];
  /** from = null means ground on the left, to = null means ground on the right. */
  springs: { from: number | null; to: number | null; index: number }[];
  dampers: { from: number | null; to: number | null; index: number }[];
  span: number;
}

export interface FeSpec {
  kind: "fe";
  nodes: [number, number][];
  elements: [number, number][];
  fixed: number[];
  perNode: number;
  span: number;
}

export interface RigidSpec {
  kind: "rigid";
  span: number;
}

export type ViewportModel = ChainSpec | FeSpec | RigidSpec;

export interface FrameData {
  /** Displacements in scene units, already scaled for display by the caller. */
  offsets: number[];
  /** Optional force arrow per mass, already normalised to [-1, 1]. */
  forces?: number[];
  /** Rigid-body pose for the free-free study. */
  rigid?: { t: [number, number, number]; r: [number, number, number] };
  /** Deformed FE polyline in scene units. */
  fePoints?: number[];
}

export interface SceneHandle {
  setModel(model: ViewportModel): void;
  update(frame: FrameData): void;
  render(): void;
  resize(): void;
  setSelection(key: string | null): void;
  setView(view: ViewName, animate: boolean): void;
  fit(): void;
  /** Advance the camera tween. Returns true while more frames are needed. */
  tickCamera(nowMs: number): boolean;
  pick(clientX: number, clientY: number): string | null;
  /** Normalised [0,1] screen positions of each pickable body, for DOM labels. */
  projectBodies(): { key: string; x: number; y: number }[];
  setTheme(dark: boolean): void;
  stats(): {
    calls: number;
    triangles: number;
    geometries: number;
    textures: number;
    objects: number;
    dpr: number;
  };
  dispose(): void;
}

const DIRECTIONS: Record<ViewName, [number, number, number]> = {
  front: [0, 0, 1],
  back: [0, 0, -1],
  left: [-1, 0, 0],
  right: [1, 0, 0],
  top: [0, 1, 0.0001],
  bottom: [0, -1, 0.0001],
  iso: [0.78, 0.55, 0.9],
};

const CAMERA_MS = 320;

interface Palette {
  background: number;
  grid: number;
  gridStrong: number;
  body: number;
  edge: number;
  selected: number;
  wire: number;
  force: number;
  ghost: number;
}

const DARK: Palette = {
  background: 0x17191d,
  grid: 0x272b31,
  gridStrong: 0x343a42,
  body: 0x344453,
  edge: 0x7d93a4,
  selected: 0x83c4e0,
  wire: 0xa3adba,
  force: 0xedb078,
  ghost: 0x39424c,
};

const LIGHT: Palette = {
  background: 0xfaf9f5,
  grid: 0xe1e0da,
  gridStrong: 0xcbcac3,
  body: 0xd7e0e5,
  edge: 0x5b6b78,
  selected: 0x216583,
  wire: 0x6a737d,
  force: 0x95521a,
  ghost: 0xc9ccc7,
};

/**
 * Builds the scene. Returns null when WebGL is unavailable so the caller can
 * fall back to the validated SVG stage rather than showing an empty viewport.
 */
export function createCadScene(
  THREE: typeof ThreeNS,
  mount: HTMLElement,
  options: { dark: boolean; reduced: boolean },
): SceneHandle | null {
  let renderer: ThreeNS.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: "high-performance",
    });
    if (!renderer.getContext()) return null;
  } catch {
    return null;
  }

  let palette = options.dark ? DARK : LIGHT;
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  renderer.setPixelRatio(dpr);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.setAttribute("aria-hidden", "true");
  mount.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(palette.background);

  const FRUSTUM = 6;
  const camera = new THREE.OrthographicCamera(-FRUSTUM, FRUSTUM, 3, -3, 0.1, 200);
  const target = new THREE.Vector3(0, 0, 0);
  let radius = 14;
  let currentDir = new THREE.Vector3(...DIRECTIONS.front).normalize();
  let fromDir = currentDir.clone();
  let toDir = currentDir.clone();
  let tweenStart = 0;
  let tweening = false;
  let zoom = 1;

  camera.position.copy(currentDir).multiplyScalar(radius).add(target);
  camera.lookAt(target);
  camera.up.set(0, 1, 0);

  const ambient = new THREE.AmbientLight(0xffffff, options.dark ? 1.5 : 2.1);
  const key = new THREE.DirectionalLight(0xffffff, options.dark ? 1.9 : 1.4);
  key.position.set(4, 7, 9);
  const fill = new THREE.DirectionalLight(0xffffff, 0.5);
  fill.position.set(-6, 2, -4);
  scene.add(ambient, key, fill);

  /* --- restrained engineering grid + axis triad ------------------------ */
  const grid = new THREE.GridHelper(20, 20, palette.gridStrong, palette.grid);
  (grid.material as ThreeNS.Material & { opacity: number; transparent: boolean }).opacity = 0.85;
  (grid.material as ThreeNS.Material).transparent = true;
  grid.position.y = -1.62;
  scene.add(grid);

  /* A ground grid is edge-on in the front view, which is where this app spends
     most of its time. A second grid in the view plane, set well behind the
     model, gives the front/back/left/right views a readable engineering scale
     without turning into an infinite neon backdrop. */
  const backdrop = new THREE.GridHelper(20, 20, palette.grid, palette.grid);
  backdrop.rotation.x = Math.PI / 2;
  backdrop.position.z = -2.6;
  (backdrop.material as ThreeNS.Material & { opacity: number; transparent: boolean }).opacity = 0.5;
  (backdrop.material as ThreeNS.Material).transparent = true;
  scene.add(backdrop);

  const axes = new THREE.Group();
  const axisColors = [0x9fb0bf, 0x8fae9c, 0x9aa4c4];
  (["x", "y", "z"] as const).forEach((_, i) => {
    const dir = new THREE.Vector3(i === 0 ? 1 : 0, i === 1 ? 1 : 0, i === 2 ? 1 : 0);
    const line = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        dir.clone().multiplyScalar(1.1),
      ]),
      new THREE.LineBasicMaterial({ color: axisColors[i] }),
    );
    axes.add(line);
  });
  axes.position.set(-4.9, -1.6, 0.6);
  scene.add(axes);

  /* --- model group ------------------------------------------------------ */
  let modelGroup = new THREE.Group();
  scene.add(modelGroup);
  let spec: ViewportModel | null = null;
  let selectionKey: string | null = null;

  const owned: { dispose(): void }[] = [];
  const massMeshes: ThreeNS.Mesh[] = [];
  const massEdges: ThreeNS.LineSegments[] = [];
  const springMeshes: ThreeNS.Mesh[] = [];
  const damperGroups: ThreeNS.Group[] = [];
  const forceArrows: ThreeNS.Group[] = [];
  const pickable: ThreeNS.Object3D[] = [];
  let fePolyline: ThreeNS.Line | null = null;
  let feGhost: ThreeNS.Line | null = null;
  let rigidBody: ThreeNS.Group | null = null;

  function track<T extends { dispose(): void }>(x: T): T {
    owned.push(x);
    return x;
  }

  function clearModel() {
    modelGroup.traverse((o) => {
      const m = o as ThreeNS.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as ThreeNS.Material | ThreeNS.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else mat?.dispose();
    });
    scene.remove(modelGroup);
    modelGroup = new THREE.Group();
    scene.add(modelGroup);
    massMeshes.length = 0;
    massEdges.length = 0;
    springMeshes.length = 0;
    damperGroups.length = 0;
    forceArrows.length = 0;
    pickable.length = 0;
    fePolyline = null;
    feGhost = null;
    rigidBody = null;
  }

  /** Unit-length helix along +X, built once, stretched by scale.x thereafter. */
  function makeSpring(color: number) {
    const turns = 9;
    const points: ThreeNS.Vector3[] = [];
    for (let i = 0; i <= turns * 16; i++) {
      const u = i / (turns * 16);
      const a = u * turns * Math.PI * 2;
      points.push(new THREE.Vector3(u, Math.cos(a) * 0.16, Math.sin(a) * 0.16));
    }
    const curve = new THREE.CatmullRomCurve3(points);
    const geometry = new THREE.TubeGeometry(curve, turns * 16, 0.028, 6, false);
    const material = new THREE.MeshStandardMaterial({
      color,
      roughness: 0.45,
      metalness: 0.35,
    });
    return new THREE.Mesh(geometry, material);
  }

  function makeArrow(color: number) {
    const group = new THREE.Group();
    const shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.022, 0.022, 1, 8),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
    );
    shaft.rotation.z = -Math.PI / 2;
    shaft.position.x = 0.5;
    const head = new THREE.Mesh(
      new THREE.ConeGeometry(0.07, 0.18, 10),
      new THREE.MeshStandardMaterial({ color, roughness: 0.6 }),
    );
    head.rotation.z = -Math.PI / 2;
    head.position.x = 1;
    group.add(shaft, head);
    group.visible = false;
    return group;
  }

  function buildChain(model: ChainSpec) {
    const bodyMat = new THREE.MeshStandardMaterial({
      color: palette.body,
      roughness: 0.52,
      metalness: 0.22,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });
    model.positions.forEach((px, i) => {
      const s = model.sizes[i];
      const geometry = new THREE.BoxGeometry(s, s * 0.92, s * 0.72);
      const mesh = new THREE.Mesh(geometry, bodyMat.clone());
      mesh.position.set(px, 0, 0);
      mesh.userData.selection = `mass:${i}`;
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(geometry),
        new THREE.LineBasicMaterial({ color: palette.edge }),
      );
      edges.renderOrder = 1;
      mesh.add(edges);
      modelGroup.add(mesh);
      massMeshes.push(mesh);
      massEdges.push(edges);
      pickable.push(mesh);
      const arrow = makeArrow(palette.force);
      modelGroup.add(arrow);
      forceArrows.push(arrow);
    });
    model.springs.forEach((s) => {
      const mesh = makeSpring(palette.wire);
      mesh.userData.selection = `spring:${s.index}`;
      modelGroup.add(mesh);
      springMeshes.push(mesh);
      pickable.push(mesh);
    });
    model.dampers.forEach((d) => {
      const group = new THREE.Group();
      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 1, 14),
        new THREE.MeshStandardMaterial({ color: palette.body, roughness: 0.5 }),
      );
      body.rotation.z = Math.PI / 2;
      const rod = new THREE.Mesh(
        new THREE.CylinderGeometry(0.05, 0.05, 1, 10),
        new THREE.MeshStandardMaterial({ color: palette.wire, roughness: 0.35, metalness: 0.5 }),
      );
      rod.rotation.z = Math.PI / 2;
      const piston = new THREE.Mesh(
        new THREE.CylinderGeometry(0.13, 0.13, 0.05, 14),
        new THREE.MeshStandardMaterial({ color: palette.edge, roughness: 0.5 }),
      );
      piston.rotation.z = Math.PI / 2;
      group.add(body, rod, piston);
      group.userData.selection = `damper:${d.index}`;
      body.userData.selection = `damper:${d.index}`;
      modelGroup.add(group);
      damperGroups.push(group);
      pickable.push(body);
    });
    // Ground hatching at both ends where a spring anchors to it.
    const anchorXs = new Set<number>();
    model.springs.forEach((s) => {
      if (s.from === null) anchorXs.add(-model.span / 2);
      if (s.to === null) anchorXs.add(model.span / 2);
    });
    anchorXs.forEach((x) => {
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 1.9, 1.5),
        new THREE.MeshStandardMaterial({ color: palette.ghost, roughness: 0.85 }),
      );
      wall.position.set(x, -0.32, 0);
      wall.userData.selection = `ground:${x < 0 ? 0 : 1}`;
      modelGroup.add(wall);
      pickable.push(wall);
    });
    // Restrained rail under the masses.
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(model.span, 0.05, 1.1),
      new THREE.MeshStandardMaterial({ color: palette.ghost, roughness: 0.9 }),
    );
    rail.position.y = -1.35;
    modelGroup.add(rail);
  }

  function buildFe(model: FeSpec) {
    const count = model.elements.length * 17;
    const positions = new Float32Array(count * 3);
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    fePolyline = new THREE.Line(
      geometry,
      new THREE.LineBasicMaterial({ color: palette.selected }),
    );
    modelGroup.add(fePolyline);

    const ghostPoints = model.nodes.map(
      (p) => new THREE.Vector3(p[0] * model.span - model.span / 2, p[1] * model.span, 0),
    );
    feGhost = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ghostPoints),
      new THREE.LineDashedMaterial({ color: palette.ghost, dashSize: 0.14, gapSize: 0.1 }),
    );
    feGhost.computeLineDistances();
    modelGroup.add(feGhost);

    const nodeGeometry = new THREE.SphereGeometry(0.055, 12, 8);
    model.nodes.forEach((p, i) => {
      const mesh = new THREE.Mesh(
        nodeGeometry,
        new THREE.MeshStandardMaterial({
          color: model.fixed.some((d) => Math.floor(d / model.perNode) === i)
            ? palette.force
            : palette.edge,
          roughness: 0.5,
        }),
      );
      mesh.position.copy(ghostPoints[i]);
      mesh.userData.selection = `node:${i}`;
      modelGroup.add(mesh);
      massMeshes.push(mesh);
      pickable.push(mesh);
    });
    model.elements.forEach(([a, b], i) => {
      const mid = ghostPoints[a].clone().lerp(ghostPoints[b], 0.5);
      const len = ghostPoints[a].distanceTo(ghostPoints[b]);
      const hit = new THREE.Mesh(
        new THREE.BoxGeometry(len * 0.9, 0.16, 0.16),
        new THREE.MeshStandardMaterial({
          color: palette.body,
          roughness: 0.6,
          transparent: true,
          opacity: 0.35,
        }),
      );
      hit.position.copy(mid);
      hit.userData.selection = `element:${i}`;
      modelGroup.add(hit);
      pickable.push(hit);
    });
  }

  function buildRigid(model: RigidSpec) {
    rigidBody = new THREE.Group();
    const s = model.span * 0.19;
    const shell = new THREE.Mesh(
      new THREE.BoxGeometry(s * 2.1, s, s * 1.3),
      new THREE.MeshStandardMaterial({
        color: palette.body,
        roughness: 0.5,
        metalness: 0.2,
      }),
    );
    const edges = new THREE.LineSegments(
      new THREE.EdgesGeometry(shell.geometry),
      new THREE.LineBasicMaterial({ color: palette.edge }),
    );
    shell.add(edges);
    shell.userData.selection = "mass:0";
    rigidBody.add(shell);
    // Corner markers make rotation legible without any text in 3D.
    const marker = new THREE.SphereGeometry(0.07, 10, 8);
    [
      [-1, -1, -1],
      [1, -1, -1],
      [1, 1, -1],
      [-1, 1, 1],
    ].forEach((c) => {
      const dot = new THREE.Mesh(
        marker,
        new THREE.MeshStandardMaterial({ color: palette.selected, roughness: 0.4 }),
      );
      dot.position.set((c[0] * s * 2.1) / 2, (c[1] * s) / 2, (c[2] * s * 1.3) / 2);
      rigidBody!.add(dot);
    });
    modelGroup.add(rigidBody);
    pickable.push(shell);
  }

  function applySelectionColors() {
    massMeshes.forEach((mesh, i) => {
      const isSel = mesh.userData.selection === selectionKey;
      const mat = mesh.material as ThreeNS.MeshStandardMaterial;
      mat.color.setHex(isSel ? palette.selected : palette.body);
      const edge = massEdges[i];
      if (edge)
        (edge.material as ThreeNS.LineBasicMaterial).color.setHex(
          isSel ? palette.selected : palette.edge,
        );
    });
    springMeshes.forEach((mesh) => {
      (mesh.material as ThreeNS.MeshStandardMaterial).color.setHex(
        mesh.userData.selection === selectionKey ? palette.selected : palette.wire,
      );
    });
    damperGroups.forEach((group) => {
      const on = group.userData.selection === selectionKey;
      group.children.forEach((child) => {
        const mat = (child as ThreeNS.Mesh).material as ThreeNS.MeshStandardMaterial;
        if (mat?.color) mat.color.setHex(on ? palette.selected : palette.wire);
      });
    });
  }

  function frustum() {
    const w = Math.max(1, mount.clientWidth);
    const h = Math.max(1, mount.clientHeight);
    const aspect = w / h;
    const half = FRUSTUM / zoom;
    camera.left = -half * aspect;
    camera.right = half * aspect;
    camera.top = half;
    camera.bottom = -half;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  const raycaster = new THREE.Raycaster();
  const pointer = new THREE.Vector2();

  const handle: SceneHandle = {
    setModel(model) {
      clearModel();
      spec = model;
      if (model.kind === "chain") buildChain(model);
      else if (model.kind === "fe") buildFe(model);
      else buildRigid(model);
      applySelectionColors();
      handle.fit();
    },
    update(frame) {
      if (!spec) return;
      if (spec.kind === "chain") {
        const chainSpec = spec;
        const half = chainSpec.span / 2;
        massMeshes.forEach((mesh, i) => {
          mesh.position.x = chainSpec.positions[i] + (frame.offsets[i] ?? 0);
        });
        chainSpec.springs.forEach((s, i) => {
          const mesh = springMeshes[i];
          if (!mesh) return;
          const a =
            s.from === null
              ? -half + 0.06
              : massMeshes[s.from].position.x + chainSpec.sizes[s.from] / 2;
          const b =
            s.to === null
              ? half - 0.06
              : massMeshes[s.to].position.x - chainSpec.sizes[s.to] / 2;
          const len = Math.max(0.25, b - a);
          mesh.position.set(a, 0, 0);
          mesh.scale.x = len;
        });
        chainSpec.dampers.forEach((d, i) => {
          const group = damperGroups[i];
          if (!group) return;
          const a = d.from === null ? -half + 0.06 : massMeshes[d.from].position.x;
          const b = d.to === null ? half - 0.06 : massMeshes[d.to].position.x;
          const len = Math.max(0.4, Math.abs(b - a));
          group.position.set((a + b) / 2, -0.78, 0);
          const body = group.children[0] as ThreeNS.Mesh;
          const rod = group.children[1] as ThreeNS.Mesh;
          const piston = group.children[2] as ThreeNS.Mesh;
          body.scale.y = len * 0.55;
          rod.scale.y = len;
          piston.position.x = (b - a) * 0.16;
        });
        forceArrows.forEach((arrow, i) => {
          const f = frame.forces?.[i];
          if (f === undefined || !Number.isFinite(f) || Math.abs(f) < 1e-6) {
            arrow.visible = false;
            return;
          }
          arrow.visible = true;
          const size = chainSpec.sizes[i] ?? 0.8;
          arrow.position.set(massMeshes[i].position.x, size * 0.75, 0);
          arrow.scale.set(Math.abs(f) * 1.4, 1, 1);
          arrow.rotation.y = f < 0 ? Math.PI : 0;
        });
      } else if (spec.kind === "fe" && fePolyline && frame.fePoints) {
        const attr = fePolyline.geometry.getAttribute("position") as ThreeNS.BufferAttribute;
        const n = Math.min(attr.count * 3, frame.fePoints.length);
        for (let i = 0; i < n; i++) attr.array[i] = frame.fePoints[i];
        attr.needsUpdate = true;
        fePolyline.geometry.computeBoundingSphere();
      } else if (spec.kind === "rigid" && rigidBody && frame.rigid) {
        rigidBody.position.set(...frame.rigid.t);
        rigidBody.rotation.set(...frame.rigid.r);
      }
    },
    render() {
      renderer.render(scene, camera);
    },
    resize() {
      frustum();
    },
    setSelection(k) {
      selectionKey = k;
      applySelectionColors();
    },
    setView(view, animate) {
      const dir = new THREE.Vector3(...DIRECTIONS[view]).normalize();
      if (!animate || options.reduced) {
        currentDir = dir;
        fromDir = dir.clone();
        toDir = dir.clone();
        tweening = false;
        camera.position.copy(dir).multiplyScalar(radius).add(target);
        camera.up.set(0, view === "top" || view === "bottom" ? 0 : 1, view === "top" ? -1 : view === "bottom" ? 1 : 0);
        camera.lookAt(target);
        return;
      }
      fromDir = currentDir.clone();
      toDir = dir;
      tweenStart = performance.now();
      tweening = true;
    },
    tickCamera(nowMs) {
      if (!tweening) return false;
      const t = Math.min(1, (nowMs - tweenStart) / CAMERA_MS);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      currentDir = fromDir.clone().lerp(toDir, eased).normalize();
      camera.position.copy(currentDir).multiplyScalar(radius).add(target);
      camera.up.set(0, 1, 0);
      camera.lookAt(target);
      if (t >= 1) {
        tweening = false;
        handle.fit();
        return false;
      }
      return true;
    },
    /**
     * Frames the model for the CURRENT view direction. An orthographic frustum
     * has to satisfy both axes independently: half-height must cover the
     * projected vertical extent, and half-height * aspect must cover the
     * projected horizontal extent. Taking the max of the two (rather than a
     * single "size" scalar) is what stops a wide chain being framed as if it
     * were square, which left most of the viewport empty.
     */
    fit() {
      const box = new THREE.Box3().setFromObject(modelGroup);
      if (box.isEmpty()) return;
      const size = box.getSize(new THREE.Vector3());
      box.getCenter(target);
      const w = Math.max(1, mount.clientWidth);
      const h = Math.max(1, mount.clientHeight);
      const aspect = w / h;
      const axis = Math.abs(currentDir.x) > 0.9
        ? "x"
        : Math.abs(currentDir.y) > 0.9
          ? "y"
          : Math.abs(currentDir.z) > 0.9
            ? "z"
            : null;
      // Projected extents for the axis-aligned named views; the bounding
      // sphere is the honest fallback for isometric and intermediate angles.
      const projected =
        axis === "z"
          ? [size.x, size.y]
          : axis === "x"
            ? [size.z, size.y]
            : axis === "y"
              ? [size.x, size.z]
              : [size.length() * 0.72, size.length() * 0.72];
      const needed = Math.max(projected[1] / 2, projected[0] / (2 * aspect));
      zoom = Math.max(0.2, Math.min(6, FRUSTUM / (1.1 * Math.max(0.25, needed))));
      radius = Math.max(12, size.length() * 2.2);
      camera.position.copy(currentDir).multiplyScalar(radius).add(target);
      camera.lookAt(target);
      frustum();
    },
    pick(clientX, clientY) {
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hits = raycaster.intersectObjects(pickable, false);
      for (const hit of hits) {
        const key = hit.object.userData.selection as string | undefined;
        if (key) return key;
      }
      return null;
    },
    /**
     * Projects the TOP of each body, not its centre, so a DOM label sits above
     * the geometry it names instead of on top of it — and stays correct when
     * bodies of different sizes share a scene.
     */
    projectBodies() {
      const v = new THREE.Vector3();
      const box = new THREE.Box3();
      return massMeshes.map((mesh, i) => {
        box.setFromObject(mesh);
        v.set(
          (box.min.x + box.max.x) / 2,
          box.max.y,
          (box.min.z + box.max.z) / 2,
        ).project(camera);
        return {
          key: (mesh.userData.selection as string) ?? "mass:" + i,
          x: (v.x + 1) / 2,
          y: (1 - v.y) / 2,
        };
      });
    },
    setTheme(dark) {
      palette = dark ? DARK : LIGHT;
      scene.background = new THREE.Color(palette.background);
      ambient.intensity = dark ? 1.5 : 2.1;
      key.intensity = dark ? 1.9 : 1.4;
      grid.dispose();
      applySelectionColors();
      if (fePolyline)
        (fePolyline.material as ThreeNS.LineBasicMaterial).color.setHex(palette.selected);
    },
    stats() {
      const info = renderer.info;
      return {
        calls: info.render.calls,
        triangles: info.render.triangles,
        geometries: info.memory.geometries,
        textures: info.memory.textures,
        objects: scene.children.length + modelGroup.children.length,
        dpr,
      };
    },
    dispose() {
      clearModel();
      scene.remove(modelGroup, grid, backdrop, axes, ambient, key, fill);
      grid.geometry.dispose();
      (grid.material as ThreeNS.Material).dispose();
      backdrop.geometry.dispose();
      (backdrop.material as ThreeNS.Material).dispose();
      axes.children.forEach((c) => {
        const line = c as ThreeNS.Line;
        line.geometry.dispose();
        (line.material as ThreeNS.Material).dispose();
      });
      owned.forEach((o) => o.dispose());
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentNode === mount)
        mount.removeChild(renderer.domElement);
    },
  };

  track({ dispose: () => undefined });
  frustum();
  return handle;
}
