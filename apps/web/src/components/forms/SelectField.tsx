"use client";

import { FormDescription, FormItem, FormLabel } from "@atl/ui/components/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atl/ui/components/select";
import { memo } from "react";
import { useFormContext } from "react-hook-form";

import { cn } from "@/lib/utils";

interface SelectFieldProps {
  className?: string;
  description?: string;
  disabled?: boolean;
  label: string;
  name: string;
  options: string[];
  placeholder?: string;
  required?: boolean;
}

// Using memo to prevent unnecessary re-renders
const SelectField = memo(function SelectField({
  name,
  label,
  description,
  options,
  placeholder = "Select an option",
  disabled,
  required = false,
  className,
}: SelectFieldProps) {
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();

  // Ensure value is always a string
  const value = watch(name) || "";

  // Check if this field has an error
  const hasError = !!errors[name];
  // Always use a clean error message for select fields rather than showing the enum error
  const errorMessage = hasError ? "Please select an option" : "";

  return (
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
      {/* Hidden input to prevent autocomplete */}
      <input autoComplete="off" type="hidden" />
      <Select
        disabled={disabled}
        onValueChange={(newValue) => {
          setValue(name, newValue, {
            shouldValidate: false, // Don't validate immediately on selection
            shouldDirty: true,
            shouldTouch: true,
          });
        }}
        value={value}
      >
        <SelectTrigger
          className={cn(
            "w-full",
            hasError && "border-red-500 focus:ring-red-500"
          )}
        >
          <SelectValue className="" placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="">
          {options.map((option) => (
            <SelectItem className="" key={option} value={option}>
              {option}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Add direct error display that will always show */}
      {hasError && (
        <p className="mt-1 font-medium text-red-400 text-sm">{errorMessage}</p>
      )}
    </FormItem>
  );
});

export default SelectField;