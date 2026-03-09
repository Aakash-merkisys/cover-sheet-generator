import { FileText, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function TemplatePreview() {
    const handleViewTemplate = () => {
        // This will open the template in a modal or new tab
        window.open("/api/template-preview", "_blank");
    };

    return (
        <div className="bg-secondary/50 rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">
                            Coversheet Template
                        </h4>
                        <p className="text-xs text-muted-foreground">
                            Preview the document format
                        </p>
                    </div>
                </div>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleViewTemplate}
                    className="shrink-0"
                >
                    View Template
                    <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
            </div>
        </div>
    );
}
