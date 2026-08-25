"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Smartphone,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import type { AlertData } from "@/types/alerts";

import { EmptyState } from "@/components/states/empty-state";
import { ErrorState } from "@/components/states/error-state";
import { LoadingState } from "@/components/states/loading-state";

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadAlerts() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/alerts");

        if (!response.ok) {
          throw new Error("Failed to load alerts");
        }

        const data = await response.json();

        setAlerts(data.alerts ?? []);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadAlerts();
  }, []);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="destructive">Security monitoring</Badge>

          <span className="text-xs text-muted-foreground">
            Graph detection
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Alerts
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Review suspicious voting activity detected from relationships
          across the VoteShield graph.
        </p>
      </div>

      {/* Summary */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {/* Active alerts */}
        <Card>
          <CardContent className="p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
              <ShieldAlert className="size-4" />
            </div>

            <p className="mt-4 text-2xl font-bold">
              {loading ? "—" : alerts.length}
            </p>

            <p className="mt-1 text-sm font-medium">
              Active alerts
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Detection events requiring review
            </p>
          </CardContent>
        </Card>

        {/* Duplicate card alerts */}
        <Card>
          <CardContent className="p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600">
              <AlertTriangle className="size-4" />
            </div>

            <p className="mt-4 text-2xl font-bold">
              {loading
                ? "—"
                : alerts.filter(
                    (alert) =>
                      alert.type === "DUPLICATE_CARD_USAGE",
                  ).length}
            </p>

            <p className="mt-1 text-sm font-medium">
              Duplicate card alerts
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Repeated voter card usage
            </p>
          </CardContent>
        </Card>

        {/* Device alerts */}
        <Card>
          <CardContent className="p-5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600">
              <Smartphone className="size-4" />
            </div>

            <p className="mt-4 text-2xl font-bold">
              {loading
                ? "—"
                : alerts.filter(
                    (alert) =>
                      alert.type === "UNUSUAL_DEVICE_ACTIVITY",
                  ).length}
            </p>

            <p className="mt-1 text-sm font-medium">
              Device alerts
            </p>

            <p className="mt-1 text-xs text-muted-foreground">
              Multiple identities from one device
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detection events */}
      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Detection events</CardTitle>

            <p className="text-sm text-muted-foreground">
              Suspicious relationships detected in the voting graph.
            </p>
          </CardHeader>

          <CardContent>
            {/* Loading */}
            {loading && <LoadingState />}

            {/* Error */}
            {!loading && error && (
              <ErrorState
                title="Unable to load alerts."
                description="VoteShield could not connect to the monitoring database. Please try again."
              />
            )}

            {/* Empty */}
            {!loading && !error && alerts.length === 0 && (
              <EmptyState
                title="No active alerts"
                description="VoteShield has not detected any suspicious activity requiring review."
              />
            )}

            {/* Alerts */}
            {!loading && !error && alerts.length > 0 && (
              <div className="space-y-4">
                {alerts.map((alert) => (
                  <div
                    key={alert.id}
                    className="rounded-xl border p-5 transition-colors hover:bg-muted/30"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                      {/* Alert information */}
                      <div className="flex gap-4">
                        <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                          <ShieldAlert className="size-5" />
                        </div>

                        <div className="min-w-0">
                          {/* Title + severity */}
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="font-semibold">
                              {formatAlertType(alert.type)}
                            </h3>

                            <Badge
                              variant={
                                alert.severity === "HIGH"
                                  ? "destructive"
                                  : "secondary"
                              }
                            >
                              {alert.severity}
                            </Badge>
                          </div>

                          {/* Message */}
                          <p className="mt-2 text-sm text-muted-foreground">
                            {alert.message}
                          </p>

                          {/* Graph relationships */}
                          <div className="mt-4 grid gap-2 text-xs sm:grid-cols-2">
                            <div>
                              <span className="text-muted-foreground">
                                Voter
                              </span>

                              <p className="font-medium">
                                {alert.voterName}
                              </p>
                            </div>

                            <div>
                              <span className="text-muted-foreground">
                                Voter card
                              </span>

                              <p className="font-medium">
                                {alert.voterCardId}
                              </p>
                            </div>

                            <div>
                              <span className="text-muted-foreground">
                                Voting attempt
                              </span>

                              <p className="font-medium">
                                {alert.attemptId}
                              </p>
                            </div>

                            <div>
                              <span className="text-muted-foreground">
                                Polling unit
                              </span>

                              <p className="font-medium">
                                {alert.pollingUnit}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Investigate */}
                      <Link
                        href={`/investigate?attemptId=${encodeURIComponent(
                          alert.attemptId,
                        )}`}
                        className="inline-flex shrink-0 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                      >
                        Investigate

                        <ArrowRight className="ml-2 size-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function formatAlertType(type: string) {
  return type
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}