//src/shared/components/navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, ChevronDown, ShieldCheck } from "lucide-react";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "../../../convex/_generated/api";
import { ThemeToggle } from "@/features/theme/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/shared/components/ui/avatar";
import { toast } from "sonner";

export function Navbar() {
  const pathname = usePathname();
  const { signOut } = useAuthActions();

  // Fetch user data from the convex function
  const user = useQuery(api.users.getCurrentUser);
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  const navLinks = [
    { name: "Locations", path: "/locations" },
    { name: "Browse", path: "/browse" },
    { name: "Categories", path: "/categories" },
    { name: "Risk", path: "/risk" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur-md shadow-sm h-12 flex items-center">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 w-full flex items-center justify-between">
        {/* Left: Brand Name */}
        <Link
          href="/locations"
          className="flex items-center gap-2.5 group transition-transform hover:-translate-y-px"
        >
          <div className="relative flex items-center justify-center w-7 h-7 rounded-lg bg-linear-to-br from-primary to-primary/80 shadow-md shadow-primary/30 group-hover:shadow-primary/50 transition-all">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="w-4 h-4 text-primary-foreground"
            >
              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
              <path d="M15 2H9a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1Z"></path>
            </svg>
          </div>
          <span className="font-black text-xl tracking-tighter bg-linear-to-r from-foreground via-foreground/90 to-primary/80 bg-clip-text text-transparent">
            Knot.
          </span>
        </Link>

        {/* Center: Navigation Links  */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => {
            const isActive = pathname.startsWith(link.path);
            return (
              <Link
                key={link.path}
                href={link.path}
                className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right: Theme Toggle & User Avatar Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger className="outline-none focus-visible:ring-2 focus-visible:ring-primary ring-offset-2 ring-offset-background transition-all ml-1 appearance-none bg-transparent border-none p-0 cursor-pointer">
              <div className="flex items-center gap-1.5 p-1 pr-2 rounded-full hover:bg-muted/80 transition-colors border border-transparent hover:border-border/50">
                <Avatar className="h-8 w-8 bg-primary/10 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium text-xs">
                    {user?.name ? initials : null}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="w-4 h-4 text-foreground/80" />
              </div>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              className="w-70 translate-x-1 rounded-3xl border-border bg-card text-card-foreground shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] p-1.5"
            >
              {/* Header Section: Avatar + Name/Email side by side */}
              <div className="flex items-center gap-3 px-2 py-2 text-sm font-normal">
                <Avatar className="h-11 w-11 bg-primary/10 border border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold text-lg">
                    {user?.name ? initials : null}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1.5 overflow-hidden">
                  <p className="text-[15px] font-bold leading-none text-foreground truncate">
                    {user?.name || "User"}
                  </p>
                  <p className="text-[13px] leading-none text-muted-foreground font-medium truncate">
                    {user?.email}
                  </p>
                </div>
              </div>

              {/* Solid divider line */}
              <DropdownMenuSeparator className="bg-primary/40 h-px my-2 -mx-1.5 w-auto" />

              {/* Admin Settings Link inside Dropdown */}
              <Link
                href="/admin/settings"
                className="w-full outline-none block"
              >
                <DropdownMenuItem className="rounded-xl cursor-pointer py-2 px-3 focus:bg-muted mt-1 text-foreground font-semibold">
                  <ShieldCheck className="mr-3 h-4.5 w-4.5 text-foreground/80" />
                  <span className="text-[14px]">Admin Settings</span>
                </DropdownMenuItem>
              </Link>

              {/* Logout Button  */}
              <DropdownMenuItem
                onClick={async () => {
                  try {
                    await signOut();
                    toast.success("Logged out successfully", {
                      description: "You have been securely signed out of Knot.",
                    });
                  } catch {
                    toast.error("Logout failed", {
                      description:
                        "Something went wrong while signing you out. Please try again.",
                    });
                  }
                }}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400 focus:bg-red-500/10 rounded-xl cursor-pointer py-2 px-3 mt-1 font-semibold"
              >
                <LogOut className="mr-3 h-4.5 w-4.5" />
                <span className="text-[14px]">Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
