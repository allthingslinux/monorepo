import Link from "next/link";
import { memo } from "react";
import { PiLinuxLogoBold, PiNetworkBold } from "react-icons/pi";
import {
  TbBrandDiscord,
  TbCode,
  TbFiles,
  TbMessage2,
  TbStack2,
  TbUserCircle,
  TbWritingSign,
} from "react-icons/tb";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type ProjectStatus =
  | "active"
  | "beta"
  | "development"
  | "paused"
  | string
  | null;

const projects = [
  {
    title: "atl.wiki",
    description:
      "Easy to use guides and references for the Linux and FOSS ecosystem.",
    icon: (
      <TbWritingSign className="size-8 text-teal-600 sm:size-10 md:size-12" />
    ),
    link: "https://atl.wiki",
    status: "v1.1" as ProjectStatus,
  },
  {
    title: ".gg/linux",
    description:
      "Our official Discord server, the heart of our community, growing by the day.",
    icon: (
      <TbBrandDiscord className="size-8 text-purple-500 sm:size-10 md:size-12" />
    ),
    link: "https://discord.gg/linux",
    status: "active" as ProjectStatus,
  },
  {
    title: "atl.tools",
    description:
      "Self-hosted applications, services and mail, always free - more coming soon!",
    icon: <TbStack2 className="size-8 text-rose-400 sm:size-10 md:size-12" />,
    link: "https://atl.tools",
    status: "beta" as ProjectStatus,
  },
  {
    title: "atl.chat",
    description:
      "Chat with the community via our bridged IRC and XMPP servers.",
    icon: <TbMessage2 className="size-8 text-sky-500 sm:size-10 md:size-12" />,
    link: "https://github.com/allthingslinux/atl.chat",
    status: "coming soon" as ProjectStatus,
  },
  {
    title: "tux",
    description:
      "Tux is the all-in-one open source Discord bot that powers our community.",
    icon: (
      <PiLinuxLogoBold className="size-8 text-orange-300 sm:size-10 md:size-12" />
    ),
    link: "https://github.com/allthingslinux/tux",
    status: "v0.1.0-rc.5" as ProjectStatus,
  },
  {
    title: "atl.sh",
    description:
      "Our pubnix/tilde services to facilitate free experimentation and learning.",
    icon: (
      <PiNetworkBold className="size-8 text-gray-400 sm:size-10 md:size-12" />
    ),
    link: "#",
    status: "development" as ProjectStatus,
  },
  {
    title: "portal",
    description:
      "Centralized hub and identity provider for all things, All Things Linux.",
    icon: (
      <TbUserCircle className="size-8 text-blue-400 sm:size-10 md:size-12" />
    ),
    link: "https://github.com/allthingslinux/portal",
    status: "coming soon" as ProjectStatus,
  },
  {
    title: "atl.dev",
    description:
      "Hosting, version control, storage and more for developers and FOSS projects.",
    icon: <TbCode className="size-8 text-green-300 sm:size-10 md:size-12" />,
    link: "#",
    status: "development" as ProjectStatus,
  },
  {
    title: "iso archive",
    description:
      "An initiative to archive ISOs and their metadata for future generations.",
    icon: <TbFiles className="size-8 text-sky-400 sm:size-10 md:size-12" />,
    link: "https://github.com/allthingslinux/iso.atl.dev",
    status: "development" as ProjectStatus,
  },
];

