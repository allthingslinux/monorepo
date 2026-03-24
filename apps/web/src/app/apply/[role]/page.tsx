"use client";

import { Badge } from "@atl/ui/ui/badge";
import { Button } from "@atl/ui/ui/button";
import { Card, CardContent } from "@atl/ui/ui/card";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useState } from "react";
import type { z } from "zod";

import StepperForm from "@/components/multi-step-form/StepperForm";
import { generalQuestions } from "@/data/forms/questions/general";
import { roles } from "@/data/forms/roles";
import { generateFormSchema } from "@/lib/utils";

export default function RoleApplicationPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const params = useParams();
  const roleSlug = params.role as string;
  const role = roles.find((r) => r.slug === roleSlug);

  if (!role) {
    notFound();
  }

  // All questions for validation and submission
  const allQuestions = [...generalQuestions, ...role.questions];

  // Create our schema
  const _formSchema = generateFormSchema(allQuestions);

  const onSubmit = async (data: z.infer<typeof _formSchema>) => {
    try {
      console.log("Form data before submission:", data);

      // Ensure role is still available (edge case protection)
      if (!role) {
        console.error("Role not found during form submission");
        return;
      }

      // Create FormData instance
      const formData = new FormData();

      // Add all form fields to FormData
      Object.entries(data).forEach(([key, value]) => {
        console.log(
          `Processing field: ${key} = ${value} (type: ${typeof value})`
        );
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value === null || value === undefined) {
          // Skip null or undefined values
          console.log(`Skipping null/undefined field: ${key}`);
        } else if (typeof value === "object") {
          // Convert objects to JSON strings
          console.log(`Converting object to JSON for field: ${key}`, value);
          formData.append(key, JSON.stringify(value));
        } else {
          // Convert primitives to strings
          formData.append(key, String(value));
        }
      });

      console.log(`Submitting application for role: ${role.slug}`);

      // Use relative URL instead of absolute for better compatibility with Workers
      const response = await fetch(`/api/forms/${role.slug}`, {
        method: "POST",
        body: formData,
      });

      console.log(`Response status: ${response.status}`);

      if (response.ok) {
        setIsSubmitted(true);
        // Ensure scroll to top happens after state update
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }, 10);
      } else {
        // Safely get error data from response
        let errorMessage = response.statusText || "Unknown error";
        let errorDetails = null;

        try {
          // Only try to parse JSON if content-type is application/json
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = (await response.json()) as Record<
              string,
              unknown
            >;
            errorDetails = errorData;
            if (errorData && typeof errorData.error === "string") {
              errorMessage = errorData.error;
            } else if (errorData && typeof errorData.details === "string") {
              errorMessage = errorData.details;
            }
          } else {
            // Try to get text response if not JSON
            errorMessage = await response.text();
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError);
        }

        // Log the error safely
        console.error("Form submission failed:", errorMessage);
        if (errorDetails) {
          console.error("Error details:", errorDetails);
        }

        // Show user-friendly error message and scroll to it
        alert(
          `There was an error submitting your application: ${errorMessage}. Please try again later.`
        );

        // Scroll to top to ensure error alert is visible
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      // Handle network or other errors
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.error("Error submitting form:", errorMessage);

      // Show alert and scroll to top
      alert(
        "There was an error submitting your application. Please check your network connection and try again."
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isSubmitted) {
    return (
      <div className="mx-auto py-32">
        <div className="grid grid-cols-1 justify-items-center gap-6">
          <div className="flex w-full max-w-[800px] flex-col items-center justify-center px-4 py-12 text-center">
            <div className="mb-6 rounded-xl bg-card p-6">
              <svg
                className="mx-auto h-12 w-12 text-green-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 13l4 4L19 7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>

            <h1 className="mb-4 font-bold text-3xl">Application Submitted!</h1>
            <p className="mb-8 max-w-md text-muted-foreground text-xl">
              Thank you for your application. We'll review it and get back to
              you soon.
            </p>

            <Link
              className="inline-flex items-center rounded-md border border-transparent bg-green-600 px-4 py-2 font-medium text-primary-foreground text-sm shadow-sm hover:bg-green-700"
              href="/"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto py-22">
      {/* Center all content */}
      <div className="grid grid-cols-1 justify-items-center gap-6">
        {/* Centered header with consistent width */}
        <div className="w-full max-w-[800px]">
          {/* Back button */}
          <div className="mb-6">
            <Link href="/apply" passHref>
              <Button
                className="group text-muted-foreground hover:text-foreground"
                size="sm"
                variant="ghost"
              >
                <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                Back to Roles
              </Button>
            </Link>
          </div>

          <div className="mb-4 flex flex-col items-center text-center">
            <Badge className="mb-4 px-3 py-1 text-xs" variant="outline">
              {role.department}
            </Badge>
            <h1 className="font-bold text-3xl">Apply for {role.name}</h1>
          </div>

          {/* Description card with same width as header */}
          <Card className="w-full border-muted bg-muted/30">
            <CardContent className="pt-6">
              <div className="flex items-start gap-2">
                <div className="h-full w-1 self-stretch rounded-full bg-primary" />
                <p className="text-muted-foreground">{role.description}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Form with same max-width */}
        <div className="w-full max-w-[800px]">
          <StepperForm
            departmentalQuestions={role.questions}
            generalQuestions={generalQuestions}
            onSubmitAction={onSubmit}
            role={role}
            roleQuestions={[]}
          />
        </div>
      </div>
    </div>
  );
}