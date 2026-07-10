import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";

interface ExportColumn {
  header: string;
  key: string;
  format?: "currency" | "date" | "number" | "string";
}

interface ExportOptions {
  platform?: string;
  userName?: string;
  executiveSummary?: string;
  totals?: Record<string, number | string>;
}

// Helper to generate a random Report ID
export function generateReportId(): string {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `ANX-2026-${rand}`;
}

/**
 * Generates and downloads a professional, styled PDF report
 */
export function exportToPDF(
  title: string,
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions = {}
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  const margin = 15;
  const reportId = generateReportId();
  const dateStr = new Date().toLocaleString("en-IN");
  const platform = options.platform || "Farmer Platform";
  const userName = options.userName || "AgriNex Participant";

  // --- Page Dimensions ---
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // --- Draw Banner Header ---
  // Background Green Bar
  doc.setFillColor(15, 61, 46); // Deep Forest Green (#0F3D2E)
  doc.rect(0, 0, pageWidth, 28, "F");

  // Logo Badge Icon
  doc.setFillColor(34, 197, 94); // Bright Emerald Green (#22C55E)
  doc.rect(margin, 6, 8, 8, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(8);
  doc.text("AN", margin + 1.5, 11.5);

  // Platform & Brand Name
  doc.setFontSize(14);
  doc.text("AgriNex AI", margin + 11, 10);
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(8);
  doc.setTextColor(209, 250, 229); // Soft Mint (#D1FAE5)
  doc.text(platform.toUpperCase(), margin + 11, 14);

  // Metadata block in Header
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(`REPORT ID: ${reportId}`, pageWidth - margin - 50, 10);
  doc.text(`DATE: ${dateStr}`, pageWidth - margin - 50, 14);

  // --- Report Title ---
  doc.setTextColor(15, 61, 46);
  doc.setFont("Helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, margin, 38);

  // Divider Line
  doc.setDrawColor(34, 197, 94);
  doc.setLineWidth(0.5);
  doc.line(margin, 41, pageWidth - margin, 41);

  // User Info Block
  doc.setFont("Helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Generated for: ${userName}`, margin, 47);

  let currentY = 54;

  // --- Executive Summary Box ---
  if (options.executiveSummary) {
    const summaryLines = doc.splitTextToSize(options.executiveSummary, pageWidth - (margin * 2) - 10);
    const boxHeight = (summaryLines.length * 5) + 12;

    // Draw Light Green Card background
    doc.setFillColor(240, 253, 244); // Very soft emerald
    doc.setDrawColor(187, 247, 208); // border-emerald-200
    doc.rect(margin, currentY, pageWidth - (margin * 2), boxHeight, "FD");

    // Title inside card
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(21, 128, 61); // dark emerald
    doc.text("EXECUTIVE SUMMARY", margin + 5, currentY + 6);

    // Text content
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(summaryLines, margin + 5, currentY + 12);

    currentY += boxHeight + 8;
  }

  // --- Table Header & Body Setup ---
  const tableHeaders = columns.map(c => c.header);
  const tableRows = data.map(row => {
    return columns.map(col => {
      const val = row[col.key];
      if (val === undefined || val === null) return "-";
      if (col.format === "currency") {
        return `Rs. ${Number(val).toLocaleString("en-IN")}`;
      }
      if (col.format === "date") {
        return new Date(val).toLocaleDateString("en-IN");
      }
      return String(val);
    });
  });

  // Add Totals row if provided
  if (options.totals) {
    const totalsRow = columns.map(col => {
      const val = options.totals?.[col.key];
      if (val === undefined || val === null) return "";
      if (col.format === "currency") {
        return `Rs. ${Number(val).toLocaleString("en-IN")}`;
      }
      return String(val);
    });
    tableRows.push(totalsRow);
  }

  // --- Render Table using AutoTable ---
  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableRows,
    margin: { left: margin, right: margin },
    theme: "striped",
    headStyles: {
      fillColor: [15, 61, 46], // Deep Forest Green (#0F3D2E)
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 65, 85],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // soft slate row color
    },
    columnStyles: {
      // Set alignment for currency or numeric column values
      ...columns.reduce((acc, col, idx) => {
        if (col.format === "currency" || col.format === "number") {
          acc[idx] = { halign: "right" };
        }
        return acc;
      }, {} as Record<number, any>),
    },
    didParseCell: (cellData) => {
      // Style the last row (Totals row) as bold and highlight it
      if (options.totals && cellData.row.index === tableRows.length - 1) {
        cellData.cell.styles.fontStyle = "bold";
        cellData.cell.styles.textColor = [15, 61, 46];
        cellData.cell.styles.fillColor = [220, 252, 231]; // soft light green total row
      }
    },
  });

  // --- Add Page Footers ---
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    
    // Bottom thin line divider
    doc.setDrawColor(241, 245, 249);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Generated by AgriNex AI Platform", margin, pageHeight - 8);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 20, pageHeight - 8);
  }

  // --- Download the PDF file ---
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  doc.save(`${cleanTitle}_report.pdf`);
}

/**
 * Generates and downloads a styled Excel spreadsheet
 */
export function exportToExcel(
  title: string,
  data: any[],
  columns: ExportColumn[],
  options: ExportOptions = {}
) {
  const wb = XLSX.utils.book_new();
  const platform = options.platform || "Farmer Platform";
  const dateStr = new Date().toLocaleString("en-IN");

  // Create an array structure for standard rows to ensure premium layout
  const rows: any[][] = [
    ["AgriNex AI Platform", "", "", ""],
    [platform.toUpperCase(), "", "", ""],
    ["Report Title:", title, "", ""],
    ["Generated On:", dateStr, "", ""],
    [], // Blank spacing row
  ];

  // Add Executive Summary if provided
  if (options.executiveSummary) {
    rows.push(["Executive Summary:", options.executiveSummary, "", ""]);
    rows.push([]); // Spacer
  }

  // Add Table Column Headers
  const headers = columns.map(c => c.header);
  rows.push(headers);

  // Add Table Data Rows
  data.forEach((item) => {
    const rowValues = columns.map(col => {
      const val = item[col.key];
      if (val === undefined || val === null) return "";
      return val;
    });
    rows.push(rowValues);
  });

  // Add Totals row if provided
  if (options.totals) {
    const totalsRow = columns.map(col => {
      const val = options.totals?.[col.key];
      return val !== undefined && val !== null ? val : "";
    });
    rows.push(totalsRow);
  }

  // Convert array to worksheet
  const ws = XLSX.utils.aoa_to_sheet(rows);

  // Configure column widths dynamically
  const colWidths = columns.map((col, idx) => {
    // Find the longest length in the values of this column
    const headerLen = col.header.length;
    const maxValLen = data.reduce((acc, row) => {
      const val = String(row[col.key] || "");
      return Math.max(acc, val.length);
    }, 0);
    return { wch: Math.max(headerLen, maxValLen) + 5 };
  });
  ws["!cols"] = colWidths;

  // Add worksheet to workbook
  XLSX.utils.book_append_sheet(wb, ws, "Report Summary");

  // --- Write and Download file ---
  const cleanTitle = title.toLowerCase().replace(/[^a-z0-9]/g, "_");
  XLSX.writeFile(wb, `${cleanTitle}_data.xlsx`);
}
