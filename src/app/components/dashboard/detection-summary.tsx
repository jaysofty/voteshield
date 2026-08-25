import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { DashboardData } from "@/types/dashboard-types";

interface DetectionSummaryProps {
  data: DashboardData | null;
}

export function DetectionSummary({
  data,
}: DetectionSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detection summary</CardTitle>

        <p className="text-sm text-muted-foreground">
          Why attempts are being flagged.
        </p>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <DetectionItem
            title="Duplicate card usage"
            description="A voter card was used after a completed attempt."
            count={data?.duplicateCardAlerts ?? 0}
          />

          <DetectionItem
            title="Unusual device activity"
            description="Multiple voter identities were associated with one device."
            count={data?.deviceAlerts ?? 0}
          />

          <DetectionItem
            title="Resolved investigations"
            description="Previously detected events that have been reviewed and resolved."
            count={data?.resolvedAlerts ?? 0}
            resolved
          />
        </div>

        <Button
          variant="outline"
          className="mt-6 w-full"
   
        >
          <Link href="/alerts">
            View all alerts
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function DetectionItem({
  title,
  description,
  count,
  resolved = false,
}: {
  title: string;
  description: string;
  count: number;
  resolved?: boolean;
}) {
  return (
    <div className="flex gap-3">
      <div
        className={`mt-1 size-2 shrink-0 rounded-full ${
          resolved ? "bg-emerald-500" : "bg-red-500"
        }`}
      />

      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{title}</p>

          <Badge variant="secondary">{count}</Badge>
        </div>

        <p className="mt-1 text-xs leading-5 text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}