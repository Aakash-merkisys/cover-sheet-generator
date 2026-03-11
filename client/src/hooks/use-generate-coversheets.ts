import { useMutation } from "@tanstack/react-query";
import type { GenerateResponse, GenerateRequest, ExcelRecord } from "@shared/schema";

interface GenerateParams extends GenerateRequest {
    records: ExcelRecord[];
}

export function useGenerateCoversheets() {
    return useMutation({
        mutationFn: async (params: GenerateParams): Promise<GenerateResponse> => {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(params),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || "Failed to generate coversheets");
            }

            return response.json();
        },
    });
}
