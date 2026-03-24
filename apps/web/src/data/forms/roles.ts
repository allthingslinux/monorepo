import type { Role } from "@/types";

import { creativeQuestions } from "./questions/departmental/creative";
import { financeQuestions } from "./questions/departmental/finance";
import { managementQuestions } from "./questions/departmental/management";
import { moderationQuestions } from "./questions/departmental/moderation";
import { systemsQuestions } from "./questions/departmental/systems";

export const moderationRoles: Role[] = [
  {
    department: "Moderation",
    description:
      "Senior Moderators are responsible for overseeing Moderator actions, resolving complex disputes, and keeping the Moderator team running smoothly with wisdom and support.",
    name: "Senior Moderator",
    questions: [...moderationQuestions],
    slug: "senior-moderator",
  },
  {
    department: "Moderation",
    description:
      "Moderators are responsible for enforcing our Code of Conduct and keeping the community safe and welcoming. They are the first line of defense and backbone of the community.",
    name: "Moderator",
    questions: [...moderationQuestions],
    slug: "moderator",
  },
];

export const financeRoles: Role[] = [
  {
    department: "Finance",
    description:
      "The Treasurer is responsible for overseeing the community’s finances. They manage the budget, track expenses, and ensure that we are financially responsible and sustainable.",
    name: "Treasurer",
    questions: [...financeQuestions],
    slug: "treasurer",
  },
];

export const managementRoles: Role[] = [
  {
    department: "Management",
    description:
      "Administrators are responsible for the overall management of the community. They set the vision and direction for the community, make key decisions, and act as a liaison between community and staff.",
    name: "Administrator",
    questions: [...managementQuestions],
    slug: "administrator",
  },
  {
    department: "Management",
    description:
      "The Assistant Administrator is responsible for supporting Administrators in the day-to-day running of the community. They help with note taking, task management, and other administrative duties.",
    name: "Assistant Administrator",
    questions: [...managementQuestions],
    slug: "assistant-administrator",
  },
  {
    department: "Management",
    description:
      "The Director of Moderation is responsible for overseeing the entire moderation team. They establish tone and culture for the team, develop policies and procedures, and onboard new moderators.",
    name: "Director of Moderation",
    questions: [...managementQuestions],
    slug: "director-of-moderation",
  },
];

export const creativeRoles: Role[] = [
  {
    department: "Creative",
    description:
      "The Creative Director is responsible for developing and establishing our creative vision. They oversee all design, branding and marketing efforts, and ensure that we maintain a consistent visual identity.",
    name: "Creative Director",
    questions: [...creativeQuestions],
    slug: "creative-director",
  },
  {
    department: "Creative",
    description:
      "Graphic Designers are responsible for creating visual content for our community. They work closely with the Creative Director to ensure that all design work is consistent with our brand and style guide.",
    name: "Graphic Designer",
    questions: [...creativeQuestions],
    slug: "graphic-designer",
  },
  {
    department: "Creative",
    description:
      "Pixel Artists are graphic designers who specialize in creating pixel/bitmap art. They are responsible for creating all pixel art used in our various projects and assets as needed.",
    name: "Pixel Artist",
    questions: [...creativeQuestions],
    slug: "pixel-artist",
  },
];

export const systemsRoles: Role[] = [
  {
    department: "Systems",
    description:
      "Systems Administrators are responsible for the overall management of our servers and infrastructure. They ensure that our systems are running smoothly and efficiently.",
    name: "Systems Administrator",
    questions: [...systemsQuestions],
    slug: "systems-administrator",
  },
  {
    department: "Systems",
    description:
      "Fullstack Web Developers are responsible for developing and maintaining our website, blog and related projects that require web development skills, from front-end to back-end.",
    name: "Fullstack Web Developer",
    questions: [...systemsQuestions],
    slug: "fullstack-web-developer",
  },
  {
    department: "Systems",
    description:
      "Frontend Web Developers are responsible for developing and maintaining our website and related projects that require skills such as React, Next.js, Shadcn UI, and Tailwind CSS.",
    name: "Frontend Web Developer",
    questions: [...systemsQuestions],
    slug: "frontend-web-developer",
  },
  {
    department: "Systems",
    description:
      "Backend Web Developers are responsible for developing and maintaining our website and related projects that require skills such as Node.js, Express, PostgreSQL, and Docker.",
    name: "Backend Web Developer",
    questions: [...systemsQuestions],
    slug: "backend-web-developer",
  },
  {
    department: "Systems",
    description:
      "Python Developers are responsible for developing and maintaining Python related projects like our Discord bot, Tux. Experience with discord.py, prisma, asyncio, httpx, poetry, and strict typing is desired.",
    name: "Python Developer",
    questions: [...systemsQuestions],
    slug: "python-developer",
  },
];

export const roles: Role[] = [
  ...moderationRoles,
  ...managementRoles,
  ...creativeRoles,
  ...systemsRoles,
  ...financeRoles,
];