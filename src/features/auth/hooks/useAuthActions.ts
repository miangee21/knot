//src/features/auth/hooks/useAuthActions.ts
"use client";

import { useAuthActions as useConvexAuthActions } from "@convex-dev/auth/react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { LoginFormData, SignupFormData } from "../types";

export function useAuthActions() {
  const { signIn } = useConvexAuthActions();
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    try {
      await signIn("password", { ...data, flow: "signIn" });
      toast.success("Welcome back!", {
        description: "You have successfully logged in.",
      });
      router.push("/locations");
    } catch (error) {
      toast.error("Login Failed", {
        description: "Invalid email or password. Please try again.",
      });
    }
  };

  const handleSignup = async (data: SignupFormData) => {
    try {
      await signIn("password", { ...data, flow: "signUp" });
      toast.success("Account created successfully!", {
        description: "Welcome to Knot.",
      });
      router.push("/locations");
    } catch (error: any) {
      const errorMsg = error?.message?.toLowerCase() || "";
      let description = "Please check your details and try again.";

      if (errorMsg.includes("already in use") || errorMsg.includes("exists")) {
        description = "This email is already in use. Please log in instead.";
      } else if (
        errorMsg.includes("invalid email") ||
        errorMsg.includes("format")
      ) {
        description = "The email address provided is invalid.";
      } else if (errorMsg.includes("password")) {
        description = "Your password does not meet the requirements.";
      } else {
        description =
          error instanceof Error ? error.message : "Registration failed.";
      }

      toast.error("Signup Failed", { description });
    }
  };

  return { handleLogin, handleSignup };
}
