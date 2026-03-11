import type { Express } from "express";
import multer from "multer";
import * as xlsx from "xlsx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { storage } from "./storage";
import { api } from "@shared/routes";
import type { ExcelRecord, Template, GenerateRequest } from "@shared/schema";

const upload = multer({ storage: multer.memoryStorage() });

// Mock templates - in production, these would come from a database
const TEMPLATES: Template[] = [
  {
    id: "template-1",
    name: "Standard Template",
    customer: "General",
    description: "Default coversheet template for all customers"
  },
  {
    id: "template-2",
    name: "Engineering Template",
    customer: "Engineering Dept",
    description: "Technical documentation coversheet"
  },
  {
    id: "template-3",
    name: "Executive Template",
    customer: "Executive Office",
    description: "Premium coversheet for executive documents"
  },
];

// Helper function to normalize revision to number
function normalizeRevision(rev: any): number {
  if (typeof rev === 'number') return rev;
  if (typeof rev === 'string') {
    const parsed = parseInt(rev, 10);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}

// Helper function to group records by document and find latest revision
function processRevisions(records: ExcelRecord[], mode: 'all' | 'latest'): ExcelRecord[] {
  if (mode === 'all') {
    return records;
  }

  // Group by document identifier (using Name or ID)
  const grouped = new Map<string, ExcelRecord[]>();

  records.forEach(record => {
    const key = record.Name || record.ID || JSON.stringify(record);
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key)!.push(record);
  });

  // For each group, find the record with highest revision
  const latestRecords: ExcelRecord[] = [];

  grouped.forEach((group) => {
    if (group.length === 1) {
      latestRecords.push(group[0]);
    } else {
      // Find record with highest revision
      const latest = group.reduce((max, current) => {
        const maxRev = normalizeRevision(max.Revision);
        const currentRev = normalizeRevision(current.Revision);
        return currentRev > maxRev ? current : max;
      });
      latestRecords.push(latest);
    }
  });

  return latestRecords;
}

// Helper function to generate a single coversheet PDF
async function generateCoversheetPDF(record: ExcelRecord, template: Template): Promise<Buffer> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([600, 800]);

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // Template-specific styling
  let titleColor = rgb(0.1, 0.1, 0.4);
  let accentColor = rgb(0.2, 0.4, 0.8);

  if (template.id === 'template-2') {
    titleColor = rgb(0.1, 0.3, 0.1);
    accentColor = rgb(0.2, 0.6, 0.2);
  } else if (template.id === 'template-3') {
    titleColor = rgb(0.4, 0.1, 0.1);
    accentColor = rgb(0.8, 0.2, 0.2);
  }

  // Title
  page.drawText("COVERSHEET", {
    x: 50,
    y: 720,
    size: 32,
    font: boldFont,
    color: titleColor
  });

  // Template name
  page.drawText(template.name, {
    x: 50,
    y: 690,
    size: 12,
    font,
    color: rgb(0.5, 0.5, 0.5)
  });

  // Decorative line
  page.drawLine({
    start: { x: 50, y: 670 },
    end: { x: 550, y: 670 },
    thickness: 2,
    color: accentColor,
  });

  let yPos = 630;

  // Revision field (if present)
  if (record.Revision !== undefined && record.Revision !== null) {
    const revNum = normalizeRevision(record.Revision);
    page.drawText("Revision:", {
      x: 50,
      y: yPos,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(`Rev: ${revNum}`, {
      x: 200,
      y: yPos,
      size: 14,
      font,
      color: accentColor
    });
    yPos -= 35;
  }

  // Revision Description (if present)
  if (record.RevisionDescription) {
    page.drawText("Rev. Description:", {
      x: 50,
      y: yPos,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2)
    });
    page.drawText(String(record.RevisionDescription), {
      x: 200,
      y: yPos,
      size: 14,
      font,
      color: rgb(0.3, 0.3, 0.3)
    });
    yPos -= 35;
  }

  // Other fields
  for (const [key, value] of Object.entries(record)) {
    if (key === 'Revision' || key === 'RevisionDescription') continue;
    if (value === undefined || value === null) continue;

    page.drawText(`${key}:`, {
      x: 50,
      y: yPos,
      size: 14,
      font: boldFont,
      color: rgb(0.2, 0.2, 0.2)
    });

    const valueStr = String(value);
    const maxWidth = 350;
    const lines = [];
    let currentLine = '';

    for (const word of valueStr.split(' ')) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = font.widthOfTextAtSize(testLine, 14);

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);

    lines.forEach((line, i) => {
      page.drawText(line, {
        x: 200,
        y: yPos - (i * 18),
        size: 14,
        font,
        color: rgb(0.3, 0.3, 0.3)
      });
    });

    yPos -= 35 + ((lines.length - 1) * 18);

    if (yPos < 100) break;
  }

  // Footer
  page.drawText(`Generated: ${new Date().toLocaleDateString()}`, {
    x: 50,
    y: 50,
    size: 10,
    font,
    color: rgb(0.5, 0.5, 0.5)
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes);
}

