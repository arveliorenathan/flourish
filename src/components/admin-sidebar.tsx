import { GaugeCircle, BadgeCentIcon, Settings, Package2Icon, ShoppingCartIcon } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import Link from "next/link";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: GaugeCircle,
  },
  {
    title: "Product",
    url: "/admin/product",
    icon: Package2Icon,
  },
  {
    title: "Orders",
    url: "#",
    icon: ShoppingCartIcon,
  },
  {
    title: "Transaction",
    url: "#",
    icon: BadgeCentIcon,
  },
  {
    title: "Setting",
    url: "#",
    icon: Settings,
  },
];

export function AdminSidebar() {
  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between p-6 border-b">
        <span className="text-2xl font-bold tracking-wide">Flourish</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    variant="outline"
                    className="px-4 py-6 border hover:bg-sky-100 transition">
                    <Link href={item.url} className="w-full flex items-center gap-4 rounded-md ">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t flex justify-end">
        <span className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Flourish. All rights reserved.
        </span>
      </SidebarFooter>
    </Sidebar>
  );
}
