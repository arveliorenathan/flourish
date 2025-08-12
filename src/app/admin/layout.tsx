"use client";

import { usePathname } from "next/navigation";
import { AdminSidebar } from "@/components/admin-sidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut, useSession } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

// Get page title from current pathname
function getPageTitle(pathname: string) {
  switch (pathname) {
    case "/admin/dashboard":
      return "Dashboard Management";
    case "/admin/product":
      return "Product Management";
    default:
      return "";
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  const { data: session } = useSession();

  return (
    <SidebarProvider>
      <div className="flex w-full min-h-screen">
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main Area */}
        <div className="flex flex-col w-full">
          {/* Navbar */}
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center gap-3">
              <SidebarTrigger />
              <span className="text-xl font-medium">{pageTitle}</span>
            </div>

            {/* Right: Welcome Text + Avatar */}
            <div className="flex items-center gap-4">
              <div className="flex flex-col text-right">
                <span className="text-base">Welcome back, {session?.user.username || "Guest"}</span>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
                    <Avatar className="h-14 w-14">
                      <AvatarImage src={"https://github.com/leerob.png"} />
                      <AvatarFallback>PP</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="flex flex-col items-center w-auto">
                  <DropdownMenuItem>
                    <Button
                      variant="destructive"
                      onClick={() => signOut({ callbackUrl: "/login" })}>
                      <LogOut className="h-4 w-4 text-white" />
                      Sign-Out
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Separator */}
          <Separator />

          {/* Page Content */}
          <main className="p-6">{children}</main>
        </div>
      </div>
    </SidebarProvider>
  );
}
