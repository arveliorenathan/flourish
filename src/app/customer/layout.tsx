import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Separator } from "@/components/ui/separator";
import { SidebarProvider } from "@/components/ui/sidebar";
import CustomerNavbar from "@/components/customer-navbar";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);

  // Redirect jika tidak ada session
  if (!session) {
    redirect("/login?callbackUrl=/customer");
  }

  // Optional: Cek role user
  if (session.user.role !== "CUSTOMER") {
    redirect("/unauthorized");
  }

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        {/* Main Area */}
        <div className="flex flex-col w-full">
          {/* Navbar - Client Component (karena butuh interaksi) */}
          <CustomerNavbar user={session.user} />

          {/* Separator */}
          <Separator />

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
