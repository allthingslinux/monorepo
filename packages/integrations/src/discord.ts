import { setTimeout as delay } from "node:timers/promises";

import type { FormData, Question, Role } from "./types";

/**
 * Sends application data to Discord webhook with retries
 */
export async function sendToDiscordWebhook(
  roleData: Role,
  formData: FormData,
  timestamp: string,
  webhookUrl: string,
  maxRetries = 3
): Promise<boolean> {
  try {
    // Use passed-in webhookUrl instead of process.env
    // const webhookUrl = process.env.DISCORD_WEBHOOK_URL;
    if (!webhookUrl) {
      console.log("Discord webhook URL not provided, skipping backup");
      return false;
    }

    // Track retries
    let retryCount = 0;
    let lastError: Error | null = null;

    // Retry loop
    while (retryCount <= maxRetries) {
      try {
        // Create a complete backup JSON file with all data
        const backupData = {
          application: {
            applicant: {
              discord_id: formData.discord_id,
              discord_username: formData.discord_username,
            },
            // Include all form data organized by questions
            generalAnswers: roleData.generalQuestions
              .filter((q: Question) => formData[q.name])
              .map((q: Question) => ({
                answer: formData[q.name],
                name: q.name,
                optional: q.optional,
                question: q.question,
              })),
            // Include raw form data for complete backup
            rawFormData: formData,
            role: {
              department: roleData.department,
              description: roleData.description,
              name: roleData.name,
              slug: roleData.slug,
            },
            roleAnswers: roleData.questions
              .filter((q: Question) => formData[q.name])
              .map((q: Question) => ({
                answer: formData[q.name],
                name: q.name,
                optional: q.optional,
                question: q.question,
              })),
          },
          timestamp,
        };

        // Stringify the JSON data with nice formatting
        const jsonString = JSON.stringify(backupData, null, 2);

        // First send a simple header message - using the safe variable
        const headerResponse = await fetch(webhookUrl, {
          body: JSON.stringify({
            content: `**NEW APPLICATION**\nRole: ${roleData.name}\nDepartment: ${roleData.department}\nApplicant: ${formData.discord_username} (${formData.discord_id})\nTimestamp: ${timestamp}`,
          }),
          headers: {
            "Content-Type": "application/json",
          },
          method: "POST",
        });

        if (!headerResponse.ok) {
          throw new Error(
            `Discord webhook error: ${headerResponse.status} ${headerResponse.statusText}`
          );
        }

        // Split the JSON data into manageable chunks for Discord
        const chunkSize = 1950; // Leave room for markdown code block syntax
        const chunks = [];

        for (let i = 0; i < jsonString.length; i += chunkSize) {
          chunks.push(jsonString.slice(i, i + chunkSize));
        }

        // Send each chunk as a code block - using the safe variable
        for (let i = 0; i < chunks.length; i += 1) {
          const chunkResponse = await fetch(webhookUrl, {
            body: JSON.stringify({
              content: `**Application Data (Part ${i + 1}/${chunks.length})**\n\`\`\`json\n${chunks[i]}\n\`\`\``,
            }),
            headers: {
              "Content-Type": "application/json",
            },
            method: "POST",
          });

          if (!chunkResponse.ok) {
            console.warn(
              `Failed to send data chunk ${i + 1}: ${chunkResponse.status}`
            );
          }

          // Add a small delay between chunk messages to avoid rate limiting
          if (i < chunks.length - 1) {
            await delay(500);
          }
        }

        console.log("Successfully sent application data to Discord webhook");
        return true;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.error(
          `Error sending to Discord webhook (attempt ${retryCount + 1}/${maxRetries + 1}):`,
          error
        );

        // If we've reached max retries, break out of the loop
        if (retryCount >= maxRetries) {
          break;
        }

        // Exponential backoff for retry
        const backoffDelay = Math.min(1000 * 2 ** retryCount, 10_000);
        await delay(backoffDelay);

        // Increment retry counter
        retryCount += 1;
      }
    }

    // If we reach here, all retries failed
    console.error(
      `All ${maxRetries + 1} attempts to send Discord webhook failed:`,
      lastError
    );
    return false;
  } catch (error) {
    console.error("Error sending to Discord webhook:", error);
    return false;
  }
}
