import { GraphQLClient, gql } from "graphql-request";

import type { FormData, Question, Role } from "../types";

// Define types for Monday.com API responses
interface MondayColumn {
  id: string;
  settings_str: string;
  title: string;
  type: string;
}

interface MondayBoardResponse {
  boards: {
    columns: MondayColumn[];
  }[];
}

interface MondayItemResponse {
  board: {
    id: string;
    name: string;
  };
  id: string;
  name: string;
}

// Define types for Monday.com settings
interface MondayStatusLabel {
  border: string;
  color: string;
  var_name: string;
}

interface MondayDropdownOption {
  id: number;
  name: string;
}

interface MondayStatusSettings {
  done_colors: number[];
  labels: Record<string, string>;
  labels_colors: Record<string, MondayStatusLabel>;
}

interface MondayDropdownSettings {
  hide_footer: boolean;
  labels: MondayDropdownOption[];
}

/**
 * Splits a string into simple chunks of a maximum length.
 */
function splitTextIntoChunks(text: string, maxLength: number): string[] {
  const chunks: string[] = [];
  if (!text || maxLength <= 0) {
    return [];
  }
  for (let i = 0; i < text.length; i += maxLength) {
    chunks.push(text.slice(i, i + maxLength));
  }
  return chunks;
}

/**
 * Creates a GraphQL client for Monday.com
 */
function createMondayClient(apiKey: string): GraphQLClient {
  // Use a more basic fetch-based configuration to avoid any compatibility issues
  const client = new GraphQLClient("https://api.monday.com/v2", {
    // Avoid any Node.js specific features
    fetch: globalThis.fetch,
    headers: {
      Authorization: apiKey,
      "Content-Type": "application/json",
    },
  });
  return client;
}

/**
 * Fetches board structure to get column IDs
 */
async function getMondayBoardStructure(
  client: GraphQLClient,
  boardId: string
): Promise<MondayColumn[] | null> {
  try {
    console.log("Fetching Monday.com board structure to get column IDs...");

    // Use the boards query to get columns with detailed settings
    const boardQuery = gql`
      query GetBoardColumns($boardId: [ID!]) {
        boards(ids: $boardId) {
          columns {
            id
            title
            type
            settings_str
          }
        }
      }
    `;

    const variables = {
      boardId,
    };

    const data = await client.request<MondayBoardResponse>(
      boardQuery,
      variables
    );
    console.log("Monday.com board structure:", JSON.stringify(data, null, 2));

    // Return the columns from the first board
    if (data.boards && data.boards.length > 0) {
      return data.boards[0].columns;
    }

    throw new Error("No board data found");
  } catch (error) {
    console.error("Error fetching Monday.com board structure:", error);
    return null;
  }
}

function formatStatusColumnValue(
  column: MondayColumn,
  value: unknown
): unknown {
  try {
    const settings = JSON.parse(column.settings_str) as MondayStatusSettings;
    if (!settings?.labels) {
      return { index: 5 };
    }
    const { labels } = settings;
    if (value && typeof value === "string") {
      for (const [index, label] of Object.entries(labels)) {
        if (
          typeof label === "string" &&
          label.toLowerCase() === value.toLowerCase()
        ) {
          return { index: Number.parseInt(index, 10) };
        }
      }
    }

    for (const [index, label] of Object.entries(labels)) {
      if (typeof label === "string" && label.toLowerCase() === "needs review") {
        return { index: Number.parseInt(index, 10) };
      }
    }

    const firstIndex = Object.keys(labels)[0];
    return { index: Number.parseInt(firstIndex, 10) };
  } catch (error) {
    console.warn(`Failed to parse status settings for ${column.id}:`, error);
    return { index: 5 };
  }
}

function formatDropdownColumnValue(
  column: MondayColumn,
  value: unknown
): unknown {
  try {
    const settings = JSON.parse(column.settings_str) as MondayDropdownSettings;
    if (!(settings?.labels && Array.isArray(settings.labels))) {
      return { ids: [] };
    }
    if (value && typeof value === "string") {
      const matchedOption = settings.labels.find(
        (option) =>
          option &&
          option.name &&
          option.name.toLowerCase() === value.toLowerCase()
      );

      if (matchedOption) {
        return { ids: [matchedOption.id] };
      }
      return { text: String(value) };
    }
    return { ids: [] };
  } catch (error) {
    console.warn(`Failed to parse dropdown settings for ${column.id}:`, error);
    return { ids: [] };
  }
}

/**
 * Get appropriate value format for different column types
 */
