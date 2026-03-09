import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useGenerateCoversheets } from "@/hooks/use-generate";
import { FileUpload } from "@/components/file-upload";
import { StepIndicator } from "@/components/step-indicator";
import { ExcelFormatGuide } from "@/components/excel-format-guide";
import { TemplatePreview } from "@/components/template-preview";
import { ProgressIndicator } from "@/components/progress-indicator";
import { useToast } from "@/hooks/use-toast";
import {
  Download,
  Layers,
  CheckCircle2,
  FileText,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";

const STEPS = [
  { number: 1, title: "Upload Excel" },
  { number: 2, title: "Generate Coversheets" },
  { number: 3, title: "Download ZIP" },
];

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const { toast } = useToast();

  const {
    mutate: generate,
    isPending,
    data,
    reset,
    error
  } = useGenerateCoversheets();

  useEffect(() => {
    if (file) {
      setCurrentStep(2);
    } else if (!isPending && !data) {
      setCurrentStep(1);
    }
  }, [file, isPending, data]);

  useEffect(() => {
    if (isPending) {
      // Simulate progress for demo purposes
      // In production, this would come from the backend
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev.total === 0) return { current: 0, total: 50 };
          if (prev.current < prev.total) {
            return { ...prev, current: prev.current + 1 };
          }
          return prev;
        });
      }, 100);
      return () => clearInterval(interval);
    } else {
      setProgress({ current: 0, total: 0 });
    }
  }, [isPending]);

  useEffect(() => {
    if (data) {
      setCurrentStep(3);
    }
  }, [data]);

  const handleGenerate = () => {
    generate(file, {
      onError: (err) => {
        toast({
          title: "Generation Failed",
          description: err.message,
          variant: "destructive"
        });
        setCurrentStep(2);
      }
    });
  };

  const handleReset = () => {
    reset();
    setFile(null);
    setCurrentStep(1);
    setProgress({ current: 0, total: 0 });
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 md:p-8 overflow-hidden bg-background bg-grid-pattern">
      {/* Decorative blurred blobs */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />

      <main className="relative z-10 w-full max-w-[600px]">
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center justify-center p-4 bg-white rounded-2xl shadow-sm border border-border mb-6"
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
            Transform your spreadsheet data into beautifully formatted document coversheets
          </motion.p>
        </div>

        {/* Main Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
          className="glass-card rounded-3xl p-6 md:p-8"
        >
          {/* Step Indicator */}
          <StepIndicator currentStep={currentStep} steps={STEPS} />

          <AnimatePresence mode="wait">
            {isPending ? (
              <motion.div
                key="loading"
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

            ) : data ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
                className="text-center py-6"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 text-green-600 mb-6"
                >
                  <CheckCircle2 className="w-10 h-10" />
                </motion.div>

                <h3 className="text-3xl font-bold font-display text-foreground mb-3 flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                  {data.count} Coversheets Generated
                </h3>
                <p className="text-muted-foreground text-base mb-8">
                  Your documents have been successfully generated and packaged into a secure ZIP archive.
                </p>

                <div className="space-y-3">
                  <Button
                    asChild
                    size="lg"
                    className="w-full text-base h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <a href={data.downloadUrl} download>
                      <Download className="w-5 h-5 mr-2" />
                      Download Coversheets ZIP
                    </a>
                  </Button>
                  <Button
                    onClick={handleReset}
                    variant="outline"
                    size="lg"
                    className="w-full text-base h-12"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Create Another Batch
                  </Button>
                </div>
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
                {error && (
                  <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 flex items-start space-x-3">
                    <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-destructive leading-snug">
                      {error.message}
                    </p>
                  </div>
                )}

                {/* Template Preview */}
                <TemplatePreview />

                {/* Upload Section */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-base font-semibold text-foreground flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary" />
                      Upload Data Source
                    </h3>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-secondary text-secondary-foreground">
                      Optional
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4">
                    Upload an Excel file with your data, or leave empty to test with sample records.
                  </p>
                  <FileUpload file={file} onFileChange={setFile} />
                </div>

                {/* Excel Format Guide */}
                <ExcelFormatGuide />

                {/* Generate Button */}
                <div className="pt-4 border-t border-border">
                  <Button
                    onClick={handleGenerate}
                    size="lg"
                    className="w-full text-base h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30"
                  >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Coversheets
                  </Button>
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
