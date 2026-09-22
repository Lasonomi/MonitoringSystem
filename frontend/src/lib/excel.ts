import * as XLSX from "xlsx";

/**
 * Utility to export an array of JSON objects to an Excel (.xlsx) file.
 * Triggers a direct browser download without needing a backend server.
 */
export function exportToExcel<T extends Record<string, unknown>>(
  data: T[],
  fileName: string = "export_data",
  sheetName: string = "Sheet1"
): void {
  if (!data || data.length === 0) {
    console.warn("exportToExcel: No data to export");
    return;
  }

  // Create worksheet from json data
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Auto-fit column widths
  const colWidths = Object.keys(data[0]).map((key) => {
    const maxLen = Math.max(
      key.length,
      ...data.map((item) => (item[key] ? String(item[key]).length : 0))
    );
    return { wch: Math.min(Math.max(maxLen + 2, 10), 40) };
  });
  worksheet["!cols"] = colWidths;

  // Create workbook and append worksheet
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write file and trigger download
  const safeFileName = fileName.endsWith(".xlsx") ? fileName : `${fileName}.xlsx`;
  XLSX.writeFile(workbook, safeFileName);
}
