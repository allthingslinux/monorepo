// Form data types
export interface FormData {
  discord_username: string;
  discord_id: string;
  [key: string]: string;
}

// Question type
export interface Question {
  name: string;
  question: string;
  optional?: boolean;
  type?: string;
  description?: string;
  options?: string[];
}

// Role type
export interface Role {
  name: string;
  slug: string;
  department: string;
  description: string;
  questions: Question[];
  generalQuestions: Question[]; // Reference to general questions for processing
}

// Export the payload structure for queue messages
export interface SubmissionPayload {
  formData: FormData;
  roleData: Role;
  timestamp: string;
}