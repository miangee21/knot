//src/app/page.tsx
import { redirect } from "next/navigation";
import { convexAuthNextjsToken } from "@convex-dev/auth/nextjs/server";

export default async function HomePage() {
  // Check if user is authenticated via Convex Server Token
  const isAuthenticated = await convexAuthNextjsToken();

  if (!isAuthenticated) {
    redirect("/login");
  }

  // If logged in, go straight to the dashboard
  redirect("/locations");
}