function formatColumnValue(column: MondayColumn, value: unknown): unknown {
  if (!value && value !== 0) {
    return null;
  }

  switch (column.type) {
    case "status": {
      return formatStatusColumnValue(column, value);
    }

    case "date": {
      if (value instanceof Date) {
        return value.toISOString().split("T")[0];
      }
      return String(value);
    }

    case "long_text": {
      return { text: String(value) };
    }

    case "text": {
      return String(value);
    }

    case "dropdown": {
      return formatDropdownColumnValue(column, value);
    }

    default: {
      return String(value);
    }
  }
}

/**
 * Creates an item in Monday.com
 */
async function createMondayItem(
  client: GraphQLClient,
  boardId: string,
  itemName: string,
  columnValues: Record<string, unknown>
): Promise<string> {
  console.log("Creating Monday.com item...");

  const createItemMutation = gql`
    mutation CreateItem(
      $boardId: ID!
      $itemName: String!
      $columnValues: JSON!
    ) {
      create_item(
        board_id: $boardId
        item_name: $itemName
        column_values: $columnValues
      ) {
        id
        name
        board {
          id
          name
        }
      }
    }
  `;

  const variables = {
    boardId,
    columnValues: JSON.stringify(columnValues),
    itemName,
  };

  try {
    const data = await client.request<{ create_item: MondayItemResponse }>(
      createItemMutation,
      variables
    );
    console.log("Item created:", JSON.stringify(data, null, 2));
    return data.create_item.id;
  } catch (error) {
    console.error("Error creating Monday.com item:", error);
    throw error;
  }
}

/**
 * Adds application details directly to item instead of creating docs
 * (workaround for doc creation issues)
 * Sends updates in reverse order (headers first, then questions oldest to newest)
 * so they appear chronologically correct in Monday.com (newest first).
 */
