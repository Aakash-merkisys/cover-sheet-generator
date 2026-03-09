import { motion } from "framer-motion";
import { Download, CheckCircle2, Sparkles, Package } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DownloadSectionProps {
    downloadUrl: string;
    count: number;
    onReset: () => void;
}

export function DownloadSection({ downloadUrl, count, onReset }: DownloadSectionProps) {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", bounce: 0.4 }}
            className="text-center py-8"
        >
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: "spring", bounce: 0.5 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-green-100 to-green-50 text-green-600 mb-6 shadow-lg shadow-green-100"
            >
                <CheckCircle2 className="w-10 h-10" />
            </motion.div>

            <motion.h3
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl font-bold font-display text-foreground mb-2"
            >
                Generation Complete!
            </motion.h3>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-center justify-center gap-2 mb-6"
            >
                <Package className="w-5 h-5 text-primary" />
                <p className="text-lg text-muted-foreground">
                    <span className="font-bold text-foreground">{count}</span> {count === 1 ? 'coversheet' : 'coversheets'} ready for download
                </p>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="space-y-3"
            >
                <Button
                    asChild
                    size="lg"
                    className="w-full text-base h-14 shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 group"
                >
                    <a href={downloadUrl} download>
                        <Download className="w-5 h-5 mr-2 group-hover:animate-bounce" />
                        Download Coversheets ZIP
                    </a>
                </Button>

                <Button
                    onClick={onReset}
                    variant="outline"
                    size="lg"
                    className="w-full text-base h-12"
                >
                    <Sparkles className="w-5 h-5 mr-2" />
                    Generate Another Batch
                </Button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-xs text-muted-foreground mt-6"
            >
                Your ZIP file contains all generated PDF coversheets
            </motion.p>
        </motion.div>
    );
}
