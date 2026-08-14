//src/app/page.tsx
import { Button } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <>
      <div className="text-4xl text-blue-950 font-bold justify-center items-center flex flex-col min-h-screen">
        <p>hey this is main page</p>
        <Button variant={"secondary"}>Click Me</Button>
      </div>
    </>
  );
}
