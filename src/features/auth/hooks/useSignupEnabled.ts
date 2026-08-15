//src/features/auth/hooks/useSignupEnabled.ts
"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";

export function useSignupEnabled() {
  const enabled = useQuery(api.appSettings.getSignupEnabled);
  return { signupEnabled: enabled ?? true, isLoading: enabled === undefined };
}
