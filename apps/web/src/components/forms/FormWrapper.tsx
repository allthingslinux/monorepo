"use client";

import { Alert, AlertDescription } from "@atl/ui/components/alert";
import { Button } from "@atl/ui/components/button";
import { Form } from "@atl/ui/components/form";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";
import type { UseFormReturn } from "react-hook-form";
import { useFormContext } from "react-hook-form";

import { shouldShowQuestion } from "@/components/apply/StepperForm";
import type { FormQuestion } from "@/types";

import DigitsOnlyField from "./DigitsOnlyField";
import InputField from "./InputField";
import NumberField from "./NumberField";
import SelectField from "./SelectField";
import TextareaField from "./TextareaField";

interface FormWrapperProps {
  className?: string;
  description?: string;
  error?: string;
  form?: UseFormReturn<Record<string, unknown>>; // Replace any with more specific type
  hideSubmitButton?: boolean;
  isSubmitting?: boolean;
  onSubmit: (values: Record<string, unknown>) => Promise<void>;
  questions: FormQuestion[];
  submitText?: string;
  title: string;
}

export default function FormWrapper({
  form: formProp,
  questions,
  onSubmit,
  title,
  description,
  submitText = "Submit Application",
  isSubmitting = false,
  error,
  className = "space-y-6 max-w-2xl mx-auto p-4",
  hideSubmitButton = false,
}: FormWrapperProps) {
  // Try to get form from context, otherwise use the provided form prop
  const formContext = useFormContext();
  const form = formProp || formContext;

  // Filter questions to only show ones that satisfy their conditions
  const visibleQuestions = useMemo(() => {
    // Move formValues inside useMemo to fix exhaustive deps warning
    const formValues = form?.watch() || {};
    return questions.filter((q) => shouldShowQuestion(q, formValues));
  }, [form, questions]);

  if (!form) {
    console.error("Form is required. Provide it as a prop or via FormProvider");
    return null;
  }

  return (
    <Form {...form}>
      <form className={className} onSubmit={form.handleSubmit(onSubmit)}>
        <div className="space-y-2">
          <h2 className="font-semibold text-2xl">{title}</h2>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
        </div>

        {/* Only show error alert if explicitly provided and not empty */}
        {error && error.length > 0 && (
          <Alert className="mt-4" variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-8">
          {visibleQuestions.map((q) => {
            const commonProps = {
              description: q.description,
              disabled: isSubmitting,
              label: q.question,
              name: q.name,
              required: !q.optional,
            };

            switch (q.type) {
              case "short": {
                return (
                  <InputField
                    key={q.name}
                    {...commonProps}
                    type={q.inputType || "text"}
                  />
                );
              }

              case "paragraph": {
                return (
                  <TextareaField
                    key={q.name}
                    {...commonProps}
                    rows={q.rows || 4}
                  />
                );
              }

              case "select": {
                return (
                  <SelectField
                    key={q.name}
                    {...commonProps}
                    options={q.options || []}
                  />
                );
              }

              case "number": {
                return (
                  <NumberField
                    key={q.name}
                    {...commonProps}
                    max={q.max}
                    min={q.min}
                    step={q.step}
                  />
                );
              }

              case "digits-only": {
                return (
                  <DigitsOnlyField
                    key={q.name}
                    {...commonProps}
                    maxLength={q.maxLength}
                    minLength={q.minLength}
                    placeholder={q.placeholder}
                  />
                );
              }

              default: {
                return null;
              }
            }
          })}
        </div>

        {!hideSubmitButton && (
          <div className="mt-8 flex justify-end">
            <Button
              className="w-full min-w-[200px] md:w-auto"
              disabled={isSubmitting}
              size="lg"
              type="submit"
            >
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {submitText}
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}