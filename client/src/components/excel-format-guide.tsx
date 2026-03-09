import { FileSpreadsheet, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

const REQUIRED_COLUMNS = [
    { name: "Name", example: "John Doe" },
    { name: "Address", example: "123 Main St" },
    { name: "ID", example: "EMP001" },
    { name: "Date", example: "2024-01-15" },
];

export function ExcelFormatGuide() {
    const handleDownloadSample = () => {
        // This will be implemented on the backend
        window.location.href = "/api/download-sample";
    };

    return (
        <div className="bg-secondary/50 rounded-xl p-4 space-y-3">
            <div className="flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground mb-2">
                        Required Excel Columns
                    </h4>
                    <div className="overflow-x-auto">
                        <div className="inline-flex gap-2 text-xs font-mono bg-background rounded-lg p-2 border border-border">
                            {REQUIRED_COLUMNS.map((col, index) => (
                                <span key={col.name} className="flex items-center">
                                    <span className="font-semibold text-primary">{col.name}</span>
                                    {index < REQUIRED_COLUMNS.length - 1 && (
                                        <span className="text-muted-foreground mx-2">|</span>
                                    )}
                                </span>
                            ))}
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                        Your Excel file should contain these columns with data in each row.
                    </p>
                </div>
            </div>
            <Button
                variant="outline"
                size="sm"
                onClick={handleDownloadSample}
                className="w-full"
            >
                <Download className="w-4 h-4 mr-2" />
                Download Sample Excel
            </Button>
        </div>
    );
}
