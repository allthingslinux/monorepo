"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { memo, useCallback, useMemo, useState } from "react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { generalQuestions } from "@/data/forms/questions/general";
import { roles } from "@/data/forms/roles";
import { getRolesByDepartment } from "@/lib/utils";
import type { FormQuestion, Role } from "@/types";

// Helper to filter out conditional questions
const filterOutConditionalQuestions = (questions: FormQuestion[]) => {
  return questions.filter((question) => !question.showIf);
};

const Hero = memo(({ roleCount }: { roleCount: number }) => (
  <div className="relative mb-8 overflow-hidden rounded-xl border border-primary/10 sm:mb-10 md:mb-12">
    {/* Grid pattern background */}
    <div className="absolute inset-0 bg-[radial-gradient(#333_1px,transparent_1px)] opacity-20 [background-size:20px_20px]" />

    <div className="relative px-6 py-16 sm:px-10 sm:py-20 md:py-24">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex justify-center">
          <div className="inline-flex items-center space-x-1 rounded-full px-3 py-1 font-medium text-xs ring-1 ring-primary/20 backdrop-blur-sm">
            <span className="text-primary">Opportunities</span>
          </div>
        </div>

        <h1 className="mb-6 text-center font-bold text-3xl sm:text-4xl md:text-5xl">
          Apply
        </h1>

        <p className="mb-8 text-center text-base text-muted-foreground sm:text-lg md:text-xl">
          Join our team and make a difference. Find the perfect role that
          matches your skills and interests.
        </p>

        {/* Role stats with minimal tag style */}
        <div className="mb-10 flex flex-wrap justify-center gap-x-1 gap-y-2">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 font-mono text-primary-foreground text-sm">
            <span className="animate-pulse text-primary-foreground/80">■</span>
            <span className="ml-2 font-medium">{roleCount}+ open roles</span>
          </span>

          <span className="inline-flex items-center px-3 py-1 font-mono text-sm">
            •
          </span>

          <span className="inline-flex items-center rounded-full border border-blue-500/20 px-3 py-1 font-mono text-blue-400 text-sm">
            remote
          </span>

          <span className="inline-flex items-center rounded-full border border-orange-500/20 px-3 py-1 font-mono text-orange-400 text-sm">
            timezone flexible
          </span>

          <span className="inline-flex items-center rounded-full border border-green-500/20 px-3 py-1 font-mono text-green-400 text-sm">
            volunteer
          </span>
        </div>
      </div>
    </div>
  </div>
));
Hero.displayName = "Hero";

