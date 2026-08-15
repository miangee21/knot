//src/app/(dashboard)/admin/settings/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useIsAdmin } from "@/features/auth/hooks/useIsAdmin";
import { useSignupEnabled } from "@/features/auth/hooks/useSignupEnabled";
import { Switch } from "@/shared/components/ui/switch";
import { ShieldAlert, ShieldCheck, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const router = useRouter();
  const { isAdmin, isLoading: checkingAdmin } = useIsAdmin();
  const { signupEnabled, isLoading: checkingSignup } = useSignupEnabled();
  const setSignupEnabled = useMutation(api.appSettings.setSignupEnabled);

  // Security Redirect: Boot non-admins back to dashboard
  useEffect(() => {
    if (!checkingAdmin && !isAdmin) {
      router.push("/locations");
    }
  }, [isAdmin, checkingAdmin, router]);

  // Loading State
  if (checkingAdmin || checkingSignup) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 animate-spin text-primary/60" />
      </div>
    );
  }

  // Prevent UI flash before redirect happens
  if (!isAdmin) return null;

  const handleToggle = async (checked: boolean) => {
    try {
      await setSignupEnabled({ enabled: checked });
      toast.success(
        checked ? "Public signups enabled" : "Public signups disabled",
        {
          description: checked
            ? "Anyone can now create a new account on your Knot instance."
            : "New user registrations are now completely blocked.",
        },
      );
    } catch (error) {
      toast.error("Update failed", {
        description: "Could not update the signup settings. Please try again.",
      });
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-in fade-in-50 duration-500 pt-4">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
          <ShieldCheck className="w-9 h-9 text-primary" />
          Admin Settings
        </h1>
        <p className="text-muted-foreground mt-3 text-sm sm:text-base">
          Manage global application security and hosting preferences.
        </p>
      </div>

      {/* Settings Card */}
      <div className="bg-card border border-border/60 rounded-4xl p-6 sm:p-8 shadow-xl shadow-black/5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <h3 className="font-semibold text-lg flex items-center gap-2 text-foreground">
              <Users className="w-5 h-5 text-primary" />
              Allow Public Signups
            </h3>
            <p className="text-sm text-muted-foreground max-w-md leading-relaxed">
              Enable or disable the ability for new users to register. Turn this
              off if you are self-hosting and want to keep your storage index
              private.
            </p>
          </div>

          <div className="shrink-0">
            <Switch
              checked={signupEnabled}
              onCheckedChange={handleToggle}
              className="data-[state=checked]:bg-primary scale-110"
              aria-label="Toggle public signups"
            />
          </div>
        </div>

        {/* Warning Alert when closed */}
        {!signupEnabled && (
          <div className="mt-8 flex items-center gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive font-medium animate-in slide-in-from-top-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            Signups are currently closed. Your Knot instance is fully private.
          </div>
        )}
      </div>
    </div>
  );
}
