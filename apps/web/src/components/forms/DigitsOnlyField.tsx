"use client";

import { FormDescription, FormItem, FormLabel } from "@atl/ui/components/form";
import { Input } from "@atl/ui/components/input";
import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";

export interface DigitsOnlyFieldProps {
  className?: string;
  description?: string;
  disabled?: boolean;
  label: string;
  maxLength?: number;
  minLength?: number;
  name: string;
  placeholder?: string;
  required?: boolean;
}

const DigitsOnlyField = memo(function DigitsOnlyField({
  name,
  label,
  description,
  placeholder,
  disabled,
  required = false,
  minLength,
  maxLength,
  className,
}: DigitsOnlyFieldProps) {
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
          <Input
            autoComplete="new-password"
            className={cn(
              "bg-transparent dark:bg-input/30",
              hasError && "border-red-500 focus:ring-red-500"
            )}
            disabled={disabled}
            inputMode="numeric"
            maxLength={maxLength}
            minLength={minLength}
            name={field.name}
            onBlur={field.onBlur}
            onChange={(e) => {
              // Only allow digits
              const value = e.target.value.replaceAll(/\D/g, "");
              field.onChange(value);
              // React Hook Form will handle validation automatically in onChange mode
            }}
            pattern="[0-9]*"
            placeholder={placeholder}
            ref={field.ref}
            type="text"
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

export default DigitsOnlyField;