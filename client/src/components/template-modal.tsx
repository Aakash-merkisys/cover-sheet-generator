import { useState } from "react";
import { FileText, ExternalLink, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

export function TemplateModal() {
    const [isLoading, setIsLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);

    const handleOpenTemplate = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/template-preview");
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setPdfUrl(url);
        } catch (error) {
            console.error("Failed to load template:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open && pdfUrl) {
            URL.revokeObjectURL(pdfUrl);
            setPdfUrl(null);
        }
    };

    return (
        <Dialog onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <div className="bg-secondary/50 rounded-xl p-4 cursor-pointer hover:bg-secondary/70 transition-colors">
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
                            onClick={handleOpenTemplate}
                            className="shrink-0"
                        >
                            View Template
                            <ExternalLink className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-primary" />
                        Coversheet Template Preview
                    </DialogTitle>
                    <DialogDescription>
                        This is how your generated coversheets will look with your data
                    </DialogDescription>
                </DialogHeader>
                <div className="flex-1 overflow-hidden rounded-lg border border-border bg-secondary/20">
                    {isLoading ? (
                        <div className="h-full flex items-center justify-center">
                            <div className="text-center">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
                                <p className="text-sm text-muted-foreground">Loading template...</p>
                            </div>
                        </div>
                    ) : pdfUrl ? (
                        <iframe
                            src={pdfUrl}
                            className="w-full h-full"
                            title="Template Preview"
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center">
                            <p className="text-sm text-muted-foreground">
                                Click "View Template" to load preview
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
