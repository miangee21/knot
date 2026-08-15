//src/app/(dashboard)/layout.tsx
import * as React from "react";
import { Navbar } from "@/shared/components/navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background selection:bg-primary/20">
      {/* Imported Slim Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-1 w-full relative">
        {/* Subtle background glow for the dashboard area */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-200 h-75 bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10" />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
