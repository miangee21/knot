//src/app/not-found.tsx
"use client";

import Link from "next/link";
import { FolderSearch, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Background Soft Glow Effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-primary/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      <div className="text-center px-6 max-w-2xl relative z-10 space-y-8">
        {/* Floating Icon */}
        <div className="relative w-24 h-24 mx-auto mb-6 flex items-center justify-center">
          <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping opacity-75 duration-3000" />
          <div className="relative bg-card border-2 border-primary/30 w-full h-full rounded-full flex items-center justify-center shadow-xl shadow-primary/20">
            <FolderSearch className="w-10 h-10 text-primary" />
          </div>
        </div>

        {/* 404 Header */}
        <div className="space-y-3">
          <h1 className="text-[8rem] font-black leading-none tracking-tighter bg-linear-to-br from-foreground via-foreground/80 to-primary text-transparent bg-clip-text select-none drop-shadow-sm">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
            Dead End Reached.
          </h2>
          <p className="text-muted-foreground text-base sm:text-lg max-w-lg mx-auto">
            The folder or file you are looking for doesn&apos;t exist in the
            index, or it might have been moved.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-12 px-6 rounded-full border-border/60 hover:bg-muted font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Link href="/locations" className="w-full sm:w-auto outline-none">
            <div className="inline-flex items-center justify-center w-full h-12 px-6 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-lg shadow-primary/25 hover:-translate-y-px transition-all cursor-pointer">
              <Home className="w-4 h-4 mr-2" />
              Back to Dashboard
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
