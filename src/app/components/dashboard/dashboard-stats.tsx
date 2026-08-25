import {
  Activity,
  AlertTriangle,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import type { DashboardData } from "@/types/dashboard-types";

interface DashboardStatsProps {
  data: DashboardData | null;
}

export function DashboardStats({ data }: DashboardStatsProps) {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Registered voters"
        value={data?.voters}
        icon={Users}
        description="Tracked in graph"
      />

      <StatCard
        title="Voting attempts"
        value={data?.votingAttempts}
        icon={Activity}
        description="Recorded attempts"
      />

      <StatCard
        title="Flagged attempts"
        value={data?.suspiciousAttempts}
        icon={ShieldAlert}
        description="Require investigation"
        danger
      />

      <StatCard
        title="Active alerts"
        value={data?.activeAlerts}
        icon={AlertTriangle}
        description="Detection events"
        danger
      />
    </div>
  );
}

interface StatCardProps {
  title: string;
  value?: number;
  icon: React.ElementType;
  description: string;
  danger?: boolean;
}

function StatCard({
  title,
  value,
  icon: Icon,
  description,
  danger,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${
            danger
              ? "bg-red-500/10 text-red-600"
              : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-4" />
        </div>

        <div className="mt-4">
          {value === undefined ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <p className="text-2xl font-bold">{value}</p>
          )}

          <p className="mt-1 text-sm font-medium">
            {title}
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}