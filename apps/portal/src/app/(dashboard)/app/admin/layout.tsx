import { verifyAdminOrStaffSession } from "@/auth/dal";
import { PageContent } from "@/components/layout/page";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await verifyAdminOrStaffSession();

  return <PageContent>{children}</PageContent>;
}
