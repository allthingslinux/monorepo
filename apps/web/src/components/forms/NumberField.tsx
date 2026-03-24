"use client";

import { FormDescription, FormItem, FormLabel } from "@atl/ui/components/form";
import { Input } from "@atl/ui/components/input";
import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";

export interface NumberFieldProps {
  className?: string;
  description?: string;
  disabled?: boolean;
  label: string;
  max?: number;
  min?: number;
  name: string;
  placeholder?: string;
  required?: boolean;
  step?: number;
}

const NumberField = memo(function NumberField({
  name,
  label,
  description,
  placeholder,
  disabled,
  required = false,
  min,
  max,
  step = 1,
  className,
}: NumberFieldProps) {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  // Check if this field has an error
  const hasError = !!errors[name];
  const errorMessage = hasError
    ? String(errors[name]?.message || "Please enter a valid number")
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
                "after:ml-0.5 after:font-bold after:text-destructive after:content-['*']",
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
            autoComplete="off"
            className={cn(
              "bg-transparent dark:bg-input/30",
              hasError && "border-destructive focus:ring-destructive"
            )}
            disabled={disabled}
            max={max}
            min={min}
            name={field.name}
            onBlur={field.onBlur}
            onChange={(e) => {
              // For number inputs, we need to convert the string value to a number
              const value =
                e.target.value === "" ? "" : Number.parseFloat(e.target.value);
              field.onChange(value);
              // React Hook Form will handle validation automatically in onChange mode
            }}
            placeholder={placeholder}
            ref={field.ref}
            step={step}
            type="number"
            // Use value directly but ensure it's a string for the input
            value={
              field.value === undefined || field.value === null
                ? ""
                : field.value
            }
          />

          {/* Add direct error display that will always show */}
          {hasError && (
            <p className="mt-1 font-medium text-destructive text-sm">
              {errorMessage}
            </p>
          )}
        </FormItem>
      )}
    />
  );
});

export default NumberField;