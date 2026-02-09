export type SortDirection = "asc" | "desc";

const FALLBACK_LOCALE = "en";

export function filterRows(rows: string[][], query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return rows;
  }

  return rows.filter((row) => row.some((cell) => cell.toLowerCase().includes(normalizedQuery)));
}

export function sortRows(rows: string[][], columnIndex: number, direction: SortDirection) {
  const sorted = [...rows];
  const factor = direction === "asc" ? 1 : -1;

  sorted.sort((rowA, rowB) => {
    const valueA = rowA[columnIndex] ?? "";
    const valueB = rowB[columnIndex] ?? "";
    const comparison = compareCells(valueA, valueB);
    if (comparison === 0) {
      return 0;
    }
    return comparison * factor;
  });

  return sorted;
}

function compareCells(left: string, right: string) {
  const a = left.trim();
  const b = right.trim();

  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return 1;
  }

  if (!b) {
    return -1;
  }

  const numericA = Number(a);
  const numericB = Number(b);

  const bothNumeric = !Number.isNaN(numericA) && !Number.isNaN(numericB);
  if (bothNumeric) {
    return numericA - numericB;
  }

  return a.localeCompare(b, FALLBACK_LOCALE, { numeric: true, sensitivity: "base" });
}
