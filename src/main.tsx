import { Profiler } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app/App";
import { SimulationClock } from "./animation/SimulationClock";
import "./app/tokens.css";
const clock = new SimulationClock();
const root = createRoot(document.getElementById("root")!);
let commits = 0;
root.render(
  import.meta.env.DEV ? (
    <Profiler
      id="lab"
      onRender={() => {
        commits++;
      }}
    >
      <App clock={clock} />
    </Profiler>
  ) : (
    <App clock={clock} />
  ),
);
if (import.meta.env.DEV) {
  Object.assign(window, { __labClock: clock, __labCommits: () => commits });
  import.meta.hot?.dispose(() => {
    root.unmount();
    clock.dispose();
    window.removeEventListener("pagehide", onPageHide);
  });
}
function onPageHide() {
  clock.dispose();
}
window.addEventListener("pagehide", onPageHide, { once: true });
