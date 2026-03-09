import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  file: File | null;
  onFileChange: (file: File | null) => void;
  disabled?: boolean;
}

export function FileUpload({ file, onFileChange, disabled = false }: FileUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileChange(acceptedFiles[0]);
    }
  }, [onFileChange]);

  const { getRootProps, getInputProps, isDragActive, isDragAccept } = useDropzone({
    onDrop,
    disabled,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls']
    },
    maxFiles: 1
  });

  if (file) {
    return (
      <div className="relative flex items-center p-4 bg-secondary/60 rounded-xl border border-border transition-all duration-200">
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-white shadow-sm border border-border mr-4 shrink-0">
          <FileSpreadsheet className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1 min-w-0 pr-4">
          <p className="text-sm font-semibold text-foreground truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {(file.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        {!disabled && (
          <button
            onClick={() => onFileChange(null)}
            className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-full hover:bg-destructive/10"
            title="Remove file"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300",
        disabled && "opacity-50 cursor-not-allowed border-border bg-muted/30",
        !disabled && isDragActive && "border-primary bg-primary/10 scale-[1.02] shadow-lg",
        !disabled && isDragAccept && "border-green-500 bg-green-50",
        !disabled && !isDragActive && "border-border hover:border-primary/50 hover:bg-secondary/50 hover:shadow-md"
      )}
    >
      <input {...getInputProps()} />
      <div className={cn(
        "mx-auto w-16 h-16 mb-4 rounded-full flex items-center justify-center transition-all duration-300",
        isDragActive ? "bg-primary/20 scale-110" : "bg-secondary"
      )}>
        <Upload className={cn(
          "w-8 h-8 transition-all duration-300",
          isDragActive ? "text-primary scale-110" : "text-muted-foreground"
        )} />
      </div>
      <p className="text-base font-semibold text-foreground mb-1">
        {isDragActive ? "Drop your Excel file here" : "Click to upload Excel file"}
      </p>
      <p className="text-sm text-muted-foreground">
        or drag and drop (.xlsx files only)
      </p>
      {isDragActive && (
        <div className="absolute inset-0 rounded-xl border-2 border-primary animate-pulse pointer-events-none" />
      )}
    </div>
  );
}
