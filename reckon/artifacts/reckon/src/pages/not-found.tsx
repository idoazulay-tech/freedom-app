import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground text-center p-8">
      <div className="font-syne text-9xl font-extrabold text-primary opacity-20">404</div>
      <h1 className="mt-4 font-syne text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-muted-foreground max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link href="/">
        <Button className="mt-8 bg-primary hover:bg-primary/90">
          Return Home
        </Button>
      </Link>
    </div>
  );
}
