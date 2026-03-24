"use client";
import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { FormDescription, FormItem, FormLabel } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export interface TextareaProps {
  className?: string;
  description?: string;
  disabled?: boolean;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
}

const TextareaField = memo(function TextareaField({
  name,
  label,
  description,
  placeholder,
  disabled,
  required = false,
  rows = 4,
  className,
}: TextareaProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Check if this field has an error
  const hasError = !!errors[name];
  const errorMessage = hasError
    ? String(errors[name]?.message || "This field is required")
    : "";

  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel
            className={cn(
              "font-medium text-base",
              required &&
                "after:ml-0.5 after:font-bold after:text-red-500 after:content-['*']",
              !required &&
                "after:ml-1.5 after:font-normal after:text-muted-foreground after:text-xs after:content-['(optional)']"
            )}
          >
            {label}
          </FormLabel>
          {description && (
            <FormDescription className="mt-2">{description}</FormDescription>
          )}
          <Textarea
            autoComplete="new-password"
            className={cn(hasError && "border-red-500 focus:ring-red-500")}
            disabled={disabled}
            name={field.name}
            onBlur={field.onBlur}
            onChange={(e) => {
              field.onChange(e);
              // React Hook Form will handle validation automatically in onChange mode
            }}
            placeholder={placeholder || "Enter detailed answer..."}
            ref={field.ref}
            rows={rows}
            value={field.value || ""}
          />

          {/* Add direct error display that will always show */}
          {hasError && (
            <p className="mt-1 font-medium text-red-400 text-sm">
              {errorMessage}
            </p>
          )}
        </FormItem>
      )}
    />
  );
});

export default TextareaField;