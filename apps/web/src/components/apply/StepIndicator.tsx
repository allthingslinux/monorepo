"use client";

import { AlertTriangle, Check } from "lucide-react";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

// Define step IDs type
export type StepId = "general" | "role_specific";

// Basic Step interface
export interface Step {
  description?: string;
  id: StepId;
  title: string;
}

// Stepper methods interface
export interface StepperMethods {
  all: Step[];
  current: Step;
  goTo: (id: StepId) => void;
  next: () => void;
  prev: () => void;
}

// Props interface with proper typing
interface StepIndicatorProps {
  currentStep: Step;
  errorCounts?: Record<string, number>;
  errors?: Record<string, boolean>;
  onStepClick?: (stepId: StepId) => void;
  stepper: StepperMethods;
}

// Extracted step item component for better organization
function StepItem({
  step,
  index,
  isComplete,
  isCurrent,
  isUpcoming,
  hasError,
  errorCount,
  onClick,
}: {
  step: Step;
  index: number;
  isComplete: boolean;
  isCurrent: boolean;
  isUpcoming: boolean;
  hasError: boolean;
  errorCount: number;
  onClick: () => void;
}) {
  // Helper to determine border styles
  const borderStyles = cn(
    "group hover:border-primary flex cursor-pointer flex-col border-l-4 py-2 pl-4 transition-colors md:border-t-4 md:border-l-0 md:pt-4 md:pb-0 md:pl-0",
    {
      "border-border": isUpcoming && !hasError,
      "border-destructive": hasError,
      "border-primary": (isComplete || isCurrent) && !hasError,
    }
  );

  // Helper to determine step indicator styles
  const indicatorStyles = cn(
    "mr-2 flex h-6 w-6 items-center justify-center rounded-full",
    {
      "bg-destructive text-destructive-foreground": hasError,
      "bg-primary text-primary-foreground": isComplete && !hasError,
      "border-border text-muted-foreground border":
        isUpcoming && !isCurrent && !hasError,
      "border-primary text-primary border":
        isCurrent && !isComplete && !hasError,
    }
  );

  // Helper to determine title styles
  const titleStyles = cn("flex items-center", {
    "text-destructive": hasError,
    "text-muted-foreground": isUpcoming && !isCurrent && !hasError,
    "text-primary": (isComplete || isCurrent) && !hasError,
  });

  let stepGlyph: ReactNode;
  if (isComplete && !hasError) {
    stepGlyph = <Check aria-hidden="true" className="h-3 w-3" />;
  } else if (hasError) {
    stepGlyph = <AlertTriangle aria-hidden="true" className="h-3 w-3" />;
  } else {
    stepGlyph = <span>{index + 1}</span>;
  }

  return (
    <li className="md:flex-1" key={step.id}>
      <button
        className={cn(borderStyles, "w-full text-left")}
        onClick={onClick}
        type="button"
      >
        <span className="text-sm font-medium">
          <span className="flex items-center">
            <span className={indicatorStyles}>{stepGlyph}</span>
            <span className={titleStyles}>
              {step.title}
              {hasError && errorCount > 0 && (
                <span className="bg-destructive/10 text-destructive ml-2 inline-flex items-center rounded-full px-2 py-1 text-xs font-medium">
                  {errorCount} {errorCount === 1 ? "error" : "errors"}
                </span>
              )}
            </span>
          </span>
        </span>
        {step.description && (
          <span className="text-muted-foreground mt-0.5 text-sm">
            {step.description}
          </span>
        )}
      </button>
    </li>
  );
}

export default function StepIndicator({
  currentStep,
  stepper,
  errors = {},
  errorCounts = {},
  onStepClick,
}: StepIndicatorProps) {
  const allSteps = stepper.all;
  const currentIndex = allSteps.findIndex((step) => step.id === currentStep.id);

  return (
    <nav aria-label="Form Progress" className="mb-8">
      <ol className="space-y-4 md:flex md:space-y-0 md:space-x-8" role="list">
        {allSteps.map((step, index) => (
          <StepItem
            errorCount={errorCounts[step.id] || 0}
            hasError={!!errors[step.id]}
            index={index}
            isComplete={index < currentIndex}
            isCurrent={step.id === currentStep.id}
            isUpcoming={index > currentIndex}
            key={step.id}
            onClick={() => onStepClick?.(step.id)}
            step={step}
          />
        ))}
      </ol>
    </nav>
  );
}
