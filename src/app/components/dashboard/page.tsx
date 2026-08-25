"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { DashboardData } from "@/types/dashboard-types";
import { ErrorState } from "@/components/states/error-state";
import { RecordVotingAttempt } from "../voting/record-voting-attempt";
import { DashboardStats } from "./dashboard-stats";
import { DetectionSummary } from "./detection-summary";
import { RecentVotingActivity } from "./recent-voting-activity";



export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError(false);

        const response = await fetch("/api/dashboard", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load dashboard");
        }

        const result: DashboardData = await response.json();

        setData(result);
      } catch (error) {
        console.error(error);
        setError(true);
      }
    }

    loadDashboard();
  }, []);

  if (error) {
    return (
      <div className="p-6 lg:p-8">
        <ErrorState
          title="Unable to load VoteShield"
          description="We couldn't connect to the monitoring database."
        />
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              Election integrity
            </Badge>

            <span className="text-xs text-muted-foreground">
              Live monitoring
            </span>
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Integrity overview
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            Monitor voting activity and investigate suspicious
            relationships.
          </p>
        </div>

        <Button >
          <Link href="/investigate">
            Investigate activity
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <DashboardStats data={data} />

      {/* Main content */}
      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <RecentVotingActivity
          attempts={data?.recentAttempts ?? []}
          loading={!data}
        />

        <DetectionSummary data={data} />
      </div>

      {/* Record attempt */}
      <div className="mt-6">
        <RecordVotingAttempt />
      </div>
    </div>
  );
}