//src/app/(auth)/login/page.tsx
import { LoginForm } from "@/features/auth/components/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In — Knot",
  description:
    "Securely log in to your Knot account to access and manage your personal storage index.",
};

export default function LoginPage() {
  return <LoginForm />;
}
