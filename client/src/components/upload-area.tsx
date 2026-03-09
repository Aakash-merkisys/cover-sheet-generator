import { FileUpload } from "./file-upload";
import { FileSpreadsheet, CheckCircle2, AlertCircle } from "lucide-react";

interface UploadAreaProps {
    file: File | null;
    onFileChange: (file: File | null) => void;
    recordCount: number | null;
    disabled?: boolean;
}

export function UploadArea({ file, onFileChange, recordCount, disabled }: UploadAreaProps) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-primary" />
                    Upload Data Source
                </h3>
                <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                    Optional
                </span>
            </div>

            <p className="text-sm text-muted-foreground">
                Upload an Excel file with your data, or leave empty to test with sample records.
            </p>

            <FileUpload file={file} onFileChange={onFileChange} disabled={disabled} />

            {file && recordCount !== null && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-green-900">
                            {file.name}
                        </p>
                        <p className="text-xs text-green-700">
                            {recordCount} {recordCount === 1 ? 'row' : 'rows'} detected
                        </p>
                    </div>
                </div>
            )}

            {file && recordCount === 0 && (
                <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                    <p className="text-sm text-amber-900">
                        No data rows found in the uploaded file
                    </p>
                </div>
            )}
        </div>
    );
}
