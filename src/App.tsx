import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import { useTableState } from "./hooks/useTableState";
import { filterRows, sortRows, type SortDirection } from "./utils/tableData";

const PREVIEW_OPTIONS = [3, 5, 10];
const ROW_HEIGHT = 44;
const VIRTUAL_BUFFER_ROWS = 6;

type SortState = { columnIndex: number; direction: SortDirection };

export default function App() {
  const { state, uploadDataset, updatePreviewCount, loading, error } = useTableState();
  const dataset = state.dataset;
  const previewCount = state.ui.previewRowCount;

  const [filterQuery, setFilterQuery] = useState("");
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const datasetRows = dataset?.rows ?? [];
  const filteredRows = useMemo(() => filterRows(datasetRows, filterQuery), [datasetRows, filterQuery]);
  const sortedRows = useMemo(() => {
    if (!sortState) {
      return filteredRows;
    }
    return sortRows(filteredRows, sortState.columnIndex, sortState.direction);
  }, [filteredRows, sortState]);

  useEffect(() => {
    setScrollTop(0);
    if (viewportRef.current) {
      viewportRef.current.scrollTop = 0;
    }
  }, [sortedRows]);

  useEffect(() => {
    setFilterQuery("");
    setSortState(null);
  }, [dataset?.uploadedAt]);

  const visibleRowCapacity = Math.max(
    0,
    Math.min(sortedRows.length, previewCount + VIRTUAL_BUFFER_ROWS)
  );
  const maxStartIndex = Math.max(0, sortedRows.length - visibleRowCapacity);
  const currentStartIndex = Math.min(maxStartIndex, Math.floor(scrollTop / ROW_HEIGHT));
  const endIndex = Math.min(sortedRows.length, currentStartIndex + visibleRowCapacity);
  const visibleRows = sortedRows.slice(currentStartIndex, endIndex);
  const topSpacerHeight = currentStartIndex * ROW_HEIGHT;
  const bottomSpacerHeight = Math.max(0, (sortedRows.length - endIndex) * ROW_HEIGHT);
  const tableViewportHeight = previewCount * ROW_HEIGHT;

  const handleFileChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      uploadDataset(file);
      event.target.value = "";
    },
    [uploadDataset]
  );

  const handleScroll = useCallback(() => {
    if (!viewportRef.current) {
      return;
    }

    setScrollTop(viewportRef.current.scrollTop);
  }, []);

  const toggleSort = useCallback((columnIndex: number) => {
    setSortState((current) => {
      if (!current || current.columnIndex !== columnIndex) {
        return { columnIndex, direction: "asc" };
      }

      if (current.direction === "asc") {
        return { columnIndex, direction: "desc" };
      }

      return null;
    });
  }, []);

  const hasRows = Boolean(sortedRows.length);
  const columnCount = dataset?.headers.length ?? 1;

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Issue #3 · Interactive table</p>
        <h1>Inspect data at scale with sorting, filtering, and virtualization.</h1>
        <p>
          Upload a CSV or TSV, then glance at row counts, column meta, and interact with the table without
          pagination.
        </p>
      </header>

      <section className="panel-grid">
        <article className="panel upload-panel">
          <div className="panel-heading">
            <h2>Upload a CSV or TSV file</h2>
            <p>Parsing happens entirely in the browser—no back-end needed.</p>
          </div>
          <label className="file-input" htmlFor="file-upload">
            <span>Choose a file</span>
            <input
              id="file-upload"
              type="file"
              accept=".csv,text/csv,.tsv,text/tab-separated-values"
              onChange={handleFileChange}
            />
          </label>
          <p className="helper-text">We mirror the most recent dataset plus preview settings into localStorage.</p>
          {loading && <p className="status">Parsing your dataset…</p>}
          {error && (
            <p className="status status-error" role="alert">
              {error}
            </p>
          )}
          {state.uploadedAt && (
            <p className="status status-info">Last saved {new Date(state.uploadedAt).toLocaleString()}</p>
          )}
        </article>

        <article className="panel summary-panel">
          <div className="panel-heading">
            <h2>Dataset summary</h2>
            <p>Row count, column types, and the sample values we’ll show in the viewport.</p>
          </div>
          {dataset ? (
            <>
              <div className="summary-grid">
                <div>
                  <p className="label">Rows</p>
                  <p className="value">{dataset.rowCount}</p>
                </div>
                <div>
                  <p className="label">Columns</p>
                  <p className="value">{dataset.headers.length}</p>
                </div>
                <div>
                  <p className="label">Preview rows</p>
                  <div className="preview-control">
                    <label htmlFor="preview-count">Show</label>
                    <select
                      id="preview-count"
                      value={previewCount}
                      onChange={(event) => updatePreviewCount(Number(event.target.value))}
                    >
                      {PREVIEW_OPTIONS.map((count) => (
                        <option key={count} value={count}>
                          {count}
                        </option>
                      ))}
                    </select>
                    <span>rows</span>
                  </div>
                </div>
              </div>

              <ul className="column-meta">
                {dataset.columnMeta.map((column) => (
                  <li key={column.name}>
                    <span className="column-name">{column.name}</span>
                    <span className="column-type">{column.type}</span>
                    <span className="column-sample">{column.sample || "—"}</span>
                  </li>
                ))}
              </ul>

              <p className="filtered-state" aria-live="polite">
                Showing {sortedRows.length} row{sortedRows.length === 1 ? "" : "s"} matching the current filter.
              </p>
            </>
          ) : (
            <p className="placeholder">No dataset yet—upload a CSV to inspect your columns.</p>
          )}
        </article>
      </section>

      <section className="panel preview-panel">
        <div className="panel-heading">
          <h2>Interactive table</h2>
          <p>Sort columns, filter values, and scroll through data with virtualization.</p>
        </div>
        {dataset ? (
          <>
            <div className="table-controls">
              <label className="table-filter" htmlFor="table-filter">
                <span>Filter rows</span>
                <input
                  id="table-filter"
                  type="search"
                  placeholder="Search anywhere in the row"
                  value={filterQuery}
                  onChange={(event) => setFilterQuery(event.target.value)}
                />
              </label>
              <p className="row-count" aria-live="polite">
                {hasRows ? `Showing ${sortedRows.length} of ${dataset.rowCount} rows.` : "No rows match the filter."}
              </p>
            </div>

            {hasRows ? (
              <div
                className="table-viewport"
                ref={viewportRef}
                onScroll={handleScroll}
                style={{ height: `${tableViewportHeight}px` }}
              >
                <table>
                  <thead>
                    <tr>
                      {dataset.headers.map((header, columnIndex) => {
                        const isActiveSort = sortState?.columnIndex === columnIndex;
                        const direction = isActiveSort ? sortState?.direction : null;
                        const indicator = direction === "asc" ? "▲" : direction === "desc" ? "▼" : "↕";

                        return (
                          <th key={header}>
                            <button
                              type="button"
                              className={`column-sort ${isActiveSort ? "is-sorted" : ""}`}
                              onClick={() => toggleSort(columnIndex)}
                              aria-sort={isActiveSort ? direction : "none"}
                            >
                              <span>{header}</span>
                              <span className="sort-indicator" aria-hidden="true">
                                {indicator}
                              </span>
                            </button>
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody>
                    {topSpacerHeight > 0 && (
                      <tr className="spacer-row" aria-hidden="true" style={{ height: topSpacerHeight }}>
                        <td colSpan={columnCount} />
                      </tr>
                    )}

                    {visibleRows.map((row, rowIndex) => (
                      <tr key={`${currentStartIndex + rowIndex}-${rowIndex}`}>
                        {dataset.headers.map((header, columnIndex) => (
                          <td key={`${header}-${currentStartIndex + rowIndex}-${columnIndex}`}>{row[columnIndex] ?? ""}</td>
                        ))}
                      </tr>
                    ))}

                    {bottomSpacerHeight > 0 && (
                      <tr className="spacer-row" aria-hidden="true" style={{ height: bottomSpacerHeight }}>
                        <td colSpan={columnCount} />
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="placeholder">No rows to show for the given filter.</p>
            )}
          </>
        ) : (
          <p className="placeholder">Interactive table will appear once you upload data.</p>
        )}
      </section>
    </main>
  );
}
