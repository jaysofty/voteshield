import { Card, CardContent } from "@/components/ui/card";

export function LoadingState() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((item) => (
        <Card key={item}>
          <CardContent className="p-6">
            <div className="h-5 w-48 animate-pulse rounded bg-muted" />

            <div className="mt-3 h-4 w-72 animate-pulse rounded bg-muted" />

            <div className="mt-4 h-12 w-full animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}