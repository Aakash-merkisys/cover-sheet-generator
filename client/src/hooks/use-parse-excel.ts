import { useMutation } from "@tanstack/react-query";
import type { ParseResponse } from "@shared/schema";

export function useParseExcel() {
    return useMutation({
        mutationFn: async (file: File | null): Promise<ParseResponse> => {
            const formData = new FormData();
            if (file) {
                formData.append("file", file);
            }

            const response = await fetch("/api/parse", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to parse file");
            }

            return response.json();
        },
    });
}
