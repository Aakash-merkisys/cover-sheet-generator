import { Table, Eye } from "lucide-react";
import { motion } from "framer-motion";

interface ExcelPreviewProps {
    data: Record<string, any>[];
}

export function ExcelPreview({ data }: ExcelPreviewProps) {
    if (!data || data.length === 0) return null;

    const previewData = data.slice(0, 5);
    const columns = Object.keys(previewData[0] || {});

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-3"
        >
            <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-primary" />
                <h4 className="text-sm font-semibold text-foreground">
                    Data Preview
                </h4>
                <span className="text-xs text-muted-foreground">
                    (First {previewData.length} rows)
                </span>
            </div>

            <div className="border border-border rounded-lg overflow-hidden bg-white">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="bg-secondary/50 border-b border-border">
                                <th className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider w-12">
                                    #
                                </th>
                                {columns.map((col) => (
                                    <th
                                        key={col}
                                        className="px-3 py-2 text-left text-xs font-semibold text-foreground uppercase tracking-wider"
                                    >
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {previewData.map((row, idx) => (
                                <tr
                                    key={idx}
                                    className="hover:bg-secondary/30 transition-colors"
                                >
                                    <td className="px-3 py-2 text-xs text-muted-foreground font-medium">
                                        {idx + 1}
                                    </td>
                                    {columns.map((col) => (
                                        <td
                                            key={col}
                                            className="px-3 py-2 text-xs text-foreground max-w-[200px] truncate"
                                            title={String(row[col] || "")}
                                        >
                                            {String(row[col] || "-")}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {data.length > 5 && (
                <p className="text-xs text-muted-foreground text-center">
                    + {data.length - 5} more rows will be processed
                </p>
            )}
        </motion.div>
    );
}
