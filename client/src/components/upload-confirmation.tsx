import { CheckCircle2, FileSpreadsheet, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface UploadConfirmationProps {
    fileName: string;
    recordCount: number;
    onChangeFile: () => void;
}

export function UploadConfirmation({ fileName, recordCount, onChangeFile }: UploadConfirmationProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="border-2 border-green-200 bg-green-50 rounded-xl p-6"
        >
            <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                        <h4 className="text-base font-semibold text-green-900">
                            File uploaded successfully
                        </h4>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <FileSpreadsheet className="w-4 h-4 text-green-700" />
                            <span className="text-green-800">
                                <span className="font-medium">File name:</span> {fileName}
                            </span>
                        </div>

                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 flex items-center justify-center">
                                <div className="w-2 h-2 rounded-full bg-green-600" />
                            </div>
                            <span className="text-green-800">
                                <span className="font-medium">Records detected:</span>{" "}
                                <span className="font-bold">{recordCount}</span> {recordCount === 1 ? 'row' : 'rows'}
                            </span>
                        </div>
                    </div>
                </div>

                <Button
                    onClick={onChangeFile}
                    variant="outline"
                    size="sm"
                    className="flex-shrink-0 border-green-300 hover:bg-green-100 hover:border-green-400"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Change File
                </Button>
            </div>
        </motion.div>
    );
}
