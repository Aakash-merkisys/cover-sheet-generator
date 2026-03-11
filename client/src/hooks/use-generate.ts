import { useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import type { GenerateRequest, ExcelRecord, Template } from "@shared/schema";

export function useParseExcel() {
  return useMutation({
    mutationFn: async (file: File | null) => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch(api.coversheets.parse.path, {
        method: api.coversheets.parse.method,
        body: formData,
      });

      if (!res.ok) {
        let errorMessage = "Failed to parse file";
        try {
          const errorData = await res.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      const parsed = api.coversheets.parse.responses[200].safeParse(data);
      if (!parsed.success) {
        throw new Error("Received an invalid response format from the server.");
      }
      
      return parsed.data;
    },
  });
}

export function useGenerateCoversheets() {
  return useMutation({
    mutationFn: async (payload: GenerateRequest & { records: ExcelRecord[] }) => {
      const res = await fetch(api.coversheets.generate.path, {
        method: api.coversheets.generate.method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMessage = "Failed to generate coversheets";
        try {
          const errorData = await res.json();
          if (errorData.message) errorMessage = errorData.message;
        } catch (e) {}
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      const parsed = api.coversheets.generate.responses[200].safeParse(data);
      if (!parsed.success) {
        throw new Error("Received an invalid response format from the server.");
      }
      
      return parsed.data;
    },
  });
}

export function useTemplates() {
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      const res = await fetch(api.templates.list.path);
      if (!res.ok) throw new Error("Failed to fetch templates");
      return res.json();
    }
  });
}
