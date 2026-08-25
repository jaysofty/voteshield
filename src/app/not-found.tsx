import Link from "next/link";
import {
  ArrowLeft,
  BriefcaseBusiness,

} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <Card className="w-full max-w-md border-none shadow-sm">
        <CardContent className="p-8 text-center sm:p-10">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <BriefcaseBusiness className="size-7" />
          </div>

          <p className="mt-6 text-sm font-medium text-primary">
            Page not found
          </p>

          <h1 className="mt-2 text-3xl font-semibold tracking-tight">
            This page hasnt been built yet
          </h1>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Were still building this part of VoteSield.
            Head back to your dashboard or explore available
            features.
          </p>

          <Link
            href="/dashboard"
            className="mt-6 inline-flex items-center text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="mr-1.5 size-4" />
            Return home
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}