//src/features/auth/components/SignupForm.tsx
"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { signupSchema, SignupFormData } from "../types";
import { useAuthActions } from "../hooks/useAuthActions";

export function SignupForm() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const { handleSignup } = useAuthActions();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignupFormData) => {
    setIsLoading(true);
    await handleSignup(data);
    setIsLoading(false);
  };

  return (
    <div className="w-full text-center bg-card/60 backdrop-blur-md border border-border/50 rounded-4xl px-8 py-10 shadow-2xl">
      <div className="mb-8">
        <h1 className="text-foreground text-3xl font-semibold tracking-tight">
          <span className="whitespace-nowrap">
            Create your account <span className="inline-block">✨</span>
          </span>
        </h1>

        <p className="text-muted-foreground text-sm mt-2 leading-relaxed">
          Join <span className="text-primary font-medium">Knot</span> and start
          organizing your storage
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Name Input */}
        <div>
          <div className="flex items-center w-full bg-background/50 ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-primary/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
            <User className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="text"
              placeholder="Full Name"
              className="w-full h-full bg-transparent text-foreground placeholder:text-muted-foreground/70 border-none outline-none text-sm px-2"
              disabled={isLoading}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-destructive text-xs text-left mt-1.5 ml-4">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Input */}
        <div>
          <div className="flex items-center w-full bg-background/50 ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-primary/60 h-12 rounded-full overflow-hidden pl-6 gap-2 transition-all">
            <Mail className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type="email"
              placeholder="Email address"
              className="w-full h-full bg-transparent text-foreground placeholder:text-muted-foreground/70 border-none outline-none text-sm px-2"
              disabled={isLoading}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-destructive text-xs text-left mt-1.5 ml-4">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Input */}
        <div>
          <div className="flex items-center w-full bg-background/50 ring-1 ring-border/50 focus-within:ring-2 focus-within:ring-primary/60 h-12 rounded-full overflow-hidden pl-6 pr-4 gap-2 transition-all">
            <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full h-full bg-transparent text-foreground placeholder:text-muted-foreground/70 border-none outline-none text-sm px-2"
              disabled={isLoading}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              disabled={isLoading}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {errors.password && (
            <p className="text-destructive text-xs text-left mt-1.5 ml-4">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold transition-all mt-2 shadow-lg shadow-primary/25 hover:shadow-primary/35 hover:-translate-y-px"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            "Create Account"
          )}
        </Button>

        {/* Toggle Link */}
        <div className="text-muted-foreground text-sm mt-3 pt-3 relative before:absolute before:top-0 before:left-0 before:right-0 before:h-px before:bg-[repeating-linear-gradient(90deg,hsl(var(--border))_0,hsl(var(--border))_8px,transparent_8px,transparent_14px)]">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-primary hover:text-primary/80 hover:underline font-semibold ml-1 transition-all"
          >
            Login
          </Link>
        </div>
      </form>
    </div>
  );
}
