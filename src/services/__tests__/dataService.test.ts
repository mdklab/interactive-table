import { loadPersistedState, parseCSV, savePersistedState } from "../dataService";

describe("parseCSV", () => {
  it("parses comma-delimited data and infers column types", () => {
    const dataset = parseCSV("name,score\nAlice,90\nBob,85");

    expect(dataset.headers).toEqual(["name", "score"]);
    expect(dataset.rowCount).toBe(2);
    expect(dataset.columnMeta[0].type).toBe("text");
    expect(dataset.columnMeta[1].type).toBe("number");
    expect(dataset.columnMeta[1].sample).toBe("90");
  });

  it("detects tab-separated files and boolean columns", () => {
    const dataset = parseCSV("flag\tvalue\ntrue\t10\nfalse\t5");

    expect(dataset.headers).toEqual(["flag", "value"]);
    expect(dataset.columnMeta[0].type).toBe("boolean");
  });
});

describe("state persistence", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns a default state when nothing is saved", () => {
    const persisted = loadPersistedState();

    expect(persisted.dataset).toBeNull();
    expect(persisted.ui.previewRowCount).toBe(5);
    expect(persisted.uploadedAt).toBeUndefined();
  });

  it("roundtrips state through localStorage", () => {
    const dataset = parseCSV("label,score\nA,1");
    const persistedState = {
      dataset,
      ui: { previewRowCount: 3 },
      uploadedAt: "2026-02-09T00:00:00.000Z",
    };

    savePersistedState(persistedState);

    expect(loadPersistedState()).toEqual(persistedState);
  });
});
