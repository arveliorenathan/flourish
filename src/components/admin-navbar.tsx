"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface UserData {
  id: string;
  username: string;
  role: string;
  image?: string;
  name?: string;
  email?: string;
}

interface AdminNavbarProps {
  user: UserData;
}

export default function AdminNavbar({ user }: AdminNavbarProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <span className="text-xl font-medium">Admin Dashboard</span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex flex-col text-right">
          <span className="text-base">Welcome back, {user.name || user.username || "Admin"}</span>
          <span className="text-sm text-muted-foreground capitalize">
            {user.role.toLowerCase()}
          </span>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={"https://github.com/leerob.png"}
                  alt={`${user.username}'s avatar`}
                />
                <AvatarFallback>
                  {(user.name || user.username)?.charAt(0).toUpperCase() || "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-40">
            <DropdownMenuItem asChild>
              <div
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="flex items-center w-full cursor-pointer text-sm text-red-600 hover:bg-red-50 p-2">
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