async function addDetailsToItem(
  client: GraphQLClient,
  itemId: string,
  roleData: Role,
  formData: FormData,
  timestamp: string
): Promise<boolean> {
  let allUpdatesSuccessful = true; // Track success across all updates

  try {
    console.log(
      "Adding application details as individual updates to the item..."
    );

    // Reusable function to send an update, now with retry logic for length errors
    const sendUpdate = async (body: string): Promise<boolean> => {
      const updateMutation = gql`
        mutation CreateUpdate($itemId: ID!, $body: String!) {
          create_update(item_id: $itemId, body: $body) {
            id
          }
        }
      `;
      try {
        console.log(`Sending update with body: ${body.slice(0, 50)}...`);
        await client.request(updateMutation, { body, itemId });
        // Optional: Add a small delay between requests if rate limiting becomes an issue
        // await new Promise(resolve => setTimeout(resolve, 200));
        return true;
      } catch (updateError: unknown) {
        console.error(
          "Initial error sending update:",
          updateError,
          "Body length:",
          body.length
        );

        // Check if the error looks like a length/complexity limit
        const errorMessage =
          (
            updateError as {
              response?: { errors?: { message?: string }[] };
            }
          )?.response?.errors?.[0]?.message?.toLowerCase() || "";
        const isLengthError =
          errorMessage.includes("limit") ||
          errorMessage.includes("length") ||
          errorMessage.includes("size") ||
          errorMessage.includes("complexity") ||
          errorMessage.includes("too long");
        // Optionally check body.length > threshold if needed

        if (isLengthError) {
          console.warn(
            "Potential length limit error detected. Attempting to split and retry..."
          );
          const RETRY_MAX_LENGTH = 1000; // Smaller chunk size for retry
          const chunks = splitTextIntoChunks(body, RETRY_MAX_LENGTH);
          let retrySuccessful = true;

          if (chunks.length <= 1) {
            console.error(
              "Splitting resulted in 1 or 0 chunks, cannot retry meaningfully."
            );
            return false; // Avoid infinite loops or pointless retries
          }

          for (let i = 0; i < chunks.length; i += 1) {
            const chunkBody = chunks[i];
            // Add prefix only if splitting happened
            const retryPrefix = `(Split Part ${i + 1}/${chunks.length}) `;
            try {
              console.log(
                `Retrying with chunk ${i + 1}/${chunks.length}: ${chunkBody.slice(0, 50)}...`
              );
              await client.request(updateMutation, {
                body: retryPrefix + chunkBody,
                itemId,
              });
              // Optional delay?
              // await new Promise(resolve => setTimeout(resolve, 100));
            } catch (retryError) {
              console.error(
                `Retry failed for chunk ${i + 1}/${chunks.length}:`,
                retryError
              );
              retrySuccessful = false;
              break; // Stop retrying if one chunk fails
            }
          }

          if (retrySuccessful) {
            console.log("Retry successful after splitting the update.");
            return true; // The overall update succeeded via splitting
          }
          console.error("Retry failed even after splitting.");
          return false; // The overall update failed
        }
        // Not a length error, or retry failed, just return false
        console.log("Error not identified as length limit, not retrying.");
        return false;
      }
    };

    // Prepare content blocks
    const headerBody =
      `🔔 NEW APPLICATION RECEIVED - ${formData.discord_username}\n` +
      `Date: ${new Date(timestamp).toLocaleString()}\n\n` +
      "--- APPLICANT INFO ---\n" +
      `Discord: ${formData.discord_username}\n` +
      `Discord ID: ${formData.discord_id}\n\n` +
      "--- ROLE INFO ---\n" +
      `Role: ${roleData.name}\n` +
      `Department: ${roleData.department}\n` +
      `Description: ${roleData.description}`;

    const generalQuestionsHeader = "--- GENERAL QUESTIONS ---";
    const roleQuestionsHeader = "--- ROLE-SPECIFIC QUESTIONS ---";

    const generalQuestions = roleData.generalQuestions.filter(
      (q: Question) => formData[q.name]
    );
    const roleQuestions = roleData.questions.filter(
      (q: Question) => formData[q.name]
    );

    // Send updates in reverse order for correct chronological display in Monday

    // 4. Send Role-Specific Questions (in reverse order)
    for (let i = roleQuestions.length - 1; i >= 0; i -= 1) {
      const q = roleQuestions[i];
      const questionBody = `Q: ${q.question}\nA: ${formData[q.name]}`;
      if (!(await sendUpdate(questionBody))) {
        allUpdatesSuccessful = false;
      }
    }

    // 3. Send Role-Specific Questions Header
    if (roleQuestions.length > 0 && !(await sendUpdate(roleQuestionsHeader))) {
      allUpdatesSuccessful = false;
    }

    // 2. Send General Questions (in reverse order)
    for (let i = generalQuestions.length - 1; i >= 0; i -= 1) {
      const q = generalQuestions[i];
      const questionBody = `Q: ${q.question}\nA: ${formData[q.name]}`;
      if (!(await sendUpdate(questionBody))) {
        allUpdatesSuccessful = false;
      }
    }

    // 1. Send General Questions Header
    if (
      generalQuestions.length > 0 &&
      !(await sendUpdate(generalQuestionsHeader))
    ) {
      allUpdatesSuccessful = false;
    }

    // 0. Send Header Info (Sent last to appear first in Monday)
    if (!(await sendUpdate(headerBody))) {
      allUpdatesSuccessful = false;
    }

    if (allUpdatesSuccessful) {
      console.log(
        "Successfully added application details as individual updates"
      );
      return true;
    }
    console.warn(
      "Some updates failed to be added during the application submission."
    );
    return false; // Return false if any update failed
  } catch (error) {
    console.error(
      "Error preparing or adding application details as individual updates:",
      error
    );
    return false;
  }
}

function applyFixedBoardDropdown(
  columnValues: Record<string, unknown>,
  columns: MondayColumn[],
  columnId: string,
  value: string,
  kind: "role" | "department"
): void {
  const label = kind === "role" ? "role" : "department";
  console.log(
    kind === "role"
      ? `Setting role value: "${value}"`
      : `Setting department value: "${value}"`
  );

  const column = columns.find((col) => col.id === columnId);
  if (!column) {
    columnValues[columnId] = { text: value };
    return;
  }

  try {
    const settings = JSON.parse(column.settings_str) as MondayDropdownSettings;
    if (!(settings.labels && Array.isArray(settings.labels))) {
      columnValues[columnId] = { text: value };
      return;
    }
    const matched = settings.labels.find(
      (option) =>
        option?.name && option.name.toLowerCase() === value.toLowerCase()
    );
    if (matched) {
      console.log(`Found matching ${label} ID ${matched.id} for "${value}"`);
      columnValues[columnId] = { ids: [matched.id] };
    } else {
      console.log(
        `No matching ${label} found for "${value}", using text approach`
      );
      columnValues[columnId] = { text: value };
    }
  } catch (error) {
    console.warn(`Error parsing ${label} dropdown settings:`, error);
    columnValues[columnId] = { text: value };
  }
}

/**
 * Stores application data in Monday.com using GraphQL Request
 */
