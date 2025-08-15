"use client";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import Link from "next/link";

interface UserData {
  id: string;
  username: string;
  role: string;
  image?: string;
  name?: string;
  email?: string;
}

interface CustomerNavbarProps {
  user: UserData;
}

export default function CustomerNavbar({ user }: CustomerNavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { label: "Home", href: "/customer/home" },
    { label: "Product", href: "/customer/product" },
    { label: "Transaction", href: "/customer/transaction" },
    { label: "Contact", href: "/customer/contact" },
    { label: "About Us", href: "/customer/about" },
  ];

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <span className="text-xl font-semibold tracking-wide">Flourish</span>
      </div>

      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <NavigationMenu>
          <NavigationMenuList className="space-x-6">
            {navItems.map((item) => (
              <NavigationMenuItem key={item.label}>
                <NavigationMenuLink asChild>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                    {item.label}
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>
            ))}
          </NavigationMenuList>
        </NavigationMenu>
      </div>

      {/* Mobile Hamburger */}
      <div className="flex items-center gap-4 md:hidden">
        <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </Button>
      </div>

      {/* User Info & Avatar */}
      <div className="hidden md:flex items-center gap-4">
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
                  src={user.image || "https://github.com/leerob.png"}
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

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-white shadow-md md:hidden z-50">
          <div className="flex flex-col gap-4 px-6 py-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className="text-gray-700 font-medium py-2 hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}>
                {item.label}
              </Link>
            ))}
            <div className="border-t border-gray-200 pt-4">
              <span className="block text-gray-500 text-sm mb-2">
                {user.name || user.username || "Admin"} ({user.role.toLowerCase()})
              </span>
              <Button
                variant="outline"
                className="w-full text-red-600 hover:bg-red-50"
                onClick={() => signOut({ callbackUrl: "/login" })}>
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
