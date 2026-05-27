import Papa from "papaparse";
import { UploadUserRow } from "@/types";

function toText(value: unknown) {
  return typeof value === "string" || typeof value === "number" ? String(value).trim() : "";
}

function normalizeRow(row: Record<string, unknown>): UploadUserRow {
  return {
    firstName: toText(row.firstName ?? row["First Name"]),
    lastName: toText(row.lastName ?? row["Last Name"]),
    email: toText(row.email ?? row.Email).toLowerCase(),
    position: toText(row.position ?? row.Position),
  };
}

function validateRows(rows: UploadUserRow[]) {
  return rows.filter((row) => row.firstName && row.lastName && row.email && row.position);
}

export async function parseUserUpload(file: File) {
  const extension = file.name.split(".").pop()?.toLowerCase();

  if (extension === "csv") {
    const text = await file.text();
    const parsed = Papa.parse<Record<string, unknown>>(text, {
      header: true,
      skipEmptyLines: true,
    });

    return validateRows(parsed.data.map(normalizeRow));
  }

  const buffer = await file.arrayBuffer();
  const ExcelJS = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];

  if (!worksheet) {
    return [];
  }

  const headerRow = worksheet.getRow(1);
  const headerValues = Array.isArray(headerRow.values) ? headerRow.values.slice(1) : [];
  const headers = headerValues.map((value) => toText(value).split(/\s+/).filter(Boolean).join(" "));

  const rows: Record<string, unknown>[] = [];

  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) {
      return;
    }

    const values = Array.isArray(row.values) ? row.values.slice(1) : [];
    const record = headers.reduce<Record<string, unknown>>((current: Record<string, unknown>, header: string, index: number) => {
      current[header] = values[index];
      return current;
    }, {});

    rows.push(record);
  });

  return validateRows(rows.map(normalizeRow));
}
