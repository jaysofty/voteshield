"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  CheckCircle2,
  Fingerprint,
  Loader2,
  MapPin,
  Smartphone,
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

import { useCreateVotingAttempt } from "@/hooks/useVotingAttempts";

import type {
    Device,
    PollingUnit,
  RecordVotingAttemptProps,
  VotingAttemptResult,
} from "@/types/vote-attempts";

// type PollingUnit = {
//   id: string;
//   name: string;
//   ward?: string | null;
// };

// type Device = {
//   id: string;
//   name: string;
//   status?: string | null;
// };

export function RecordVotingAttempt({
  initialVoterCardId = "",
  initialPollingUnitId = "",
}: RecordVotingAttemptProps) {
  /*
   * ---------------------------------------------------------
   * Form state
   * ---------------------------------------------------------
   */

  const [voterCardId, setVoterCardId] =
    useState(initialVoterCardId);

  const [pollingUnitId, setPollingUnitId] =
    useState(initialPollingUnitId);

  const [deviceId, setDeviceId] = useState("");

  const [result, setResult] =
    useState<VotingAttemptResult | null>(null);

  /*
   * ---------------------------------------------------------
   * Voting options
   * ---------------------------------------------------------
   */

  const [pollingUnits, setPollingUnits] =
    useState<PollingUnit[]>([]);

  const [devices, setDevices] =
    useState<Device[]>([]);

  const [loadingOptions, setLoadingOptions] =
    useState(true);

  const [optionsError, setOptionsError] =
    useState<string | null>(null);

  /*
   * ---------------------------------------------------------
   * Mutation
   * ---------------------------------------------------------
   */

  const { createAttempt, creating } =
    useCreateVotingAttempt();

  /*
   * ---------------------------------------------------------
   * Load polling units + devices
   *
   * This effect is correct because it synchronizes the
   * component with the external API/database.
   * ---------------------------------------------------------
   */

  useEffect(() => {
    let cancelled = false;

    async function loadVotingOptions() {
      try {
        setLoadingOptions(true);
        setOptionsError(null);

        const response = await fetch(
          "/api/voting-options",
          {
            method: "GET",
            cache: "no-store",
          },
        );

        const data = await response.json();

        console.log(
          "[voting-options] response:",
          data,
        );

        if (!response.ok) {
          throw new Error(
            data.message ||
              "Failed to load voting options.",
          );
        }

        if (cancelled) return;

        setPollingUnits(
          Array.isArray(data.pollingUnits)
            ? data.pollingUnits
            : [],
        );

        setDevices(
          Array.isArray(data.devices)
            ? data.devices
            : [],
        );
      } catch (error) {
        if (cancelled) return;

        console.error(
          "[voting-options] error:",
          error,
        );

        setOptionsError(
          error instanceof Error
            ? error.message
            : "Unable to load voting options.",
        );

        setPollingUnits([]);
        setDevices([]);
      } finally {
        if (!cancelled) {
          setLoadingOptions(false);
        }
      }
    }

    loadVotingOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  /*
   * ---------------------------------------------------------
   * Submit voting attempt
   * ---------------------------------------------------------
   */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    if (
      !voterCardId.trim() ||
      !pollingUnitId.trim() ||
      !deviceId.trim()
    ) {
      return;
    }

    setResult(null);

    try {
      const response = await createAttempt({
        voterCardId: voterCardId
          .trim()
          .toUpperCase(),

        pollingUnitId: pollingUnitId
          .trim()
          .toUpperCase(),

        deviceId: deviceId
          .trim()
          .toUpperCase(),
      });

      setResult(response);
    } catch {
      /*
       * Error/toast handling is already handled by
       * useCreateVotingAttempt().
       */
    }
  };

  /*
   * ---------------------------------------------------------
   * Selected options
   * ---------------------------------------------------------
   */

  const selectedPollingUnit =
    pollingUnits.find(
      (unit) => unit.id === pollingUnitId,
    );

  const selectedDevice =
    devices.find(
      (device) => device.id === deviceId,
    );

  /*
   * ---------------------------------------------------------
   * Render
   * ---------------------------------------------------------
   */

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>
              Record voting activity
            </CardTitle>

            <p className="mt-1 text-sm text-muted-foreground">
              Record a voting attempt and automatically
              run VoteShield integrity checks.
            </p>
          </div>

          <div className="hidden size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary sm:flex">
            <Fingerprint className="size-5" />
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Options loading error */}

        {optionsError && (
          <div className="mb-5 rounded-xl border border-red-500/30 bg-red-500/5 p-4">
            <div className="flex gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                <AlertTriangle className="size-4" />
              </div>

              <div className="min-w-0">
                <p className="text-sm font-medium">
                  Unable to load voting options
                </p>

                <p className="mt-1 text-xs text-muted-foreground">
                  Polling units or voting devices could
                  not be loaded from the monitoring
                  database.
                </p>

                {process.env.NODE_ENV ===
                  "development" && (
                  <p className="mt-2 break-words text-xs text-red-600">
                    {optionsError}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 md:grid-cols-3">
            {/* ------------------------------------------------
                Voter Card
            ------------------------------------------------ */}

            <div>
              <label
                htmlFor="voter-card"
                className="mb-2 block text-sm font-medium"
              >
                Voter card
              </label>

              <Input
                id="voter-card"
                value={voterCardId}
                onChange={(event) =>
                  setVoterCardId(
                    event.target.value,
                  )
                }
                placeholder="VC-1008"
                disabled={
                  creating ||
                  Boolean(initialVoterCardId)
                }
              />

              <p className="mt-1.5 text-xs text-muted-foreground">
                {initialVoterCardId
                  ? "Selected voter card"
                  : "Enter voter card ID"}
              </p>
            </div>

            {/* ------------------------------------------------
                Polling Unit
            ------------------------------------------------ */}

            <div>
              <label
                htmlFor="polling-unit"
                className="mb-2 block text-sm font-medium"
              >
                Polling unit
              </label>

              <select
                id="polling-unit"
                value={pollingUnitId}
                onChange={(event) =>
                  setPollingUnitId(
                    event.target.value,
                  )
                }
                disabled={
                  creating ||
                  loadingOptions
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {loadingOptions
                    ? "Loading polling units..."
                    : pollingUnits.length === 0
                      ? "No polling units available"
                      : "Select polling unit"}
                </option>

                {pollingUnits.map((unit) => (
                  <option
                    key={unit.id}
                    value={unit.id}
                  >
                    {unit.name} ({unit.id})
                  </option>
                ))}
              </select>

              {selectedPollingUnit && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {selectedPollingUnit.id}

                  {selectedPollingUnit.ward
                    ? ` · ${selectedPollingUnit.ward}`
                    : ""}
                </p>
              )}
            </div>

            {/* ------------------------------------------------
                Voting Device
            ------------------------------------------------ */}

            <div>
              <label
                htmlFor="device"
                className="mb-2 block text-sm font-medium"
              >
                Voting device
              </label>

              <select
                id="device"
                value={deviceId}
                onChange={(event) =>
                  setDeviceId(
                    event.target.value,
                  )
                }
                disabled={
                  creating ||
                  loadingOptions
                }
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <option value="">
                  {loadingOptions
                    ? "Loading devices..."
                    : devices.length === 0
                      ? "No devices available"
                      : "Select voting device"}
                </option>

                {devices.map((device) => (
                  <option
                    key={device.id}
                    value={device.id}
                  >
                    {device.name} ({device.id})
                  </option>
                ))}
              </select>

              {selectedDevice && (
                <p className="mt-1.5 text-xs text-muted-foreground">
                  {selectedDevice.id}

                  {selectedDevice.status
                    ? ` · ${selectedDevice.status}`
                    : ""}
                </p>
              )}
            </div>
          </div>

          {/* ------------------------------------------------
              Summary + Submit
          ------------------------------------------------ */}

          <div className="mt-5 flex flex-col gap-4 rounded-xl bg-muted/50 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="rounded-md bg-background px-2 py-1">
                {loadingOptions
                  ? "Loading..."
                  : `${pollingUnits.length} polling units`}
              </span>

              <span className="rounded-md bg-background px-2 py-1">
                {loadingOptions
                  ? "Loading..."
                  : `${devices.length} devices`}
              </span>

              {voterCardId && (
                <span className="rounded-md bg-background px-2 py-1">
                  {voterCardId.toUpperCase()}
                </span>
              )}
            </div>

            <Button
              type="submit"
              disabled={
                creating ||
                loadingOptions ||
                Boolean(optionsError) ||
                !voterCardId.trim() ||
                !pollingUnitId.trim() ||
                !deviceId.trim()
              }
            >
              {creating ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Checking activity...
                </>
              ) : (
                "Record voting attempt"
              )}
            </Button>
          </div>
        </form>

        {/* ------------------------------------------------
            Result
        ------------------------------------------------ */}

        {result && (
          <div className="mt-6">
            {result.flagged ? (
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-5">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-600">
                    <AlertTriangle className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">
                        Voting attempt flagged
                      </h3>

                      {result.alert?.severity && (
                        <Badge variant="destructive">
                          {result.alert.severity}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-muted-foreground">
                      {result.alert?.message}
                    </p>

                    <div className="mt-4 grid gap-3 text-xs sm:grid-cols-3">
                      <div>
                        <p className="text-muted-foreground">
                          Attempt
                        </p>

                        <p className="mt-1 font-medium">
                          {result.attempt.id}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          Card
                        </p>

                        <p className="mt-1 font-medium">
                          {voterCardId.toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <p className="text-muted-foreground">
                          Detection
                        </p>

                        <p className="mt-1 font-medium capitalize">
                          {result.alert?.type
                            ?.replaceAll("_", " ")
                            .toLowerCase()}
                        </p>
                      </div>
                    </div>

                    {result.alert && (
                      <Link
                        href={`/investigate?attemptId=${encodeURIComponent(
                          result.attempt.id,
                        )}`}
                        className="mt-4 inline-flex text-sm font-medium text-red-600 hover:underline"
                      >
                        Investigate alert
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-5">
                <div className="flex gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
                    <CheckCircle2 className="size-5" />
                  </div>

                  <div className="min-w-0">
                    <h3 className="font-semibold">
                      Voting attempt recorded
                    </h3>

                    <p className="mt-1 text-sm text-muted-foreground">
                      No suspicious relationship was
                      detected.
                    </p>

                    <div className="mt-4 grid gap-4 text-xs sm:grid-cols-3">
                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Fingerprint className="size-3" />
                          Attempt
                        </div>

                        <p className="mt-1 font-medium">
                          {result.attempt.id}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MapPin className="size-3" />
                          Polling unit
                        </div>

                        <p className="mt-1 font-medium">
                          {selectedPollingUnit?.name ??
                            pollingUnitId.toUpperCase()}
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Smartphone className="size-3" />
                          Device
                        </div>

                        <p className="mt-1 font-medium">
                          {selectedDevice?.name ??
                            deviceId.toUpperCase()}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}