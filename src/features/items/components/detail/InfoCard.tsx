//src/features/items/components/detail/InfoCard.tsx
"use client";

interface InfoCardProps {
  icon: any;
  label: string;
  value: string;
  prominent?: boolean;
}

export function InfoCard({
  icon: Icon,
  label,
  value,
  prominent = false,
}: InfoCardProps) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card px-3.5 py-3">
      <div className="flex items-center gap-3">
        <div className="flex h-8.5 w-8.5 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <Icon className="h-4 w-4" strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-muted-foreground">
            {label}
          </p>

          <p
            className={`mt-1 truncate font-semibold leading-tight text-foreground ${
              prominent ? "text-[14px]" : "text-[12px]"
            }`}
            title={value}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}
