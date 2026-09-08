import { describe, expect, it } from "vitest";
import { curriculum, lessonForModule } from "../../src/education/curriculum";
import { emptyProgress, PEDAGOGY_PROGRESS_KEY, readPedagogyProgress, writePedagogyProgress } from "../../src/education/progress";
import { glossary } from "../../src/education/glossary";

describe("pedagogy curriculum", () => {
  it("maps every current workspace to a deterministic lesson", () => {
    expect(curriculum).toHaveLength(13);
    for (let module = 0; module <= 12; module++) {
      const lesson = lessonForModule(module);
      expect(lesson.module).toBe(module);
      expect(lesson.steps).toHaveLength(8);
      expect(lesson.preset).toBeTruthy();
    }
  });
  it("keeps prerequisites acyclic and equations attached to physical questions", () => {
    const ids = new Set(curriculum.map((lesson) => lesson.id));
    curriculum.forEach((lesson) => {
      expect(lesson.equations.length).toBeGreaterThan(0);
      lesson.prerequisites.forEach((id) => expect(ids.has(id)).toBe(true));
    });
  });
});

describe("pedagogy notation", () => {
  it("covers the required compact glossary without changing physics ownership", () => {
    const terms = new Set(glossary.map((entry) => entry.term));
    ["DOF", "Natural frequency", "FRF", "PSD", "RMS", "FEM", "Boundary condition"].forEach((term) => expect(terms.has(term)).toBe(true));
    expect(glossary.every((entry) => entry.definition.length > 12)).toBe(true);
  });
});

describe("local pedagogy progress", () => {
  it("round trips valid state and falls back from corrupted storage", () => {
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value) } as unknown as Storage;
    const progress = { ...emptyProgress(), started: ["sdof-undamped"], completed: ["sdof-undamped"], lastLessonId: "sdof-undamped", lastWorkspace: 0, mode: "learn" as const };
    writePedagogyProgress(progress, storage);
    expect(readPedagogyProgress(storage)).toMatchObject(progress);
    data.set(PEDAGOGY_PROGRESS_KEY, "{broken");
    expect(readPedagogyProgress(storage)).toEqual(emptyProgress());
  });
});

