import { z } from "zod";

// Excel record schema
export const excelRecordSchema = z.object({
  Name: z.string().optional(),
  ID: z.string().optional(),
  Address: z.string().optional(),
  Department: z.string().optional(),
  Revision: z.union([z.number(), z.string()]).optional(),
  RevisionDescription: z.string().optional(),
}).passthrough(); // Allow additional fields

export type ExcelRecord = z.infer<typeof excelRecordSchema>;

// Parsed data response
export const parsedDataSchema = z.object({
  records: z.array(excelRecordSchema),
  recordCount: z.number(),
});

export type ParsedData = z.infer<typeof parsedDataSchema>;

// Template schema
export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  customer: z.string(),
  description: z.string().optional(),
});

export type Template = z.infer<typeof templateSchema>;

// Generate request schema
export const generateRequestSchema = z.object({
  selectedIndices: z.array(z.number()),
  templateId: z.string(),
  revisionMode: z.enum(["all", "latest"]),
});

export type GenerateRequest = z.infer<typeof generateRequestSchema>;

// Generate response schema
export const generateResponseSchema = z.object({
  id: z.string(),
  downloadUrl: z.string(),
  count: z.number(),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;

// Parse response schema
export const parseResponseSchema = z.object({
  records: z.array(excelRecordSchema),
  recordCount: z.number(),
  hasRevisions: z.boolean(),
});

export type ParseResponse = z.infer<typeof parseResponseSchema>;
