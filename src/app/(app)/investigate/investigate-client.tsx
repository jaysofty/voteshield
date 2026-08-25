"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  ShieldAlert,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";

import { useUpdateAlertStatus } from "@/hooks/useAlerts";
import { useInvestigation } from "@/hooks/useInvestigations";

type AlertStatus = "OPEN" | "INVESTIGATING" | "RESOLVED";

export default function InvestigateClient() {
  const searchParams = useSearchParams();

  const initialAttempt = searchParams.get("attemptId") ?? "";

  const { updateStatusAsync, updating } = useUpdateAlertStatus();

  const {
    investigate,
    investigation,
    loading,
    error,
  } = useInvestigation();

  const [attemptId, setAttemptId] = useState("");

  const [alertStatus, setAlertStatus] =
    useState<AlertStatus | null>(null);

  /*
    Automatically investigate when arriving from:
   
    /investigate?attemptId=VA-003
   
    The URL is the source of truth for the initial attempt.
   */
  useEffect(() => {
    if (!initialAttempt) {
      return;
    }

    investigate(initialAttempt);
  }, [initialAttempt, investigate]);

  /*
    The locally updated status takes priority over
    the status returned by the API.
   */
  const currentAlertStatus =
    alertStatus ?? investigation?.alert?.status ?? null;

  const handleInvestigate = () => {
    const trimmedId = attemptId.trim();

    if (!trimmedId || loading) {
      return;
    }

    setAlertStatus(null);

    investigate(trimmedId);
  };

  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter" && !loading) {
      handleInvestigate();
    }
  };

  /*
    OPEN INVESTIGATING
   */
  const handleStartInvestigation = async () => {
    if (!investigation?.alert) {
      return;
    }

    try {
      const updatedAlert = await updateStatusAsync({
        alertId: investigation.alert.id,
        status: "INVESTIGATING",
      });

      setAlertStatus(updatedAlert.status as AlertStatus);
    } catch {
      // Error toast handled by useUpdateAlertStatus.
    }
  };

  /*
    INVESTIGATING -- RESOLVED
   */
  const handleResolveInvestigation = async () => {
    if (!investigation?.alert) {
      return;
    }

    try {
      const updatedAlert = await updateStatusAsync({
        alertId: investigation.alert.id,
        status: "RESOLVED",
      });

      setAlertStatus(updatedAlert.status as AlertStatus);
    } catch {
      // Error toast handled by useUpdateAlertStatus.
    }
  };

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">
            Graph investigation
          </Badge>

          <span className="text-xs text-muted-foreground">
            Relationship analysis
          </span>
        </div>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Investigate activity
        </h1>

        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Trace a voting attempt through its connected voter, card,
          device, polling unit, and detection events.
        </p>
      </div>

      {/* Search */}
      <Card className="mt-8">
        <CardContent className="p-5">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

              <Input
                value={attemptId}
                onChange={(event) => {
                  setAttemptId(event.target.value);
                }}
                onKeyDown={handleKeyDown}
                placeholder="Enter voting attempt ID e.g. VA-003"
                className="pl-9"
              />
            </div>

            <Button
              onClick={handleInvestigate}
              disabled={loading}
              className="sm:w-32"
            >
              {loading ? "Searching..." : "Investigate"}
            </Button>
          </div>

          <p className="mt-2 text-xs text-muted-foreground">
            Try VA-001, VA-002, VA-003 or VA-004.
          </p>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="mt-6 border-destructive/30">
          <CardContent className="flex items-center gap-3 p-5">
            <AlertTriangle className="size-5 shrink-0 text-destructive" />

            <p className="text-sm text-destructive">
              {error}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-72 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {/* Investigation */}
      {!loading && investigation && (
        <div className="mt-8 space-y-6">
          {/* Voting Attempt Status */}
          <Card
            className={
              investigation.attempt.status === "FLAGGED"
                ? "border-red-500/30"
                : "border-emerald-500/30"
            }
          >
            <CardContent className="p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex size-10 items-center justify-center rounded-lg ${
                      investigation.attempt.status === "FLAGGED"
                        ? "bg-red-500/10 text-red-600"
                        : "bg-emerald-500/10 text-emerald-600"
                    }`}
                  >
                    {investigation.attempt.status === "FLAGGED" ? (
                      <ShieldAlert className="size-5" />
                    ) : (
                      <CheckCircle2 className="size-5" />
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">
                      Voting attempt
                    </p>

                    <p className="font-semibold">
                      {investigation.attempt.id}
                    </p>
                  </div>
                </div>

                <Badge
                  variant={
                    investigation.attempt.status === "FLAGGED"
                      ? "destructive"
                      : "secondary"
                  }
                >
                  {investigation.attempt.status}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Graph Entities */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Voter */}
            <Card>
              <CardHeader>
                <CardTitle>Voter</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <Detail
                    label="Name"
                    value={investigation.voter.name}
                  />

                  <Detail
                    label="Voter ID"
                    value={investigation.voter.id}
                  />

                  <Detail
                    label="Status"
                    value={investigation.voter.status}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Voter Card */}
            <Card>
              <CardHeader>
                <CardTitle>Voter card</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <Detail
                    label="Card ID"
                    value={investigation.voterCard.id}
                  />

                  <Detail
                    label="Status"
                    value={investigation.voterCard.status}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Polling Unit */}
            <Card>
              <CardHeader>
                <CardTitle>Polling unit</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <Detail
                    label="Location"
                    value={investigation.pollingUnit.name}
                  />

                  <Detail
                    label="Unit ID"
                    value={investigation.pollingUnit.id}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Device */}
            <Card>
              <CardHeader>
                <CardTitle>Voting device</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-4">
                  <Detail
                    label="Device ID"
                    value={investigation.device?.id ?? "Unknown"}
                  />

                  <Detail
                    label="Device name"
                    value={investigation.device?.name ?? "Unknown"}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detection Event */}
          {investigation.alert && (
            <Card className="border-red-500/30">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <ShieldAlert className="size-5 text-red-600" />

                    Detection event
                  </CardTitle>

                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">
                      {investigation.alert.severity}
                    </Badge>

                    <Badge variant="secondary">
                      {currentAlertStatus}
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <p className="text-sm leading-6 text-muted-foreground">
                  {investigation.alert.message}
                </p>

                {/* Why this matters */}
                <div className="mt-4 rounded-lg bg-red-500/5 p-4">
                  <p className="text-sm font-medium">
                    Why this matters
                  </p>

                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    VoteShield detected a suspicious relationship
                    connected to this voting attempt. Investigators
                    can use the linked voter, voter card, device and
                    polling unit to determine whether the activity
                    requires further review.
                  </p>
                </div>

                {/* OPEN */}
                {currentAlertStatus === "OPEN" && (
                  <Button
                    className="mt-5"
                    onClick={handleStartInvestigation}
                    disabled={updating}
                  >
                    {updating
                      ? "Starting investigation..."
                      : "Start investigation"}
                  </Button>
                )}

                {/* INVESTIGATING */}
                {currentAlertStatus === "INVESTIGATING" && (
                  <div className="mt-5">
                    <div className="rounded-lg border border-blue-500/20 bg-blue-500/5 p-4">
                      <p className="text-sm font-medium text-blue-600">
                        Investigation in progress
                      </p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        This alert is currently being reviewed by an
                        investigator.
                      </p>
                    </div>

                    <Button
                      className="mt-4"
                      onClick={handleResolveInvestigation}
                      disabled={updating}
                    >
                      {updating
                        ? "Resolving..."
                        : "Resolve investigation"}
                    </Button>
                  </div>
                )}

                {/* RESOLVED */}
                {currentAlertStatus === "RESOLVED" && (
                  <div className="mt-5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 size-5 text-emerald-600" />

                      <div>
                        <p className="text-sm font-medium text-emerald-600">
                          Investigation resolved
                        </p>

                        <p className="mt-1 text-xs text-muted-foreground">
                          This detection event has been reviewed
                          and resolved.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium">
        {value}
      </p>
    </div>
  );
}