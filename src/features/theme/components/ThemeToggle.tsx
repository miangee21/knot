//src/features/theme/components/ThemeToggle.tsx
"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/shared/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    queueMicrotask(() => setMounted(true));
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" aria-label="Toggle theme">
        <span className="w-[1.2rem] h-[1.2rem]" />
      </Button>
    );
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      aria-label="Toggle theme"
      className="rounded-full hover:bg-muted/80"
    >
      {theme === "dark" ? (
        <Moon className="h-[1.2rem] w-[1.2rem] text-foreground" />
      ) : (
        <Sun className="h-[1.2rem] w-[1.2rem] text-foreground" />
      )}
    </Button>
  );
}
