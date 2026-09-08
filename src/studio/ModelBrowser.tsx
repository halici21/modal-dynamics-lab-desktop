/**
 * Modal Dynamics Studio — Model Browser.
 *
 * A real tree (role=tree / group / treeitem, roving tabindex, arrow-key
 * traversal), mirroring the solver's object graph. It is the DOM equivalent of
 * picking geometry in the WebGL viewport, which is why it must stay keyboard
 * complete: nobody should have to parse WebGL to select a spring.
 */
import { useEffect, useRef, useState } from "react";
import type { TreeGroup } from "./model";
import { sameSelection, type StudioSelection } from "./selection";

export function ModelBrowser({
  groups,
  selection,
  active,
  onSelect,
  studySelector,
}: {
  groups: TreeGroup[];
  selection: StudioSelection;
  active: Set<string>;
  onSelect(s: StudioSelection): void;
  studySelector: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(groups.filter((g) => g.collapsible).map((g) => [g.id, true])),
  );
  const root = useRef<HTMLDivElement>(null);
  const key = groups.map((g) => g.id).join("|");
  useEffect(() => {
    setCollapsed((prev) => {
      const next: Record<string, boolean> = {};
      for (const g of groups)
        next[g.id] = g.collapsible ? (prev[g.id] ?? true) : false;
      return next;
    });
    // Groups are rebuilt whenever the study or DOF count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const visible = groups.flatMap((g) => (collapsed[g.id] ? [] : g.nodes));
  const currentIndex = Math.max(
    0,
    visible.findIndex((n) => sameSelection(n.selection, selection)),
  );

  function move(delta: number) {
    const items = root.current?.querySelectorAll<HTMLElement>("[role=treeitem]");
    if (!items?.length) return;
    const current = [...items].findIndex((el) => el === document.activeElement);
    const next = Math.min(items.length - 1, Math.max(0, current + delta));
    items[next]?.focus();
  }

  return (
    <div className="browser">
      <div className="browser-study">{studySelector}</div>
      <div
        ref={root}
        role="tree"
        aria-label="Model browser"
        className="browser-tree"
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            move(e.key === "ArrowDown" ? 1 : -1);
          }
        }}
      >
        {groups.map((group) => (
          <div key={group.id} role="group" aria-label={group.label} className="browser-group">
            {group.collapsible ? (
              <button
                className="browser-group-head"
                aria-expanded={!collapsed[group.id]}
                onClick={() =>
                  setCollapsed((c) => ({ ...c, [group.id]: !c[group.id] }))
                }
              >
                <span aria-hidden="true" className="browser-caret">
                  {collapsed[group.id] ? "›" : "⌄"}
                </span>
                {group.label}
              </button>
            ) : (
              <p className="browser-group-head static">{group.label}</p>
            )}
            {!collapsed[group.id] &&
              group.nodes.map((node) => {
                const selected = sameSelection(node.selection, selection);
                const linked = node.token ? active.has(node.token) : false;
                return (
                  <button
                    key={node.id}
                    role="treeitem"
                    data-token={node.token}
                    data-linked={linked || undefined}
                    aria-selected={selected}
                    aria-level={1}
                    tabIndex={
                      visible[currentIndex]?.id === node.id ? 0 : -1
                    }
                    className={
                      "browser-item" +
                      (selected ? " selected" : "") +
                      (linked && !selected ? " linked" : "")
                    }
                    onClick={() => onSelect(node.selection)}
                  >
                    <span className="browser-kind">{node.kind}</span>
                    <span className="browser-label">{node.label}</span>
                  </button>
                );
              })}
          </div>
        ))}
      </div>
    </div>
  );
}