export function registerRoutes(app: Express): void {

  // Parse Excel file and return records
  app.post(api.coversheets.parse.path, upload.single("file"), async (req, res) => {
    try {
      let records: ExcelRecord[] = [];

      if (req.file) {
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        records = xlsx.utils.sheet_to_json(sheet);
      } else {
        // Sample data with revisions
        records = [
          { Name: "Document A", ID: "DOC-001", Address: "123 Main St", Department: "Engineering", Revision: 0, RevisionDescription: "Initial Release" },
          { Name: "Document A", ID: "DOC-001", Address: "123 Main St", Department: "Engineering", Revision: 1, RevisionDescription: "Updated specs" },
          { Name: "Document A", ID: "DOC-001", Address: "123 Main St", Department: "Engineering", Revision: 2, RevisionDescription: "Final revision" },
          { Name: "Document B", ID: "DOC-002", Address: "456 Oak Rd", Department: "Marketing", Revision: 0, RevisionDescription: "First draft" },
          { Name: "Document C", ID: "DOC-003", Address: "789 Pine Ave", Department: "Sales", Revision: 0, RevisionDescription: "Initial version" },
        ];
      }

      if (!records || records.length === 0) {
        return res.status(400).json({ message: "No data found in the file." });
      }

      // Check if any record has a Revision field
      const hasRevisions = records.some(r => r.Revision !== undefined && r.Revision !== null);

      res.status(200).json({
        records,
        recordCount: records.length,
        hasRevisions
      });
    } catch (error) {
      console.error("Parse error:", error);
      res.status(500).json({ message: "Failed to parse Excel file." });
    }
  });

  // Generate coversheets for selected records
  app.post(api.coversheets.generate.path, async (req, res) => {
    try {
      const { selectedIndices, templateId, revisionMode, records } = req.body as GenerateRequest & { records: ExcelRecord[] };

      if (!records || !Array.isArray(records)) {
        return res.status(400).json({ message: "No records provided." });
      }

      if (!selectedIndices || selectedIndices.length === 0) {
        return res.status(400).json({ message: "No records selected." });
      }

      // Get selected records
      const selectedRecords = selectedIndices
        .filter(i => i >= 0 && i < records.length)
        .map(i => records[i]);

      if (selectedRecords.length === 0) {
        return res.status(400).json({ message: "Invalid selection." });
      }

      // Find template
      const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

      // Process revisions
      const recordsToGenerate = processRevisions(selectedRecords, revisionMode);

      // Generate PDFs
      const zip = new JSZip();

      for (let i = 0; i < recordsToGenerate.length; i++) {
        const record = recordsToGenerate[i];
        const pdfBuffer = await generateCoversheetPDF(record, template);

        // Create filename
        const nameKey = record.Name || record.ID || `Record_${i + 1}`;
        const revNum = record.Revision !== undefined ? `_Rev${normalizeRevision(record.Revision)}` : '';
        const filename = `${String(nameKey).replace(/[^a-zA-Z0-9]/g, '_')}${revNum}.pdf`;

        zip.file(filename, pdfBuffer);
      }

      // Generate ZIP
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      // Store in memory
      const fileId = await storage.saveFile(zipBuffer, "Coversheets.zip");

      res.status(200).json({
        id: fileId,
        downloadUrl: `/api/download/${fileId}`,
        count: recordsToGenerate.length
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ message: "An error occurred while generating coversheets." });
    }
  });

  // Get available templates
  app.get(api.templates.list.path, async (req, res) => {
    try {
      res.status(200).json(TEMPLATES);
    } catch (error) {
      console.error("Templates error:", error);
      res.status(500).json({ message: "Failed to fetch templates." });
    }
  });

  // Download generated file
  app.get("/api/download/:id", async (req, res) => {
    const fileId = req.params.id;
    const file = await storage.getFile(fileId);

    if (!file) {
      return res.status(404).send("File not found or has expired.");
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", `attachment; filename="${file.filename}"`);
    res.send(file.data);
  });

  // Download sample Excel file with revisions
  app.get("/api/download-sample", async (req, res) => {
    try {
      const sampleData = [
        { Name: "Document A", Address: "123 Main Street, New York, NY", ID: "DOC-001", Department: "Engineering", Revision: 0, RevisionDescription: "Initial Release" },
        { Name: "Document A", Address: "123 Main Street, New York, NY", ID: "DOC-001", Department: "Engineering", Revision: 1, RevisionDescription: "Updated specifications" },
        { Name: "Document A", Address: "123 Main Street, New York, NY", ID: "DOC-001", Department: "Engineering", Revision: 2, RevisionDescription: "Final revision" },
        { Name: "Document B", Address: "456 Oak Avenue, Los Angeles, CA", ID: "DOC-002", Department: "Marketing", Revision: 0, RevisionDescription: "First draft" },
        { Name: "Document C", Address: "789 Pine Road, Chicago, IL", ID: "DOC-003", Department: "Sales", Revision: 0, RevisionDescription: "Initial version" },
      ];

      const worksheet = xlsx.utils.json_to_sheet(sampleData);
      const workbook = xlsx.utils.book_new();
      xlsx.utils.book_append_sheet(workbook, worksheet, "Sample Data");

      const buffer = xlsx.write(workbook, { type: "buffer", bookType: "xlsx" });

      res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
      res.setHeader("Content-Disposition", "attachment; filename=Sample_Coversheet_Data.xlsx");
      res.send(buffer);
    } catch (error) {
      console.error("Sample download error:", error);
      res.status(500).json({ message: "Failed to generate sample file." });
    }
  });

  // Template preview endpoint
  app.get("/api/template-preview", async (req, res) => {
    try {
      const templateId = (req.query.templateId as string) || 'template-1';
      const template = TEMPLATES.find(t => t.id === templateId) || TEMPLATES[0];

      const sampleRecord: ExcelRecord = {
        Name: "Sample Document",
        Address: "123 Main Street, New York, NY 10001",
        ID: "DOC-001",
        Department: "Engineering",
        Revision: 2,
        RevisionDescription: "Updated specifications"
      };

      const pdfBuffer = await generateCoversheetPDF(sampleRecord, template);

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=Template_Preview.pdf");
      res.send(pdfBuffer);
    } catch (error) {
      console.error("Template preview error:", error);
      res.status(500).json({ message: "Failed to generate template preview." });
    }
  });
}
