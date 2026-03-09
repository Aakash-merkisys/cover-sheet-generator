import { useMutation } from "@tanstack/react-query";
import { api } from "@shared/routes";

export function useGenerateCoversheets() {
  return useMutation({
    mutationFn: async (file: File | null) => {
      const formData = new FormData();
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch(api.coversheets.generate.path, {
        method: api.coversheets.generate.method,
        body: formData,
        // CRITICAL: Do not set Content-Type header. 
        // The browser automatically sets it to multipart/form-data with the correct boundary.
      });

      if (!res.ok) {
        let errorMessage = "Failed to generate coversheets";
        try {
          const errorData = await res.json();
          if (errorData.message) {
            errorMessage = errorData.message;
          }
        } catch (e) {
          // If JSON parsing fails, rely on the default error message
        }
        throw new Error(errorMessage);
      }

      const data = await res.json();
      
      // Validate the response using the exact schema from our API contract
      const parsed = api.coversheets.generate.responses[200].safeParse(data);
      if (!parsed.success) {
        console.error("[Zod] Response validation failed:", parsed.error.format());
        throw new Error("Received an invalid response format from the server.");
      }
      
      return parsed.data;
    },
  });
}
