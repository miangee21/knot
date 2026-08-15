//src/features/auth/hooks/useIsAdmin.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useIsAdmin() {
  const isAdmin = useQuery(api.appSettings.isCurrentUserAdmin);
  return { isAdmin: isAdmin ?? false, isLoading: isAdmin === undefined };
}
