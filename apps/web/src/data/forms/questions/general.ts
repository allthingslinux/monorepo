import type { FormQuestion } from "@/types";

export const generalQuestions: FormQuestion[] = [
  {
    description: "Your unique/global username; not a server nickname.",
    inputType: "text",
    name: "discord_username",
    question: "Discord Username:",
    type: "short",
  },
  {
    description:
      "Learn how to find your Discord ID: https://support.discord.com/hc/en-us/articles/206346498-Where-can-I-find-my-User-Server-Message-ID",
    maxLength: 22,
    minLength: 17,
    name: "discord_id",
    question: "Discord ID:",
    type: "digits-only",
  },
  {
    description: "What would you like us to call you?",
    name: "preferred_name",
    question: "Preferred Name:",
    type: "short",
  },
  {
    description:
      "You must be at least 16 years old to apply for all roles. We prefer applicants who are aged 18 or older.",
    maxLength: 2,
    minLength: 2,
    name: "age",
    question: "Age:",
    type: "digits-only",
  },
  {
    description: "e.g., he/him, she/her, they/them, etc.",
    name: "pronouns",
    optional: true,
    question: "Preferred Pronouns:",
    type: "short",
  },
  {
    description:
      "Please select the closest timezone to your location (Non Daylight Savings Time).",
    name: "timezone",
    options: [
      "UTC-12:00 (BIT)", // Baker Island Time
      "UTC-11:00 (NUT)", // Niue Time
      "UTC-10:00 (HAST)", // Hawaii-Aleutian Standard Time
      "UTC-09:00 (AKST)", // Alaska Standard Time
      "UTC-08:00 (PST)", // Pacific Standard Time
      "UTC-07:00 (MST)", // Mountain Standard Time
      "UTC-06:00 (CST)", // Central Standard Time
      "UTC-05:00 (EST)", // Eastern Standard Time
      "UTC-04:00 (AST)", // Atlantic Standard Time
      "UTC-03:00 (ART)", // Argentina Time
      "UTC-02:00 (GST)", // South Georgia Time
      "UTC-01:00 (AZOT)", // Azores Standard Time
      "UTC±00:00 (GMT)", // Greenwich Mean Time
      "UTC+01:00 (CET)", // Central European Time
      "UTC+02:00 (EET)", // Eastern European Time
      "UTC+03:00 (MSK)", // Moscow Standard Time
      "UTC+04:00 (GST)", // Gulf Standard Time
      "UTC+05:00 (PKT)", // Pakistan Standard Time
      "UTC+05:30 (IST)", // Indian Standard Time
      "UTC+06:00 (BST)", // Bangladesh Standard Time
      "UTC+07:00 (ICT)", // Indochina Time
      "UTC+08:00 (CST)", // China Standard Time
      "UTC+09:00 (JST)", // Japan Standard Time
      "UTC+10:00 (AEST)", // Australian Eastern Standard Time
      "UTC+11:00 (SBT)", // Solomon Islands Time
      "UTC+12:00 (FJT)", // Fiji Time
    ],
    question: "Timezone:",
    type: "select",
  },
  {
    description:
      "There is no minimum requirement, this is just to help us understand your level of engagement with the community.",
    name: "membership_duration",
    options: [
      "Less than 1 month",
      "1 - 3 months",
      "3 - 6 months",
      "6 - 12 months",
      "More than 1 year",
      "Other (please specify):",
    ],
    question:
      "How long have you been a member of the All Things Linux community?",
    type: "select",
  },
  {
    name: "membership_duration_other",
    question:
      'If you selected "Other" for membership duration, please specify:',
    showIf: {
      membership_duration: "Other (please specify):",
    },
    type: "short",
  },
  {
    description:
      "Feel free to briefly introduce yourself, your interests, hobbies, or anything you'd like us to know!",
    name: "about_yourself",
    optional: true,
    question: "Tell us a bit about yourself:",
    type: "paragraph",
  },
  {
    description: "e.g., Weekday evenings, weekends anytime, etc.",
    name: "availability",
    question: "Describe your general availability:",
    type: "short",
  },
  {
    description:
      "Remember, this is a volunteer position, so please be realistic about your availability.",
    name: "commitment_hours",
    options: [
      "1-5 hours",
      "5-10 hours",
      "10-15 hours",
      "15-20 hours",
      "20+ hours",
      "Other (Please specify):",
    ],
    question:
      "Approximately how many hours per week can you commit to this role?",
    type: "select",
  },
  {
    name: "commitment_hours_other",
    question: 'If you selected "Other" for hours per week, please specify:',
    showIf: {
      commitment_hours: "Other (Please specify):",
    },
    type: "short",
  },
  {
    description:
      "Please share briefly what draws you to our community and mission.",
    name: "motivation",
    question: "What motivates you to join the All Things Linux team?",
    type: "paragraph",
  },
  {
    description: "Links to past projects or references welcome!",
    name: "relevant_experience",
    optional: true,
    question:
      "Do you have any relevant experiences from previous employment, volunteer roles, or personal projects you would like us to know about?",
    type: "paragraph",
  },
  {
    description: "Please review before answering.",
    name: "code_of_conduct",
    options: ["Yes, fully", "No", "Somewhat (please specify):"],
    question:
      "Have you read, understood, and agree to abide by our Code of Conduct and Community Guidelines?",
    type: "select",
  },
  {
    name: "code_of_conduct_comment",
    optional: true,
    question:
      'If you selected "Somewhat" regarding the Code of Conduct, please explain:',
    showIf: {
      code_of_conduct: "Somewhat (please specify):",
    },
    type: "short",
  },
  {
    description:
      "This is intended as an informal chat, not a formal interview.",
    name: "voice_conversation",
    options: ["Yes", "No", "Other (please explain):"],
    question:
      "If we move forward with your application, would you be open to attending a brief, casual voice conversation as the next step?",
    type: "select",
  },
  {
    name: "voice_conversation_comment",
    optional: true,
    question:
      'If you selected "Other" regarding voice conversation, please explain:',
    showIf: {
      voice_conversation: "Other (please explain):",
    },
    type: "short",
  },
];