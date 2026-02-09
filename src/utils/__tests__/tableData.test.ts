import { filterRows, sortRows } from "../tableData";

describe("tableData utilities", () => {
  const rows = [
    ["Apple", "10"],
    ["Banana", "2"],
    ["Cherry", "30"],
    ["Banana split", "20"],
  ];

  it("filters rows by query across columns", () => {
    const filtered = filterRows(rows, "ban");
    expect(filtered).toHaveLength(2);
    expect(filtered).toEqual(expect.arrayContaining([rows[1], rows[3]]));
  });

  it("returns the original rows when the query is empty", () => {
    const filtered = filterRows(rows, "");
    expect(filtered).toBe(rows);
  });

  it("sorts rows numerically for numeric-like values", () => {
    const sorted = sortRows(rows, 1, "asc");
    expect(sorted[0]).toEqual(rows[1]);
    expect(sorted[sorted.length - 1]).toEqual(rows[2]);
  });

  it("sorts rows descending when requested", () => {
    const sorted = sortRows(rows, 1, "desc");
    expect(sorted[0]).toEqual(rows[2]);
    expect(sorted[sorted.length - 1]).toEqual(rows[1]);
  });
});
