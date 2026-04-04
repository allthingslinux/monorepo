"use client";

import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { FormDescription, FormItem, FormLabel } from "@atl/ui/components/form";
import { Textarea } from "@atl/ui/components/textarea";

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
              "text-base font-medium",
              required &&
                "after:ml-0.5 after:font-bold after:text-red-500 after:content-['*']",
              !required &&
                "after:text-muted-foreground after:ml-1.5 after:text-xs after:font-normal after:content-['(optional)']"
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
            <p className="mt-1 text-sm font-medium text-red-400">
              {errorMessage}
            </p>
          )}
        </FormItem>
      )}
    />
  );
});

export default TextareaField;
