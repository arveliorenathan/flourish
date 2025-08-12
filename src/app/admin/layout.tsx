// app/(admin)/layout.tsx
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { Separator } from "@/components/ui/separator";
import AdminNavbar from "@/components/admin-navbar";
import { SidebarProvider } from "@/components/ui/sidebar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Redirect jika tidak ada session
  if (!session) {
    redirect("/login?callbackUrl=/admin");
  }

  // Optional: Cek role user
  if (session.user.role !== "ADMIN") {
    redirect("/unauthorized");
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        {/* Sidebar - Server Component */}
        <AdminSidebar />

        {/* Main Area */}
        <div className="flex flex-col w-full">
          {/* Navbar - Client Component (karena butuh interaksi) */}
          <AdminNavbar user={session.user} />

          {/* Separator */}
          <Separator />

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
