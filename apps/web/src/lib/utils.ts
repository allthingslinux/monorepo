import { z } from "zod";

import { env } from "@/env";
import type { FormQuestion, Role } from "@/types";

/** Same `cn` as `@atl/ui` — single implementation for the monorepo. */
export { cn } from "@atl/ui/lib/utils";

function schemaShortParagraph(
  curr: FormQuestion,
  isOtherField: boolean,
  isConditional: boolean
): z.ZodTypeAny {
  if (isOtherField && isConditional) {
    return z.string().optional();
  }
  return curr.optional || isConditional
    ? z.string().optional()
    : z.string().min(1, { message: "This field is required" });
}

function schemaDigitsOnly(
  curr: FormQuestion,
  isConditional: boolean
): z.ZodTypeAny {
  let digitsSchema = z.string().regex(/^\d*$/, {
    message: "Only numeric digits (0-9) are allowed",
  });

  if (typeof curr.minLength === "number") {
    digitsSchema = digitsSchema.min(curr.minLength, {
      message: `Must be at least ${curr.minLength} digits`,
    });
  }

  if (typeof curr.maxLength === "number") {
    digitsSchema = digitsSchema.max(curr.maxLength, {
      message: `Must be at most ${curr.maxLength} digits`,
    });
  }

  return curr.optional || isConditional
    ? digitsSchema.optional()
    : digitsSchema.min(1, { message: "This field is required" });
}

function schemaNumber(
  curr: FormQuestion,
  isConditional: boolean
): z.ZodTypeAny {
  let numberSchema = z.coerce.number();

  if (typeof curr.min === "number") {
    numberSchema = numberSchema.min(curr.min, {
      message: `Value must be at least ${curr.min}`,
    });
  }

  if (typeof curr.max === "number") {
    numberSchema = numberSchema.max(curr.max, {
      message: `Value must be at most ${curr.max}`,
    });
  }

  return curr.optional || isConditional
    ? numberSchema.optional()
    : numberSchema;
}

function schemaSelect(
  curr: FormQuestion,
  isConditional: boolean
): z.ZodTypeAny {
  const selectOptions = curr.options as [string, ...string[]];

  const selectSchema = z
    .union([
      z.enum(selectOptions),
      z.literal(""),
      z.array(z.string()).transform(() => ""),
      z.any().transform((val) => {
        console.warn(
          `Field ${curr.name} received unexpected value:`,
          val,
          typeof val
        );
        return "";
      }),
    ])
    .transform((val) => {
      if (typeof val !== "string") {
        console.warn(
          `Field ${curr.name} transformed non-string to empty string:`,
          val
        );
        return "";
      }
      return val;
    });

  return curr.optional || isConditional
    ? selectSchema.optional()
    : selectSchema.refine((val) => val && val.length > 0, {
        message: "Please select an option",
      });
}

function addQuestionSchema(
  acc: Record<string, z.ZodTypeAny>,
  curr: FormQuestion
): void {
  const isOtherField = curr.name.endsWith("_other");
  const isConditional = !!curr.showIf;

  switch (curr.type) {
    case "short":
    case "paragraph": {
      acc[curr.name] = schemaShortParagraph(curr, isOtherField, isConditional);
      break;
    }
    case "digits-only": {
      acc[curr.name] = schemaDigitsOnly(curr, isConditional);
      break;
    }
    case "number": {
      acc[curr.name] = schemaNumber(curr, isConditional);
      break;
    }
    case "select": {
      acc[curr.name] = schemaSelect(curr, isConditional);
      break;
    }
    default: {
      acc[curr.name] = z.string().optional();
    }
  }
}

export const generateFormSchema = (questions: FormQuestion[]) => {
  const acc: Record<string, z.ZodTypeAny> = {};
  for (const curr of questions) {
    addQuestionSchema(acc, curr);
  }
  return z.object(acc);
};

// Helper function to organize roles by department
export function getRolesByDepartment(roles: Role[]): Record<string, Role[]> {
  const acc: Record<string, Role[]> = {};
  for (const role of roles) {
    if (!acc[role.department]) {
      acc[role.department] = [];
    }
    acc[role.department].push(role);
  }
  return acc;
}

/**
 * Generates absolute URLs for the application.
 * - In development: uses localhost:3000
 * - In production: uses NEXT_PUBLIC_APP_URL env var or falls back to allthingslinux.org
 */
export function getBaseUrl(): string {
  // Check if we're running on the server and in development mode
  if (typeof window === "undefined" && env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Check if window is available (client side)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // In production server-side rendering, use the environment variable or fallback
  return env.NEXT_PUBLIC_URL;
}

/**
 * Creates URLs for the API with correct absolute paths and cache busting in development
 */
export function getApiUrl(path: string): string {
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  // Add cache busting in development mode
  if (env.NODE_ENV === "development") {
    const cacheBuster = `_cb=${Date.now()}`;
    return url.includes("?")
      ? `${url}&${cacheBuster}`
      : `${url}?${cacheBuster}`;
  }

  return url;
}

/**
 * Format currency amount as USD
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    currency: "USD",
    style: "currency",
  }).format(amount);
}

/**
 * Format date string to readable format
 */
export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
