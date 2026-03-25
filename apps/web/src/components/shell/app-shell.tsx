/**
 * Main content wrapper between site header and footer.
 */
export function AppShell({ children }: { children: React.ReactNode }) {
  return <div className="w-full flex-1">{children}</div>;
}