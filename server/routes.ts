import type { Express } from "express";
import multer from "multer";
import * as xlsx from "xlsx";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import JSZip from "jszip";
import { storage } from "./storage";
import { api } from "@shared/routes";

const upload = multer({ storage: multer.memoryStorage() });

export function registerRoutes(app: Express): void {

  app.post(api.coversheets.generate.path, upload.single("file"), async (req, res) => {
    try {
      let records: any[] = [];

      if (req.file) {
        // Parse the uploaded Excel file
        const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        records = xlsx.utils.sheet_to_json(sheet);
      } else {
        // Use default mock data
        records = [
          { Name: "Alice Smith", ID: "1001", Address: "123 Main St, NY", Department: "Engineering" },
          { Name: "Bob Johnson", ID: "1002", Address: "456 Oak Rd, CA", Department: "Marketing" },
          { Name: "Charlie Brown", ID: "1003", Address: "789 Pine Ave, TX", Department: "Sales" },
          { Name: "Diana Prince", ID: "1004", Address: "321 Elm St, WA", Department: "HR" },
          { Name: "Ethan Hunt", ID: "1005", Address: "654 Maple Dr, FL", Department: "Finance" },
        ];
      }

      if (!records || records.length === 0) {
        return res.status(400).json({ message: "No data found to generate coversheets." });
      }

      const zip = new JSZip();

      // Create a template placeholder image (a simple 1x1 gray pixel PNG)
      const templateImageBytes = Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mM8c+bMfwYAAcQByN4c5P4AAAAASUVORK5CYII=",
        "base64"
      );

      for (let i = 0; i < records.length; i++) {
        const record = records[i];

        // Generate PDF
        const pdfDoc = await PDFDocument.create();
        const page = pdfDoc.addPage([600, 800]);

        // Embed the template image and stretch it to cover the background
        const image = await pdfDoc.embedPng(templateImageBytes);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: 600,
          height: 800,
          opacity: 0.1
        });

        // Overlay text
        const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
        const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

        page.drawText("COVERSHEET", { x: 50, y: 700, size: 30, font: boldFont, color: rgb(0.1, 0.1, 0.4) });

        let yPos = 600;
        for (const [key, value] of Object.entries(record)) {
          page.drawText(`${key}:`, { x: 50, y: yPos, size: 14, font: boldFont });
          page.drawText(`${value || ""}`, { x: 200, y: yPos, size: 14, font });
          yPos -= 30;
        }

        const pdfBytes = await pdfDoc.save();

        // Name the file cleanly based on the first key or index
        const nameKey = Object.keys(record).find(k => k.toLowerCase().includes("name"));
        const identifier = nameKey && record[nameKey] ? record[nameKey].toString().replace(/[^a-zA-Z0-9]/g, "_") : `Record_${i + 1}`;
        zip.file(`Coversheet_${identifier}.pdf`, pdfBytes);
      }

      // Generate the ZIP file
      const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

      // Store in memory
      const fileId = await storage.saveFile(zipBuffer, "Coversheets.zip");

      res.status(200).json({
        id: fileId,
        downloadUrl: `/api/download/${fileId}`,
        count: records.length
      });
    } catch (error) {
      console.error("Generation error:", error);
      res.status(500).json({ message: "An error occurred while generating coversheets." });
    }
  });

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

  // Download sample Excel file
  app.get("/api/download-sample", async (req, res) => {
    try {
      const sampleData = [
        { Name: "John Doe", Address: "123 Main Street, New York, NY 10001", ID: "EMP001", Date: "2024-01-15" },
        { Name: "Jane Smith", Address: "456 Oak Avenue, Los Angeles, CA 90001", ID: "EMP002", Date: "2024-01-16" },
        { Name: "Mike Johnson", Address: "789 Pine Road, Chicago, IL 60601", ID: "EMP003", Date: "2024-01-17" },
        { Name: "Sarah Williams", Address: "321 Elm Street, Houston, TX 77001", ID: "EMP004", Date: "2024-01-18" },
        { Name: "David Brown", Address: "654 Maple Drive, Phoenix, AZ 85001", ID: "EMP005", Date: "2024-01-19" },
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
      const pdfDoc = await PDFDocument.create();
      const page = pdfDoc.addPage([600, 800]);

      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Title
      page.drawText("COVERSHEET TEMPLATE", {
        x: 50,
        y: 720,
        size: 28,
        font: boldFont,
        color: rgb(0.1, 0.1, 0.4)
      });

      // Subtitle
      page.drawText("Preview of Document Format", {
        x: 50,
        y: 690,
        size: 12,
        font,
        color: rgb(0.4, 0.4, 0.4)
      });

      // Draw a decorative line
      page.drawLine({
        start: { x: 50, y: 670 },
        end: { x: 550, y: 670 },
        thickness: 2,
        color: rgb(0.1, 0.1, 0.4),
      });

      // Sample fields
      const fields = [
        { label: "Name:", value: "John Doe" },
        { label: "Address:", value: "123 Main Street, New York, NY 10001" },
        { label: "ID:", value: "EMP001" },
        { label: "Date:", value: "2024-01-15" },
      ];

      let yPos = 620;
      for (const field of fields) {
        page.drawText(field.label, {
          x: 50,
          y: yPos,
          size: 14,
          font: boldFont,
          color: rgb(0.2, 0.2, 0.2)
        });
        page.drawText(field.value, {
          x: 200,
          y: yPos,
          size: 14,
          font,
          color: rgb(0.3, 0.3, 0.3)
        });
        yPos -= 40;
      }

      // Footer note
      page.drawText("This is a preview template. Your data will be populated here.", {
        x: 50,
        y: 100,
        size: 10,
        font,
        color: rgb(0.5, 0.5, 0.5)
      });

      const pdfBytes = await pdfDoc.save();

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", "inline; filename=Template_Preview.pdf");
      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      console.error("Template preview error:", error);
      res.status(500).json({ message: "Failed to generate template preview." });
    }
  });
}
