import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
    number: number;
    title: string;
}

interface StepIndicatorProps {
    currentStep: number;
    steps: Step[];
}

export function StepIndicator({ currentStep, steps }: StepIndicatorProps) {
    return (
        <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
                <div key={step.number} className="flex items-center flex-1">
                    <div className="flex flex-col items-center flex-1">
                        <div
                            className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                                currentStep > step.number
                                    ? "bg-primary text-primary-foreground shadow-md"
                                    : currentStep === step.number
                                        ? "bg-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg scale-110"
                                        : "bg-secondary text-muted-foreground"
                            )}
                        >
                            {currentStep > step.number ? (
                                <Check className="w-5 h-5" />
                            ) : (
                                step.number
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-xs font-medium mt-2 text-center transition-all duration-300",
                                currentStep === step.number && "font-bold scale-105",
                                currentStep >= step.number
                                    ? "text-foreground"
                                    : "text-muted-foreground"
                            )}
                        >
                            {step.title}
                        </span>
                    </div>
                    {index < steps.length - 1 && (
                        <div
                            className={cn(
                                "h-0.5 flex-1 mx-2 transition-all duration-500",
                                currentStep > step.number
                                    ? "bg-primary shadow-sm"
                                    : "bg-secondary"
                            )}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
