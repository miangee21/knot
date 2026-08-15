//src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen flex items-center justify-center bg-background overflow-hidden">
      {/* Soft Backdrop tied to Theme Primary Color */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute left-1/2 top-20 -translate-x-1/2 w-150 h-75 bg-linear-to-tr from-primary/20 to-transparent rounded-full blur-3xl dark:from-primary/30" />
        <div className="absolute right-12 bottom-10 w-100 h-50 bg-linear-to-bl from-primary/10 to-transparent rounded-full blur-3xl dark:from-primary/20" />
      </div>

      {/* Form Container */}
      <div className="relative z-10 w-full max-w-100 px-4">{children}</div>
    </div>
  );
}
