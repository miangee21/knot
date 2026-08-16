//src/app/(dashboard)/browse/[[...segments]]/page.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Browse Data — Knot",
  description:
    "Explore your indexed files and folders through a structured view of your personal data.",
};

export default function BrowsePage() {
  return (
    <div className="flex items-center justify-center h-[50vh] text-muted-foreground font-medium">
      Browse Feature Coming Soon 🚀
    </div>
  );
}
