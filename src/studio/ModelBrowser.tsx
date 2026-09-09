/**
 * Modal Dynamics Studio — Model Browser.
 *
 * A real ARIA tree, mirroring the solver's object graph. It is the DOM
 * equivalent of picking geometry in the WebGL viewport, which is why it must
 * stay keyboard complete: nobody should have to parse WebGL to select a
 * spring.
 *
 * Structure follows the APG: `tree > treeitem[aria-expanded] > group >
 * treeitem`. An earlier draft put group headings and item buttons directly
 * inside `role="tree"`, which axe correctly rejected — a tree may contain
 * only treeitems and groups.
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
      for (const g of groups) next[g.id] = g.collapsible ? (prev[g.id] ?? true) : false;
      return next;
    });
    // Groups are rebuilt whenever the study or DOF count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  /** Roving tabindex: exactly one treeitem is in the tab order at a time. */
  const flat: string[] = [];
  for (const g of groups) {
    flat.push("group:" + g.id);
    if (!collapsed[g.id]) for (const n of g.nodes) flat.push(n.id);
  }
  const selectedId =
    groups
      .flatMap((g) => g.nodes)
      .find((n) => sameSelection(n.selection, selection))?.id ?? flat[0];

  function move(delta: number) {
    const items = root.current?.querySelectorAll<HTMLElement>("[role=treeitem]");
    if (!items?.length) return;
    const list = [...items];
    const current = list.findIndex((el) => el === document.activeElement);
    const next = Math.min(list.length - 1, Math.max(0, current + delta));
    list[next]?.focus();
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
        {groups.map((group) => {
          const open = !collapsed[group.id];
          return (
            <div
              key={group.id}
              role="treeitem"
              aria-expanded={open}
              aria-label={group.label}
              aria-level={1}
              tabIndex={selectedId === "group:" + group.id ? 0 : -1}
              className="browser-group"
              onClick={(e) => {
                if (!(e.target as HTMLElement).closest(".browser-group-head")) return;
                setCollapsed((c) => ({ ...c, [group.id]: open }));
              }}
              onKeyDown={(e) => {
                if (e.target !== e.currentTarget) return;
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setCollapsed((c) => ({ ...c, [group.id]: open }));
                } else if (e.key === "ArrowRight" && !open) {
                  e.preventDefault();
                  setCollapsed((c) => ({ ...c, [group.id]: false }));
                } else if (e.key === "ArrowLeft" && open) {
                  e.preventDefault();
                  setCollapsed((c) => ({ ...c, [group.id]: true }));
                }
              }}
            >
              <span className="browser-group-head">
                <span aria-hidden="true" className="browser-caret">
                  {open ? "⌄" : "›"}
                </span>
                {group.label}
              </span>
              {open && (
                <div role="group" className="browser-items">
                  {group.nodes.map((node) => {
                    const selected = sameSelection(node.selection, selection);
                    const linked = node.token ? active.has(node.token) : false;
                    return (
                      <div
                        key={node.id}
                        role="treeitem"
                        aria-level={2}
                        data-token={node.token}
                        data-linked={linked || undefined}
                        aria-selected={selected}
                        tabIndex={selectedId === node.id ? 0 : -1}
                        className={
                          "browser-item" +
                          (selected ? " selected" : "") +
                          (linked && !selected ? " linked" : "")
                        }
                        onClick={() => onSelect(node.selection)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            onSelect(node.selection);
                          }
                        }}
                      >
                        <span className="browser-kind">{node.kind}</span>
                        <span className="browser-label">{node.label}</span>
                        {node.detail && (
                          <span className="browser-detail" title={node.detail}>
                            {node.detail}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
