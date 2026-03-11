import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { GitBranch, FileStack } from "lucide-react";

interface RevisionModeSelectorProps {
    revisionMode: 'all' | 'latest';
    onRevisionModeChange: (mode: 'all' | 'latest') => void;
    hasRevisions: boolean;
}

export function RevisionModeSelector({
    revisionMode,
    onRevisionModeChange,
    hasRevisions
}: RevisionModeSelectorProps) {
    if (!hasRevisions) {
        return null;
    }

    return (
        <div className="space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
                <GitBranch className="w-4 h-4 text-blue-600" />
                <Label className="text-sm font-semibold text-blue-900">
                    Revision Mode
                </Label>
                <Badge variant="secondary" className="text-xs">
                    Multiple revisions detected
                </Badge>
            </div>

            <RadioGroup value={revisionMode} onValueChange={onRevisionModeChange as any}>
                <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-blue-100/50 transition-colors">
                    <RadioGroupItem value="latest" id="latest" className="mt-0.5" />
                    <div className="flex-1">
                        <Label htmlFor="latest" className="font-medium cursor-pointer">
                            Latest Revision Only
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            Generate coversheets only for the highest revision number of each document
                        </p>
                    </div>
                </div>

                <div className="flex items-start space-x-3 p-3 rounded-md hover:bg-blue-100/50 transition-colors">
                    <RadioGroupItem value="all" id="all" className="mt-0.5" />
                    <div className="flex-1">
                        <Label htmlFor="all" className="font-medium cursor-pointer">
                            All Revisions
                        </Label>
                        <p className="text-xs text-muted-foreground mt-1">
                            Generate coversheets for all selected revisions
                        </p>
                    </div>
                </div>
            </RadioGroup>
        </div>
    );
}
