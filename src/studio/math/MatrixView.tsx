/**
 * Modal Dynamics Studio — matrix with provenance.
 *
 * Every cell is a real button carrying its own token id, so a matrix entry
 * resolves back to the physical objects that populate it and vice versa
 * (`mdl-live-mathematics`: no orphaned matrix cells, and the link is
 * bidirectional). Values come from the assembled system the solver used — never
 * from illustrative numbers.
 */
import { format } from "../../visualization/sdofGeometry";
import { token, type LinkRef, type StudioSelection } from "../selection";

export function MatrixView({
  name,
  values,
  labels,
  active,
  onSelect,
  caption,
}: {
  name: "M" | "C" | "K";
  values: number[][];
  labels: string[];
  active: Set<string>;
  onSelect(s: StudioSelection): void;
  caption?: string;
}) {
  return (
    <figure className="matrix">
      <figcaption>
        <span className="matrix-name">{name}</span>
        {caption ?? `${values.length}×${values.length} · rows and columns follow DOF labels`}
      </figcaption>
      <div className="matrix-scroll">
        <table>
          <thead>
            <tr>
              <th scope="col">
                <span className="visually-hidden">Degree of freedom</span>
              </th>
              {labels.map((l, j) => (
                <th scope="col" key={j}>
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {values.map((row, i) => (
              <tr key={i}>
                <th scope="row">{labels[i]}</th>
                {row.map((v, j) => {
                  const id = token.cell(name, i, j);
                  const lit = active.has(id);
                  return (
                    <td key={j}>
                      <button
                        data-token={id}
                        data-linked={lit || undefined}
                        className={"matrix-cell" + (lit ? " linked" : "") + (v === 0 ? " zero" : "")}
                        aria-label={`${name} row ${i + 1} column ${j + 1}, value ${v}`}
                        aria-pressed={lit}
                        onClick={() =>
                          onSelect({ kind: "matrix", matrix: name, row: i, col: j })
                        }
                      >
                        {format(v, 3)}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  );
}

/** Plain-language provenance for whichever cell is selected. */
export function MatrixProvenance({
  selection,
  links,
  labels,
}: {
  selection: StudioSelection;
  links: LinkRef[];
  labels: string[];
}) {
  if (!selection || selection.kind !== "matrix")
    return (
      <p className="matrix-provenance">
        Select a matrix entry to see which physical objects populate it.
      </p>
    );
  const { matrix, row, col } = selection;
  if (matrix === "M")
    return (
      <p className="matrix-provenance">
        {row === col
          ? `M${row + 1}${col + 1} is the inertia of mass ${row + 1} alone. A lumped-mass model gives a diagonal M, so its inertial term m${row + 1}ẍ${row + 1} involves only its own coordinate.`
          : `M${row + 1}${col + 1} is zero because no lumped mass couples ${labels[row]} to ${labels[col]}.`}
      </p>
    );
  const contributors = links
    .map((l, index) => ({ l, index }))
    .filter(({ l }) =>
      row === col
        ? l.i === row || l.j === row
        : l.j !== null && ((l.i === row && l.j === col) || (l.i === col && l.j === row)),
    );
  if (!contributors.length)
    return (
      <p className="matrix-provenance">
        {matrix}
        {row + 1}
        {col + 1} is zero: no spring or damper connects {labels[row]} to {labels[col]}, so
        they are not directly coupled.
      </p>
    );
  return (
    <p className="matrix-provenance">
      {matrix}
      {row + 1}
      {col + 1} ={" "}
      {contributors
        .map(({ l }) => (row === col ? "+" : "−") + (l.label ?? "k") + ` (${l.k})`)
        .join(" ")}
      .{" "}
      {row === col
        ? "Diagonal entries add every coefficient touching this coordinate, so they resist it moving alone."
        : "Off-diagonal entries are negative because the connector pulls the two coordinates together; moving them equally costs no stiffness at all."}
    </p>
  );
}
