import type { FormQuestion } from "@/types";

export const creativeQuestions: FormQuestion[] = [
  {
    description:
      "Feel free to discuss your creative interests, inspirations, favorite styles, or the types of projects that excite you. Help us understand your creative preferences or motivations.",
    name: "creative_inspiration_and_satisfaction",
    question:
      "What inspires you creatively, and what types of creative work do you enjoy the most? What makes a creative project or task enjoyable or satisfying for you personally?",
    type: "paragraph",
  },
  {
    description:
      "Feel free to mention interests such as community involvement, professional growth, passion for Linux/open-source, or developing your creative skills.",
    name: "linux_creative_contribution",
    question:
      "Why specifically would you like to contribute your creativity to All Things Linux?",
    type: "paragraph",
  },
  {
    description:
      "For example: attention to detail, communication/collaboration, curiosity, self-motivation, open-mindedness, etc.",
    name: "personal_skills_and_strengths",
    question:
      "What personal skills, qualities, or strengths do you have that would help you succeed on a creative team?",
    type: "paragraph",
  },
  {
    description:
      "All experience is valued—formal, informal, professional, or personal.",
    name: "previous_creative_experience",
    optional: true,
    question:
      "Have you previously created any creative work, either personally, for school, volunteer projects, or professionally? If you're comfortable, please briefly tell us about your experience:",
    type: "paragraph",
  },
  {
    description:
      "Examples include Adobe Suite, Figma, Canva, Blender, video editors, writing tools, etc.",
    name: "creative_tools_software",
    question:
      "What creative tools or software are you familiar with (or interested in learning)?",
    type: "paragraph",
  },
  {
    name: "design_learning_interest",
    optional: true,
    question:
      "Is there a creative or design area you'd particularly like to improve in or learn more about while volunteering with us?",
    type: "paragraph",
  },
  {
    name: "portfolio_links",
    optional: true,
    question:
      "If you have an online portfolio, website, social media page, or even single creative projects you’d like to share, please link them below:",
    type: "short",
  },
  {
    name: "collaboration_preference",
    question:
      "Do you usually prefer collaborating closely with others on creative projects, working independently, or a bit of both?",
    type: "short",
  },
];
