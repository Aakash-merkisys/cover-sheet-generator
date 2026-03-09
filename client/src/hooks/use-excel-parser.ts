import { useState, useCallback } from "react";
import * as XLSX from "xlsx";

interface ParsedExcelData {
    records: Record<string, any>[];
    recordCount: number;
}

export function useExcelParser() {
    const [parsedData, setParsedData] = useState<ParsedExcelData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parseFile = useCallback(async (file: File | null) => {
        if (!file) {
            setParsedData(null);
            setError(null);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const arrayBuffer = await file.arrayBuffer();
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];

            if (!sheetName) {
                throw new Error("No sheets found in the Excel file");
            }

            const sheet = workbook.Sheets[sheetName];
            const records = XLSX.utils.sheet_to_json(sheet);

            setParsedData({
                records,
                recordCount: records.length,
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : "Failed to parse Excel file";
            setError(errorMessage);
            setParsedData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const reset = useCallback(() => {
        setParsedData(null);
        setError(null);
        setIsLoading(false);
    }, []);

    return {
        parsedData,
        isLoading,
        error,
        parseFile,
        reset,
    };
}
