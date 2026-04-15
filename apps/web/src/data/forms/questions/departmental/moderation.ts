import type { FormQuestion } from "@/types";

export const moderationQuestions: FormQuestion[] = [
  {
    description:
      "Why does moderation or supporting an online community appeal to you?",
    name: "linux_moderator_interest",
    question:
      "What interests you about becoming a moderator for the All Things Linux community?",
    type: "paragraph",
  },
  {
    name: "important_responsibility",
    question:
      "In your opinion, what is the most important responsibility of a moderator?",
    type: "paragraph",
  },
  {
    description: "Mention any strengths and what you wish to learn or improve.",
    name: "qualities_and_growth",
    question:
      "What personal qualities do you have, and what skills or knowledge are you hoping to develop through moderating with us?",
    type: "paragraph",
  },
  {
    description:
      "Include any relevant Discord servers, online communities, forums, etc.",
    name: "previous_experience",
    optional: true,
    question:
      "Have you had any previous experience with moderation or community support roles (formal or informal)?",
    type: "paragraph",
  },
  {
    name: "moderation_tools",
    optional: true,
    question:
      "Have you used any moderation tools or bots before? Are there particular tools you’re interested in learning about?",
    type: "paragraph",
  },
  {
    name: "communication_style",
    question:
      "How would you describe your communication style when interacting with community members?",
    type: "paragraph",
  },
  {
    name: "teamwork_comfort",
    options: ["Yes", "No", "Other (please specify):"],
    question:
      "Are you comfortable working closely with others as part of a moderator team?",
    type: "select",
  },
  {
    name: "teamwork_comfort_comment",
    optional: true,
    question: 'If you selected "Other", please explain:',
    showIf: {
      teamwork_comfort: "Other (please specify):",
    },
    type: "short",
  },
  {
    name: "uncertainty_resolution",
    question:
      "If you’re unsure about a moderation decision or action, how do you typically approach resolving that uncertainty?",
    type: "paragraph",
  },
];
