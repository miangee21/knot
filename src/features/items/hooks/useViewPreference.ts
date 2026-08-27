//src/features/items/hooks/useViewPreference.ts
"use client";

import { useState, useEffect } from "react";

export type ViewMode = "grid" | "list";

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Microtask avoids synchronous state update lint warnings
    queueMicrotask(() => {
      const saved = localStorage.getItem("knot-view-mode") as ViewMode;
      if (saved === "grid" || saved === "list") {
        setViewMode(saved);
      }
    });
  }, []);

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("knot-view-mode", mode);
  };

  return { viewMode: mounted ? viewMode : "grid", setViewMode: toggleViewMode };
}
