import { ChangeEvent, useCallback } from "react";
import "./App.css";
import { useTableState } from "./hooks/useTableState";

const PREVIEW_OPTIONS = [3, 5, 10];

export default function App() {
  const { state, uploadDataset, updatePreviewCount, loading, error } = useTableState();
  const dataset = state.dataset;
  const previewCount = state.ui.previewRowCount;

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

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Issue #2 · CSV ingestion & persistence</p>
        <h1>Bring your CSV, we keep it in sync.</h1>
        <p>
          Upload CSV or TSV data, validate the headers, detect the column types, and keep the bundle
          alive inside localStorage so returning visitors resume where they left off.
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
            </>
          ) : (
            <p className="placeholder">No dataset yet—upload a CSV to inspect your columns.</p>
          )}
        </article>
      </section>

      <section className="panel preview-panel">
        <div className="panel-heading">
          <h2>Preview (first {previewCount} rows)</h2>
        </div>
        {dataset && dataset.rows.length ? (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  {dataset.headers.map((header) => (
                    <th key={header}>{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {dataset.rows.slice(0, previewCount).map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {dataset.headers.map((header, columnIndex) => (
                      <td key={`${rowIndex}-${header}`}>{row[columnIndex] ?? ""}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="placeholder">Preview will appear here once you upload data.</p>
        )}
      </section>
    </main>
  );
}
