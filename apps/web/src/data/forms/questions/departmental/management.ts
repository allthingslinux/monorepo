import type { FormQuestion } from "@/types";

export const managementQuestions: FormQuestion[] = [
  {
    description:
      "Feel free to share your motivations or why guiding others appeals to you.",
    name: "leadership_interest",
    question:
      "What interests you about being in a leadership or management role within our community?",
    type: "paragraph",
  },
  {
    name: "working_with_others",
    question:
      "How would you describe your personality or approach when working with others?",
    type: "paragraph",
  },
  {
    description:
      "Feel free to discuss things like empathy, communication skills, responsibility, patience, curiosity, etc.",
    name: "personal_qualities",
    question:
      "What are some personal qualities you have that might help you as a leader, even if you haven't had a formal leadership role yet?",
    type: "paragraph",
  },
  {
    name: "important_traits",
    question:
      "In your opinion, what are the most important traits or qualities a good leader or manager should have?",
    type: "paragraph",
  },
  {
    name: "building_environment",
    question:
      "How do you think a good leader helps build a welcoming, positive team environment, especially with volunteers?",
    type: "paragraph",
  },
  {
    name: "task_organization",
    optional: true,
    question:
      "How do you typically organize your tasks and responsibilities, especially if handling multiple commitments at once?",
    type: "paragraph",
  },
  {
    name: "learning_goals",
    question:
      "What would you hope to learn or develop about yourself by stepping into a leadership or management role in our community?",
    type: "paragraph",
  },
  {
    name: "admired_leader",
    optional: true,
    question:
      "Is there a person or leader you've admired or looked up to? What qualities about them inspired you?",
    type: "paragraph",
  },
  {
    name: "unique_perspective",
    optional: true,
    question:
      "What unique perspective or fresh ideas do you think you might bring to our leadership team at All Things Linux?",
    type: "paragraph",
  },
];