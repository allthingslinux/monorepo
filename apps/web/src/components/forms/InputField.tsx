"use client";

import { memo } from "react";
import { Controller, useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";
import { FormDescription, FormItem, FormLabel } from "@atl/ui/components/form";
import { Input } from "@atl/ui/components/input";

export interface InputProps {
  className?: string;
  description?: string;
  disabled?: boolean;
  label: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url" | "password";
}

const InputField = memo(function InputField({
  name,
  label,
  type = "text",
  description,
  placeholder,
  disabled,
  required = false,
  className,
}: InputProps) {
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
          <Input
            autoComplete="new-password"
            className={cn(
              "dark:bg-input/30 bg-transparent",
              hasError && "border-red-500 focus:ring-red-500"
            )}
            data-lpignore="true"
            disabled={disabled}
            name={field.name}
            onBlur={field.onBlur}
            onChange={(e) => {
              field.onChange(e);
              // React Hook Form will handle validation automatically in onChange mode
            }}
            placeholder={placeholder}
            ref={field.ref}
            type={type}
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

export default InputField;
