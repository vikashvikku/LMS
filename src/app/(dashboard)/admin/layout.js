import { requireRole } from "@/lib/auth";

export const metadata = {
  title: "Admin Portal | CampusOS",
  description: "University Administration Dashboard",
};

export default async function AdminLayout({ children }) {
  // Enforce server-side authorization for all /admin routes
  // This will naturally redirect unauthorized users to their correct dashboard or login
  await requireRole(['university_admin', 'super_admin']);

  return <>{children}</>;
}
