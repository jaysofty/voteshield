import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { StateProps } from "@/types/state";

type ErrorStateProps = StateProps & {
  onRetry?: () => void;
};

export function ErrorState({
  title = "We couldn't load this data.",
  description = "Please try again in a moment.",
  onRetry,
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/20">
      <CardContent className="p-8 text-center">
        <AlertTriangle className="mx-auto size-8 text-destructive" />

        <p className="mt-3 font-medium">{title}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>

        {onRetry && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={onRetry}
          >
            Try again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}