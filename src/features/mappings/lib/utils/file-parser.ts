import Papa from "papaparse";
import * as XLSX from "xlsx";
import type { DataRow } from "../types";

export async function parseFile(file: File): Promise<DataRow[]> {
  const fileExtension = file.name.split(".").pop()?.toLowerCase();

  if (fileExtension === "csv") {
    return parseCSV(file);
  } else if (fileExtension === "xls" || fileExtension === "xlsx") {
    return parseExcel(file);
  } else {
    throw new Error(
      "Unsupported file format. Please upload a CSV or Excel file.",
    );
  }
}

function parseCSV(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header: string) => {
        // Clean and normalize header names
        return header.trim().toLowerCase().replace(/\s+/g, "_");
      },
      complete: (results) => {
        if (results.errors.length > 0) {
          reject(new Error(`CSV parsing error: ${results.errors[0].message}`));
          return;
        }

        const data: DataRow[] = results.data.map((row: any, index: number) => ({
          id: `row-${index}`,
          ...row,
        }));

        resolve(data);
      },
      error: (error) => {
        reject(new Error(`Failed to parse CSV: ${error.message}`));
      },
    });
  });
}

function parseExcel(file: File): Promise<DataRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the first worksheet
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Convert to JSON with header row
        const jsonData = XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: "",
        }) as any[][];

        if (jsonData.length === 0) {
          reject(new Error("Excel file is empty"));
          return;
        }

        // Extract headers and normalize them
        const headers = jsonData[0].map((header: any) =>
          String(header).trim().toLowerCase().replace(/\s+/g, "_"),
        );

        // Convert rows to objects
        const rows: DataRow[] = jsonData
          .slice(1)
          .map((row: any[], index: number) => {
            const rowData: DataRow = { id: `row-${index}` };
            headers.forEach((header: string, colIndex: number) => {
              rowData[header] = row[colIndex] || "";
            });
            return rowData;
          });

        resolve(rows);
      } catch (error) {
        reject(
          new Error(
            `Failed to parse Excel file: ${error instanceof Error ? error.message : "Unknown error"}`,
          ),
        );
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsArrayBuffer(file);
  });
}
