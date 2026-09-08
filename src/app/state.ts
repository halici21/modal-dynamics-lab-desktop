export type Lens =
  "Motion" | "Forces" | "Energy" | "Mode Shape" | "Phase Space" | "Mathematics";
export type Selection = {
  kind: "object" | "dof" | "equation" | "matrix" | "mode" | "series";
  id: string;
  objectId?: string;
} | null;
export interface LabState {
  module: number;
  lens: Lens;
  travel: number;
  selection: Selection;
  resetRevision: number;
}
export const initialState: LabState = {
  module: 0,
  lens: "Motion",
  travel: 65,
  selection: null,
  resetRevision: 0,
};
export type LabAction =
  | { type: "module"; value: number }
  | { type: "lens"; value: Lens }
  | { type: "travel"; value: number }
  | { type: "select"; value: Selection }
  | { type: "reset" };
export function labReducer(state: LabState, action: LabAction): LabState {
  switch (action.type) {
    case "module":
      return { ...state, module: action.value, selection: null };
    case "lens":
      return { ...state, lens: action.value };
    case "travel":
      return { ...state, travel: action.value };
    case "select":
      return { ...state, selection: action.value };
    case "reset":
      return {
        ...initialState,
        module: state.module,
        resetRevision: state.resetRevision + 1,
      };
  }
}
