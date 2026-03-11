import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ExcelRecord } from "@shared/schema";
import { CheckSquare, Square } from "lucide-react";

interface RecordsTableProps {
    records: ExcelRecord[];
    selectedIndices: number[];
    onSelectionChange: (indices: number[]) => void;
    hasRevisions: boolean;
}

export function RecordsTable({ records, selectedIndices, onSelectionChange, hasRevisions }: RecordsTableProps) {
    const allSelected = selectedIndices.length === records.length && records.length > 0;
    const someSelected = selectedIndices.length > 0 && selectedIndices.length < records.length;

    const handleSelectAll = () => {
        if (allSelected) {
            onSelectionChange([]);
        } else {
            onSelectionChange(records.map((_, i) => i));
        }
    };

    const handleSelectRow = (index: number) => {
        if (selectedIndices.includes(index)) {
            onSelectionChange(selectedIndices.filter(i => i !== index));
        } else {
            onSelectionChange([...selectedIndices, index]);
        }
    };

    // Get all unique keys from records
    const allKeys = Array.from(
        new Set(records.flatMap(record => Object.keys(record)))
    ).filter(key => key !== 'Revision' && key !== 'RevisionDescription');

    // Add revision keys at the beginning if they exist
    const displayKeys = hasRevisions
        ? ['Revision', 'RevisionDescription', ...allKeys]
        : allKeys;

    return (
        <div className="border rounded-lg overflow-hidden bg-white">
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 border-b">
                        <tr>
                            <th className="p-3 text-left w-12">
                                <Checkbox
                                    checked={allSelected}
                                    onCheckedChange={handleSelectAll}
                                    aria-label="Select all"
                                    className={someSelected ? "data-[state=checked]:bg-primary/50" : ""}
                                />
                            </th>
                            <th className="p-3 text-left font-semibold text-xs uppercase text-muted-foreground w-12">
                                #
                            </th>
                            {displayKeys.slice(0, 5).map(key => (
                                <th key={key} className="p-3 text-left font-semibold text-xs uppercase text-muted-foreground">
                                    {key}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {records.map((record, index) => {
                            const isSelected = selectedIndices.includes(index);
                            const revNum = record.Revision !== undefined ? String(record.Revision) : null;

                            return (
                                <tr
                                    key={index}
                                    className={`hover:bg-muted/30 transition-colors cursor-pointer ${isSelected ? 'bg-primary/5' : ''
                                        }`}
                                    onClick={() => handleSelectRow(index)}
                                >
                                    <td className="p-3" onClick={(e) => e.stopPropagation()}>
                                        <Checkbox
                                            checked={isSelected}
                                            onCheckedChange={() => handleSelectRow(index)}
                                            aria-label={`Select row ${index + 1}`}
                                        />
                                    </td>
                                    <td className="p-3 text-muted-foreground font-mono text-xs">
                                        {index + 1}
                                    </td>
                                    {displayKeys.slice(0, 5).map(key => {
                                        const value = record[key as keyof ExcelRecord];

                                        if (key === 'Revision' && revNum !== null) {
                                            return (
                                                <td key={key} className="p-3">
                                                    <Badge variant="secondary" className="font-mono">
                                                        Rev {revNum}
                                                    </Badge>
                                                </td>
                                            );
                                        }

                                        return (
                                            <td key={key} className="p-3 max-w-xs truncate" title={String(value || '')}>
                                                {value !== undefined && value !== null ? String(value) : '-'}
                                            </td>
                                        );
                                    })}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            <div className="p-3 bg-muted/30 border-t flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                    {someSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                    <span>
                        {selectedIndices.length} of {records.length} selected
                    </span>
                </div>
                {selectedIndices.length > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelectionChange([])}
                        className="h-7 text-xs"
                    >
                        Clear selection
                    </Button>
                )}
            </div>
        </div>
    );
}