export async function storeApplicationInMonday(
  roleData: Role,
  formData: FormData,
  timestamp: string,
  mondayApiKey: string,
  boardId: string
): Promise<boolean> {
  try {
    if (!(mondayApiKey && boardId)) {
      console.error(
        "Monday.com API key or board ID not configured, skipping integration"
      );
      return false;
    }

    console.log(
      "Attempting to store application in Monday.com using GraphQL Request..."
    );

    // Create GraphQL client
    const client = createMondayClient(mondayApiKey);

    // Get board structure to understand column IDs
    const columns = await getMondayBoardStructure(client, boardId);

    if (!columns || columns.length === 0) {
      console.error("Failed to get Monday.com board columns");
      return false;
    }

    // Log column mapping information for debugging
    console.log("Column mapping for reference:");
    for (const col of columns) {
      console.log(`  ${col.id}: ${col.title} (${col.type})`);
    }

    // Log all form keys to help debug
    console.log("Form data keys:", Object.keys(formData));

    // Create a map of field mappings (title/description to column ID)
    const fieldToColumnMap: Record<string, MondayColumn> = {};

    // Standard fields we want to map by title or similar names
    const fieldMappings = [
      { field: "name", titleMatches: ["name", "title", "applicant"] },
      {
        field: "discord_username",
        titleMatches: ["discord username", "discord name", "discord user"],
      },
      { field: "discord_id", titleMatches: ["discord id", "discord user id"] },
      { field: "status", titleMatches: ["status", "application status"] },
      { field: "department", titleMatches: ["department", "team", "group"] },
      { field: "role", titleMatches: ["role", "position", "job title"] },
      {
        field: "submission_date",
        titleMatches: ["date", "submission date", "applied on"],
      },
    ];

    // Map columns based on title matches
    for (const mapping of fieldMappings) {
      // Find column that matches any of the title options
      const matchedColumn = columns.find((col) =>
        mapping.titleMatches.some((match) =>
          col.title.toLowerCase().includes(match.toLowerCase())
        )
      );

      if (matchedColumn) {
        fieldToColumnMap[mapping.field] = matchedColumn;
      }
    }

    console.log(
      "Field to column mapping:",
      Object.entries(fieldToColumnMap).map(
        ([field, col]) => `${field} -> ${col.id} (${col.title})`
      )
    );

    // Map form data to Monday.com column values
    const columnValues: Record<string, unknown> = {};

    // Helper to set column value if we have a mapping for it
    const setColumnValue = (field: string, value: unknown) => {
      if (fieldToColumnMap[field] && value) {
        const column = fieldToColumnMap[field];
        columnValues[column.id] = formatColumnValue(column, value);
      }
    };

    // Set column values from the form data
    setColumnValue(
      "name",
      formData.preferred_name || formData.discord_username
    );
    setColumnValue("discord_username", formData.discord_username);
    setColumnValue("discord_id", formData.discord_id);
    setColumnValue("submission_date", new Date(timestamp));
    setColumnValue("status", "Needs Review");
    setColumnValue("department", roleData.department);
    setColumnValue("role", roleData.name);

    // Fall back to using the actual column IDs if we couldn't find all mappings
    // Explicit mappings based on the board structure in the logs
    columnValues.name = formData.preferred_name || formData.discord_username;
    columnValues.text_mkp2jfrq = formData.discord_username; // Discord Username
    columnValues.text_mkp2d8wc = formData.discord_id; // Discord ID
    columnValues.date4 = new Date(timestamp).toISOString().split("T")[0]; // Date
    columnValues.color_mkp2nrgz = { index: 5 }; // Status - Needs Review (index 5)

    applyFixedBoardDropdown(
      columnValues,
      columns,
      "dropdown_mkp22pcr",
      roleData.name,
      "role"
    );
    applyFixedBoardDropdown(
      columnValues,
      columns,
      "dropdown_mkp2n3v9",
      roleData.department,
      "department"
    );

    // Log the complete column mapping for debugging
    console.log(
      "Monday.com column values:",
      JSON.stringify(columnValues, null, 2)
    );

    // Create the item
    const itemName = `${formData.discord_username} - ${roleData.name}`;
    const itemId = await createMondayItem(
      client,
      boardId,
      itemName,
      columnValues
    );
    console.log(`Monday.com item created with ID: ${itemId}`);

    // Since doc creation is failing, use item updates instead
    const detailsAdded = await addDetailsToItem(
      client,
      itemId,
      roleData,
      formData,
      timestamp
    );

    if (detailsAdded) {
      console.log("Successfully stored application in Monday.com");
      return true;
    }
    console.warn("Created item but failed to add full details");
    return true; // Return true anyway since the main item was created
  } catch (error) {
    console.error("Error storing application in Monday.com:", error);
    return false;
  }
}