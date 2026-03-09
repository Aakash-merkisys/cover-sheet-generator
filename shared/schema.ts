import { z } from "zod";

export const generateResponseSchema = z.object({
  id: z.string(),
  downloadUrl: z.string(),
  count: z.number(),
});

export type GenerateResponse = z.infer<typeof generateResponseSchema>;