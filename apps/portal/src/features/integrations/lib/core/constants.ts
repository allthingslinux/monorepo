import type { IntegrationStatus } from "@atl/utils/constants";

export const integrationStatusLabels: Record<IntegrationStatus, string> = {
  active: "Active",
  deleted: "Deleted",
  pending: "Pending",
  suspended: "Suspended",
};
