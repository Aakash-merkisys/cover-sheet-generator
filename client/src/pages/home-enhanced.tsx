import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateCoversheets } from "@/hooks/use-generate";
import { useExcelParser } from "@/hooks/use-excel-parser";
import { UploadArea } from "@/components/upload-area";
import { ExcelPreview } from "@/components/excel-preview";
import { StepIndicator } from "@/components/step-indicator";
import { ExcelFormatGuide } from "@/components/excel-format-guide";
import { TemplateModal } from "@/components/template-modal";
import { ProgressIndicator } from "@/components/progress-indicator";
import { DownloadSection } from "@/components/download-section";
import { useToast } from "@/hooks/use-toast";
import { Layers, Sparkles, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
    { number: 1, title: "Upload Excel" },
    { number: 2, title: "Generate Coversheets" },
    { number: 3, title: "Download ZIP" },
];

export default function HomeEnhanced() {
    const [file, setFile] = useState<File | null>(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const { toast } = useToast();

    const { parsedData, isLoading: isParsing, error: parseError, parseFile, reset: resetParser } = useExcelParser();

    const {
        mutate: generate,
        isPending: isGenerating,
        data: generatedData,
        reset: resetGeneration,
        error: generateError
    } = useGenerateCoversheets();

    // Parse file when uploaded
    useEffect(() => {
        parseFile(file);
    }, [file, parseFile]);

    // Update step based on state
    useEffect(() => {
        if (generatedData) {
            setCurrentStep(3);
        } else if (file && parsedData) {
            setCurrentStep(2);
        } else {
            setCurrentStep(1);
        }
    }, [file, parsedData, generatedData]);

    // Simulate progress during generation
    useEffect(() => {
        if (isGenerating) {
            const total = parsedData?.recordCount || 5;
            setProgress({ current: 0, total });

            const interval = setInterval(() => {
                setProgress(prev => {
                    if (prev.current < prev.total) {
                        return { ...prev, current: prev.current + 1 };
                    }
                    return prev;
                });
            }, 150);

            return () => clearInterval(interval);
        } else {
            setProgress({ current: 0, total: 0 });
        }
    }, [isGenerating, parsedData]);

    const handleFileChange = (newFile: File | null) => {
        setFile(newFile);
        if (!newFile) {
            resetParser();
        }
    };

    const handleGenerate = () => {
        if (parseError) {
            toast({
                title: "Invalid File",
                description: parseError,
                variant: "destructive"
            });
            return;
        }

        generate(file, {
            onError: (err) => {
                toast({
                    title: "Generation Failed",
                    description: err.message,
                    variant: "destructive"
                });
            },
            onSuccess: () => {
                toast({
                    title: "Success!",
                    description: "Coversheets generated successfully",
                });
            }
        });
    };

    const handleReset = () => {
        resetGeneration();
        resetParser();
        setFile(null);
        setCurrentStep(1);
        setProgress({ current: 0, total: 0 });
    };

    const canGenerate = !isGenerating && !isParsing && (!file || (parsedData && parsedData.recordCount > 0));

    return (
        <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-background bg-grid-pattern">
            {/* Decorative background */}
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

            <main className="relative z-10 w-full max-w-[620px]">
                {/* Header */}
                <div className="text-center mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-lg border border-border mb-6"
                    >
                        <Layers className="w-8 h-8 text-primary" />
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
                        className="font-display text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-3"
                    >
                        Coversheet <span className="text-muted-foreground">Generator</span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-base text-muted-foreground max-w-md mx-auto leading-relaxed"
                    >
                        Professional document automation tool for generating beautifully formatted coversheets
                    </motion.p>
                </div>

                {/* Main Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                    className="glass-card rounded-3xl p-6 md:p-8 shadow-2xl"
                >
                    {/* Step Indicator */}
                    <StepIndicator currentStep={currentStep} steps={STEPS} />

                    <AnimatePresence mode="wait">
                        {isGenerating ? (
                            <motion.div
                                key="generating"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                            >
                                <ProgressIndicator
                                    current={progress.current}
                                    total={progress.total}
                                />
                            </motion.div>

                        ) : generatedData ? (
                            <motion.div
                                key="success"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.3 }}
                            >
                                <DownloadSection
                                    downloadUrl={generatedData.downloadUrl}
                                    count={generatedData.count}
                                    onReset={handleReset}
                                />
                            </motion.div>

                        ) : (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.25 }}
                                className="space-y-6"
                            >
                                {(generateError || parseError) && (
                                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start space-x-3">
                                        <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                                        <p className="text-sm font-medium text-destructive leading-snug">
                                            {generateError?.message || parseError}
                                        </p>
                                    </div>
                                )}

                                {/* Template Preview */}
                                <TemplateModal />

                                {/* Upload Section */}
                                <UploadArea
                                    file={file}
                                    onFileChange={handleFileChange}
                                    recordCount={parsedData?.recordCount ?? null}
                                    disabled={isGenerating || isParsing}
                                />

                                {/* Loading state while parsing */}
                                {isParsing && (
                                    <div className="flex items-center justify-center gap-2 p-4 bg-secondary/50 rounded-lg">
                                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                        <span className="text-sm text-muted-foreground">
                                            Analyzing Excel file...
                                        </span>
                                    </div>
                                )}

                                {/* Excel Preview */}
                                {parsedData && parsedData.records.length > 0 && (
                                    <ExcelPreview data={parsedData.records} />
                                )}

                                {/* Excel Format Guide */}
                                {!file && <ExcelFormatGuide />}

                                {/* Generate Button */}
                                <div className="pt-4 border-t border-border">
                                    <Button
                                        onClick={handleGenerate}
                                        disabled={!canGenerate}
                                        size="lg"
                                        className="w-full text-base h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate Coversheets
                                                {parsedData && ` (${parsedData.recordCount})`}
                                            </>
                                        )}
                                    </Button>
                                    {file && parsedData && (
                                        <p className="text-xs text-center text-muted-foreground mt-2">
                                            {parsedData.recordCount} {parsedData.recordCount === 1 ? 'document' : 'documents'} will be generated
                                        </p>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-muted-foreground mt-6"
                >
                    Supports .xlsx files • Secure processing • Instant download
                </motion.p>
            </main>
        </div>
    );
}