// Search component
const SearchInput = memo(
  ({
    value,
    onChange,
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => {
    const handleClear = useCallback(() => onChange(""), [onChange]);

    return (
      <div className="mx-auto mt-8 mb-8 max-w-2xl sm:mt-10 sm:mb-10 md:mt-12 md:mb-12">
        <div className="relative">
          <Search className="absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 text-muted-foreground/50" />

          <Input
            className="h-full w-full bg-transparent px-4 py-6 pl-12 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
            onChange={(e) => onChange(e.target.value)}
            placeholder="Search roles..."
            type="text"
            value={value}
          />

          {value && (
            <button
              aria-label="Clear search"
              className="absolute top-1/2 right-4 z-10 -translate-y-1/2 p-1.5 text-muted-foreground/50 hover:text-muted-foreground/80"
              onClick={handleClear}
              type="button"
            >
              <svg
                fill="none"
                height="16"
                viewBox="0 0 24 24"
                width="16"
                xmlns="http://www.w3.org/2000/svg"
              >
                <title>Clear search</title>
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeWidth="2"
                />
              </svg>
            </button>
          )}
        </div>
      </div>
    );
  }
);
SearchInput.displayName = "SearchInput";

// Role card component - memoized to avoid re-renders when other cards change
const RoleCard = memo(
  ({
    role,
    department,
    generalQuestionCount,
  }: {
    role: Role;
    department: string;
    generalQuestionCount: number;
  }) => {
    // Count total questions for this role - memoized since it's a computation
    const totalQuestions = useMemo(() => {
      const roleQuestionCount = filterOutConditionalQuestions(
        role.questions
      ).length;
      return generalQuestionCount + roleQuestionCount;
    }, [role.questions, generalQuestionCount]);

    return (
      <Link className="block h-full" href={`/apply/${role.slug}`}>
        <Card className="flex h-full flex-col rounded-md border-border/50 bg-background/60 backdrop-blur-sm transition-all duration-300 hover:ring-2 hover:ring-primary/20">
          <CardHeader className="p-3 sm:p-4 md:p-6">
            <div className="mb-2 flex flex-wrap items-start justify-between gap-2">
              <CardTitle className="text-base sm:text-lg">
                {role.name}
              </CardTitle>
              <Badge className="bg-background/60 text-xs" variant="outline">
                {department}
              </Badge>
            </div>
            <CardDescription className="mb-2 text-muted-foreground text-xs sm:text-sm md:text-base">
              {role.description}
            </CardDescription>
          </CardHeader>
          <CardContent className="mt-auto p-3 pt-0 sm:p-4 md:p-6">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs">
                {totalQuestions} questions total
              </span>
              <span className="font-medium text-primary text-xs sm:text-sm">
                Apply Now →
              </span>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }
);
RoleCard.displayName = "RoleCard";

// Department section component - memoized to prevent re-renders
const DepartmentSection = memo(
  ({
    department,
    roles,
    generalQuestionCount,
  }: {
    department: string;
    roles: Role[];
    generalQuestionCount: number;
  }) => (
    <div className="relative rounded-lg border border-border/50 bg-card p-4 shadow-md sm:p-6 md:p-8">
      {/* Department header with role count */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2 sm:mb-6 sm:flex-nowrap md:mb-8">
        <div className="flex w-full items-center gap-2 sm:gap-4">
          <h2 className="font-semibold text-xl sm:text-2xl">{department}</h2>
          <div className="hidden h-px grow bg-border sm:block" />
        </div>
        <Badge
          className="whitespace-nowrap px-2 py-1 text-xs sm:px-3 sm:text-sm"
          variant="outline"
        >
          {roles.length} {roles.length === 1 ? "Role" : "Roles"}
        </Badge>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 md:gap-6 lg:grid-cols-3">
        {roles.map((role) => (
          <RoleCard
            department={department}
            generalQuestionCount={generalQuestionCount}
            key={role.slug}
            role={role}
          />
        ))}
      </div>
    </div>
  )
);
DepartmentSection.displayName = "DepartmentSection";

// Empty results component - memoized since it has no props
const EmptyResults = memo(() => (
  <div className="py-8 text-center sm:py-10 md:py-12">
    <h3 className="font-medium text-base sm:text-lg">No roles found</h3>
    <p className="mt-2 text-muted-foreground text-sm sm:text-base">
      Try adjusting your search query
    </p>
  </div>
));
EmptyResults.displayName = "EmptyResults";

// Main page component
export default function GetInvolvedPage() {
  const [searchQuery, setSearchQuery] = useState("");

  // Memoize role data since it doesn't change
  const rolesByDepartment = useMemo(() => getRolesByDepartment(roles), []);
  const totalRoleCount = useMemo(
    () => Object.values(rolesByDepartment).flat().length,
    [rolesByDepartment]
  );

  // Memoize the count of general questions since it's static
  const generalQuestionCount = useMemo(
    () => filterOutConditionalQuestions(generalQuestions).length,
    []
  );

  // Memoize the filtered departments based on search query
  const filteredDepartments = useMemo(
    () =>
      Object.entries(rolesByDepartment)
        .map(([department, departmentRoles]) => ({
          department,
          roles: departmentRoles.filter(
            (role) =>
              role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              role.description
                .toLowerCase()
                .includes(searchQuery.toLowerCase()) ||
              department.toLowerCase().includes(searchQuery.toLowerCase())
          ),
        }))
        .filter((dept) => dept.roles.length > 0),
    [rolesByDepartment, searchQuery]
  );

  // Memoize the handler for search input changes
  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
  }, []);

  return (
    <div className="container mx-auto px-3 pt-10 pb-16 sm:px-4 sm:pt-12 sm:pb-20 md:px-6 md:pt-16 md:pb-24 lg:px-8 lg:pt-20 lg:pb-32">
      <Hero roleCount={totalRoleCount} />

      <SearchInput onChange={handleSearchChange} value={searchQuery} />

      <div className="space-y-6 sm:space-y-8 md:space-y-12">
        {filteredDepartments.map(({ department, roles }) => (
          <DepartmentSection
            department={department}
            generalQuestionCount={generalQuestionCount}
            key={department}
            roles={roles}
          />
        ))}

        {filteredDepartments.length === 0 && <EmptyResults />}
      </div>
    </div>
  );
}