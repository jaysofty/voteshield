import {
  Activity,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

type VotingAttempt = {
  id: string;
  status: string;
  voterName: string;
  voterCardId: string;
  pollingUnit: string;
};

interface RecentVotingActivityProps {
  attempts: VotingAttempt[];
  loading: boolean;
}

export function RecentVotingActivity({
  attempts,
  loading,
}: RecentVotingActivityProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Recent voting activity</CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Latest attempts recorded by VoteShield.
            </p>
          </div>

          <Activity className="size-5 text-muted-foreground" />
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : attempts.length === 0 ? (
          <div className="py-12 text-center">
            <Activity className="mx-auto size-8 text-muted-foreground" />

            <p className="mt-3 text-sm font-medium">
              No voting attempts
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Activity will appear here when attempts are recorded.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {attempts.map((attempt) => (
              <VotingAttemptRow
                key={attempt.id}
                attempt={attempt}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function VotingAttemptRow({
  attempt,
}: {
  attempt: VotingAttempt;
}) {
  const flagged = attempt.status === "FLAGGED";

  return (
    <div className="flex items-center justify-between rounded-xl border p-4">
      <div className="flex items-center gap-3">
        <div
          className={`flex size-9 items-center justify-center rounded-lg ${
            flagged
              ? "bg-red-500/10 text-red-600"
              : "bg-emerald-500/10 text-emerald-600"
          }`}
        >
          {flagged ? (
            <ShieldAlert className="size-4" />
          ) : (
            <CheckCircle2 className="size-4" />
          )}
        </div>

        <div>
          <p className="text-sm font-medium">
            {attempt.voterName}
          </p>

          <p className="text-xs text-muted-foreground">
            {attempt.voterCardId} · {attempt.pollingUnit}
          </p>
        </div>
      </div>

      <div className="text-right">
        <Badge variant={flagged ? "destructive" : "secondary"}>
          {attempt.status}
        </Badge>

        <p className="mt-1 text-[11px] text-muted-foreground">
          {attempt.id}
        </p>
      </div>
    </div>
  );
}