"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Container, Section } from "@/components/shell";
import { roles as allRoles } from "@/data/forms/roles";
import { getRolesByDepartment } from "@/lib/utils";
import type { Role } from "@/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@atl/ui/components/select";

const DEPARTMENTS = [
  { label: "All Departments", value: "all" },
  { label: "Moderation", value: "Moderation" },
  { label: "Management", value: "Management" },
  { label: "Creative", value: "Creative" },
  { label: "Systems", value: "Systems" },
  { label: "Finance", value: "Finance" },
];

function RoleCard({ role }: { role: Role }) {
  return (
    <Link
      className="bg-muted/50 hover:bg-muted block rounded-lg p-5 transition-colors"
      href={`/apply/${role.slug}`}
    >
      <div className="mb-1 text-base font-semibold tracking-tight">
        {role.name}
      </div>
      <div className="text-muted-foreground text-sm">Remote · Volunteer</div>
    </Link>
  );
}

export default function ApplyPage() {
  const [filter, setFilter] = useState("all");

  const rolesByDepartment = useMemo(() => getRolesByDepartment(allRoles), []);

  const filteredDepartments = useMemo(
    () =>
      Object.entries(rolesByDepartment)
        .filter(([dept]) => filter === "all" || dept === filter)
        .filter(([, roles]) => roles.length > 0),
    [rolesByDepartment, filter]
  );

  return (
    <main className="w-full">
      <Section size="hero" variant="muted">
        <Container>
          <div className="pt-10 pb-4 md:pt-16 md:pb-6">
            <p className="text-primary mb-3 text-xs font-medium tracking-[0.2em] uppercase">
              Volunteer
            </p>
            <h1 className="font-display mb-4 text-[clamp(2rem,4.5vw,3.5rem)] leading-[1.06] font-bold tracking-tight">
              Open Positions
            </h1>
            <p className="text-muted-foreground max-w-lg text-lg leading-relaxed text-pretty">
              Join our team and help build the future of Linux education and
              open-source community. All roles are remote and volunteer-based.
            </p>
          </div>
        </Container>
      </Section>

      <Section size="default" variant="default">
        <Container>
          <div className="mb-8 flex flex-wrap items-center gap-4">
            <span className="text-muted-foreground text-sm font-medium">
              Filter
            </span>
            <Select value={filter} onValueChange={(v) => setFilter(v ?? "")}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-14">
            {filteredDepartments.map(([department, roles]) => (
              <div key={department}>
                <h2 className="font-display mb-6 text-3xl font-bold tracking-tight">
                  {department}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {roles.map((role) => (
                    <RoleCard key={role.slug} role={role} />
                  ))}
                </div>
              </div>
            ))}

            {filteredDepartments.length === 0 && (
              <div className="py-12 text-center">
                <h3 className="text-lg font-medium">No roles found</h3>
                <p className="text-muted-foreground mt-2 text-sm">
                  Try selecting a different department
                </p>
              </div>
            )}
          </div>
        </Container>
      </Section>
    </main>
  );
}
