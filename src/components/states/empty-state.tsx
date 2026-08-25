import { Inbox } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { StateProps } from "@/types/state";

export function EmptyState({
  title = "No data available",
  description = "There are no records to display.",
}: StateProps) {
  return (
    <Card>
      <CardContent className="p-8 text-center">
        <Inbox className="mx-auto size-8 text-muted-foreground" />

        <p className="mt-3 font-medium">{title}</p>

        <p className="mt-1 text-sm text-muted-foreground">
          {description}
        </p>
      </CardContent>
    </Card>
  );
}