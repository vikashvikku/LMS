import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SearchX, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-background text-foreground">
      <Card className="w-full max-w-md text-center shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted/50 rounded-full">
              <SearchX className="h-12 w-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle className="text-4xl font-extrabold tracking-tight">404</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-lg text-muted-foreground font-medium">
            Page not found
          </p>
          <p className="text-sm text-muted-foreground/80 pb-2">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Button asChild className="w-full" size="lg">
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Go to Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
