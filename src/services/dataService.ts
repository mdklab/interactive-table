export type ColumnType = "number" | "boolean" | "text" | "empty";

export interface ColumnMeta {
  name: string;
  type: ColumnType;
  sample: string;
}

export interface ParsedDataset {
  headers: string[];
  rows: string[][];
  columnMeta: ColumnMeta[];
  rowCount: number;
}

export interface UIState {
  previewRowCount: number;
}

export interface PersistedState {
  dataset: ParsedDataset | null;
  ui: UIState;
  uploadedAt?: string;
}

const STATE_KEY = "interactive-table:state";
const DEFAULT_UI_STATE: UIState = { previewRowCount: 5 };

export function parseCSV(raw: string): ParsedDataset {
  const normalized = raw.trim();
  if (!normalized) {
    throw new Error("Uploaded file is empty");
  }

  const lines = normalized.split(/\r?\n/).map((line) => line.trim());
  const headerLine = lines.shift();
  if (!headerLine) {
    throw new Error("Missing header row");
  }

  const delimiter = detectDelimiter(headerLine);
  const headers = splitRow(headerLine, delimiter).filter((value) => value.length > 0);
  if (!headers.length) {
    throw new Error("Headers could not be parsed");
  }

  const rows = lines
    .filter((line) => line.length > 0)
    .map((line) => splitRow(line, delimiter))
    .map((row) => padRow(row, headers.length));

  const meaningfulRows = rows.filter((row) => row.some((cell) => cell !== ""));

  const columnMeta = headers.map((header, index) => {
    const columnValues = meaningfulRows.map((row) => row[index] ?? "");
    const type = detectColumnType(columnValues);
    const sample = columnValues.find((cell) => cell !== "") ?? "";
    return { name: header, type, sample };
  });

  return {
    headers,
    rows: meaningfulRows,
    rowCount: meaningfulRows.length,
    columnMeta,
  };
}

export function loadPersistedState(): PersistedState {
  if (typeof localStorage === "undefined") {
    return getDefaultState();
  }

  const raw = localStorage.getItem(STATE_KEY);
  if (!raw) {
    return getDefaultState();
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      dataset: parsed.dataset ?? null,
      ui: { ...DEFAULT_UI_STATE, ...parsed.ui },
      uploadedAt: parsed.uploadedAt,
    };
  } catch (error) {
    localStorage.removeItem(STATE_KEY);
    return getDefaultState();
  }
}

export function savePersistedState(state: PersistedState) {
  if (typeof localStorage === "undefined") {
    return;
  }

  localStorage.setItem(STATE_KEY, JSON.stringify(state));
}

function getDefaultState(): PersistedState {
  return { dataset: null, ui: { ...DEFAULT_UI_STATE }, uploadedAt: undefined };
}

function detectDelimiter(line: string): string {
  const counts: Record<string, number> = {
    "\t": (line.match(/\t/g) ?? []).length,
    ",": (line.match(/,/g) ?? []).length,
    ";": (line.match(/;/g) ?? []).length,
  };

  const winners = Object.entries(counts).sort((a, b) => b[1] - a[1]);
  if (winners.length && winners[0][1] > 0) {
    return winners[0][0];
  }

  return ",";
}

function splitRow(line: string, delimiter: string) {
  return line.split(delimiter).map((value) => value.trim());
}

function padRow(row: string[], length: number) {
  if (row.length === length) {
    return row;
  }

  if (row.length > length) {
    return row.slice(0, length);
  }

  return [...row, ...Array(length - row.length).fill("")];
}

function detectColumnType(values: string[]): ColumnType {
  const trimmed = values.map((value) => value.trim()).filter((value) => value.length > 0);
  if (!trimmed.length) {
    return "empty";
  }

  const allBoolean = trimmed.every((value) => {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "false";
  });
  if (allBoolean) {
    return "boolean";
  }

  const allNumbers = trimmed.every((value) => !Number.isNaN(Number(value)));
  if (allNumbers) {
    return "number";
  }

  return "text";
}
