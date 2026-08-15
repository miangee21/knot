// src/app/(dashboard)/locations/page.tsx

export default function LocationsPage() {
  return (
    <div className="flex items-center justify-center bg-background px-6 py-16">
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-foreground">
          Welcome to <span className="text-primary font-bold">Locations</span>{" "}
          <span className="inline-block">✨</span>
        </h1>

        <p className="mt-4 text-muted-foreground text-sm sm:text-base">
          Your storage locations will appear here.
        </p>
      </div>
    </div>
  );
}
