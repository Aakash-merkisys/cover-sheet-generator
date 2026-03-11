import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, Loader2 } from "lucide-react";
import type { Template } from "@shared/schema";

interface TemplateSelectorProps {
    selectedTemplateId: string;
    onTemplateChange: (templateId: string) => void;
}

export function TemplateSelector({ selectedTemplateId, onTemplateChange }: TemplateSelectorProps) {
    const [templates, setTemplates] = useState<Template[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetch('/api/templates')
            .then(res => res.json())
            .then(data => {
                setTemplates(data);
                if (data.length > 0 && !selectedTemplateId) {
                    onTemplateChange(data[0].id);
                }
            })
            .catch(err => console.error('Failed to load templates:', err))
            .finally(() => setIsLoading(false));
    }, []);

    const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

    const handlePreview = () => {
        window.open(`/api/template-preview?templateId=${selectedTemplateId}`, '_blank');
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 p-4 bg-muted/30 rounded-lg">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Loading templates...</span>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label htmlFor="template-select" className="text-sm font-semibold">
                    Select Template
                </Label>
                {selectedTemplateId && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handlePreview}
                        className="h-8 text-xs"
                    >
                        <Eye className="w-3.5 h-3.5 mr-1.5" />
                        Preview
                    </Button>
                )}
            </div>

            <Select value={selectedTemplateId} onValueChange={onTemplateChange}>
                <SelectTrigger id="template-select" className="w-full">
                    <SelectValue placeholder="Choose a template" />
                </SelectTrigger>
                <SelectContent>
                    {templates.map(template => (
                        <SelectItem key={template.id} value={template.id}>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{template.name}</span>
                                <span className="text-xs text-muted-foreground">{template.customer}</span>
                            </div>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {selectedTemplate?.description && (
                <p className="text-xs text-muted-foreground">
                    {selectedTemplate.description}
                </p>
            )}
        </div>
    );
}