// Status badge component
function StatusBadge({ status }: { status: ProjectStatus }) {
  if (!status) {
    return null;
  }

  // Check if status is a version string (starts with 'v' followed by numbers/dots)
  const isVersion = /^v\d+/.test(status);

  if (isVersion) {
    return (
      <Badge
        className="absolute top-3 right-3 border-purple-500/30 bg-purple-500/20 font-medium text-white text-xs"
        variant="outline"
      >
        {status}
      </Badge>
    );
  }

  const statusConfig: Record<string, { label: string; className: string }> = {
    active: {
      label: "Active",
      className: "bg-green-500/20 text-white border-green-500/30",
    },
    beta: {
      label: "Beta",
      className: "bg-orange-500/20 text-white border-orange-500/30",
    },
    development: {
      label: "In Development",
      className: "bg-blue-500/20 text-white border-blue-500/30",
    },
    paused: {
      label: "Paused",
      className: "bg-gray-500/20 text-white border-gray-500/30",
    },
    "coming soon": {
      label: "Coming Soon",
      className: "bg-amber-500/20 text-white border-amber-500/30",
    },
  };

  const config = statusConfig[status];
  if (!config) {
    return null;
  }

  return (
    <Badge
      className={`absolute top-3 right-3 font-medium text-xs ${config.className}`}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
}

// Project card component
const ProjectCard = ({ project }: { project: (typeof projects)[0] }) => {
  const isExternalLink = project.link.startsWith("http");

  const cardContent = (
    <>
      <StatusBadge status={project.status} />
      <div className="mb-3 flex items-center justify-center sm:mb-4">
        {project.icon}
      </div>
      <div>
        <h3 className="mb-2 text-center font-semibold text-lg leading-tight sm:text-xl">
          {project.title}
        </h3>
        <p className="text-balance text-center text-muted-foreground text-xs leading-relaxed sm:text-sm md:text-base">
          {project.description}
        </p>
      </div>
    </>
  );

  return project.link === "#" ? (
    <Card className="relative h-full cursor-not-allowed border border-transparent bg-card p-3 opacity-80 sm:p-4 md:p-6">
      {cardContent}
    </Card>
  ) : (
    <Link
      className="block rounded-md transition-transform hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      href={project.link}
      rel={isExternalLink ? "noopener noreferrer" : undefined}
      target={isExternalLink ? "_blank" : undefined}
    >
      <Card className="relative h-full border border-transparent bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm sm:p-4 md:p-6">
        {cardContent}
      </Card>
    </Link>
  );
};

const Projects = memo(() => {
  const totalProjects = projects.length;
  const lastRowCount = totalProjects % 3;
  const regularRowsCount = totalProjects - lastRowCount;
  const shouldCenterLastRow = lastRowCount === 1 || lastRowCount === 2;

  const regularProjects = projects.slice(0, regularRowsCount);
  const lastRowProjects = projects.slice(regularRowsCount);

  return (
    <section className="py-4 md:py-6">
      <div className="mx-auto w-full max-w-[1400px] px-3 sm:px-4 md:px-6">
        <div className="mx-auto mb-6 max-w-2xl text-center sm:mb-8 md:mb-12">
          <h2 className="mb-3 font-semibold text-xl sm:mb-4 sm:text-2xl md:mb-6 md:text-3xl lg:text-4xl">
            Explore our ecosystem
          </h2>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">
            As our organization grows, we continue to develop new and exciting
            projects through community collaboration. We have many initiatives
            in progress and welcome your contributions!
          </p>
        </div>

        <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
          {regularProjects.map((project) => (
            <ProjectCard key={project.title} project={project} />
          ))}
        </div>

        {lastRowProjects.length > 0 && (
          <div
            className={`mt-4 sm:mt-5 md:mt-6 ${
              shouldCenterLastRow && lastRowCount === 1
                ? "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3"
                : shouldCenterLastRow && lastRowCount === 2
                  ? "flex flex-col gap-4 sm:grid sm:grid-cols-2 sm:gap-5 md:gap-6 lg:flex lg:flex-row lg:justify-center"
                  : "grid w-full grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3"
            }`}
          >
            {lastRowProjects.map((project, index) => (
              <div
                className={
                  shouldCenterLastRow && lastRowCount === 1
                    ? "lg:col-start-2"
                    : shouldCenterLastRow && lastRowCount === 2
                      ? "w-full sm:w-auto lg:w-[calc(33.333%-0.67rem)]"
                      : ""
                }
                key={project.title}
              >
                <ProjectCard project={project} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
});

Projects.displayName = "Projects";

export default Projects;