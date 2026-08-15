//src/shared/components/EmptyState.tsx
import * as React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 min-h-100 border-2 border-dashed border-border/50 rounded-4xl bg-card/30 backdrop-blur-sm",
        className,
      )}
    >
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-5 border border-primary/20 shadow-inner">
        <Icon className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-bold text-foreground tracking-tight">
        {title}
      </h3>
      <p className="text-muted-foreground mt-2 max-w-sm text-sm leading-relaxed">
        {description}
      </p>
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}
