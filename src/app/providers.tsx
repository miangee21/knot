//src/app/providers.tsx
"use client";

import * as React from "react";
import { ConvexAuthNextjsProvider } from "@convex-dev/auth/nextjs";
import { ConvexReactClient } from "convex/react";
import { ThemeProvider } from "@/features/theme/ThemeProvider";
import { TooltipProvider } from "@/shared/components/ui/tooltip";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConvexAuthNextjsProvider client={convex}>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
      >
        <TooltipProvider>{children}</TooltipProvider>
      </ThemeProvider>
    </ConvexAuthNextjsProvider>
  );
}
