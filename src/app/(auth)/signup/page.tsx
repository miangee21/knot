//src/app/(auth)/signup/page.tsx
import { SignupForm } from "@/features/auth/components/SignupForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account — Knot",
  description:
    "Create your Knot account and start organizing, tracking, and managing your personal storage index.",
};

export default function SignupPage() {
  return <SignupForm />;
}
