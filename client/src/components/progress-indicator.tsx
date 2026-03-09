import { Loader2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface ProgressIndicatorProps {
    current: number;
    total: number;
}

export function ProgressIndicator({ current, total }: ProgressIndicatorProps) {
    const percentage = total > 0 ? Math.round((current / total) * 100) : 0;

    return (
        <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-8">
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-xl animate-pulse" />
                <Loader2 className="relative w-14 h-14 text-primary animate-spin" />
            </div>

            <h3 className="text-2xl font-bold font-display text-foreground mb-3">
                Generating Coversheets
            </h3>

            <div className="w-full max-w-xs space-y-3">
                <Progress value={percentage} className="h-2" />
                <p className="text-sm font-medium text-muted-foreground">
                    {current} / {total} completed
                </p>
            </div>

            <p className="text-muted-foreground text-sm max-w-[280px] leading-relaxed mt-4">
                Processing your data and generating documents. This may take a moment...
            </p>
        </div>
    );
}
