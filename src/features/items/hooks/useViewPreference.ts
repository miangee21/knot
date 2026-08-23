//src/features/items/hooks/useViewPreference.ts
"use client";

import { useState, useEffect } from "react";

export type ViewMode = "grid" | "list";

export function useViewPreference() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("knot-view-mode") as ViewMode;
    if (saved === "grid" || saved === "list") {
      setViewMode(saved);
    }
  }, []);

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem("cinevault-view-mode", mode);
  };

  return { viewMode, setViewMode: toggleViewMode };
}
