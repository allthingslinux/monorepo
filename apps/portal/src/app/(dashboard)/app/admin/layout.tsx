import { PageContent } from "@/components/layout/page";
import { verifyAdminOrStaffSession } from "@atl/auth/dal";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAdminOrStaffSession();

  return <PageContent>{children}</PageContent>;
}
