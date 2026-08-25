"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  CreditCard,
  Search,
  ShieldAlert,
  Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import type { Voter } from "@/types/voters";



export default function VotersPage() {
  const [voters, setVoters] = useState<Voter[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    async function loadVoters() {
      try {
        setLoading(true);
        setError(false);

        const response = await fetch("/api/voters", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load voters");
        }

        const data = await response.json();

        setVoters(data.voters ?? []);
      } catch (error) {
        console.error(error);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    loadVoters();
  }, []);

  const filteredVoters = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return voters;
    }

    return voters.filter((voter) => {
      return (
        voter.voterName.toLowerCase().includes(query) ||
        voter.voterId.toLowerCase().includes(query) ||
        voter.voterCardId.toLowerCase().includes(query) ||
        voter.pollingUnitName?.toLowerCase().includes(query)
      );
    });
  }, [search, voters]);

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <Badge variant="secondary">Voter registry</Badge>

          <h1 className="mt-2 text-2xl font-bold tracking-tight">
            Voters & voter cards
          </h1>

          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            View registered voters and record voting activity against
            their voter cards.
          </p>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="size-4" />
          {loading ? "Loading..." : `${voters.length} registered voters`}
        </div>
      </div>

      {/* Search */}
      <Card className="mt-8">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />

            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by voter name, voter ID, card ID or polling unit..."
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <Card className="mt-6">
          <CardContent className="p-8 text-center">
            <ShieldAlert className="mx-auto size-8 text-destructive" />

            <h2 className="mt-3 font-semibold">
              Unable to load voter registry
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              We couldnt connect to the monitoring database.
            </p>

            <Button
              className="mt-4"
              onClick={() => window.location.reload()}
            >
              Try again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index}>
              <CardContent className="p-5">
                <div className="space-y-3">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-56" />
                  <Skeleton className="h-9 w-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredVoters.length === 0 && (
        <Card className="mt-6">
          <CardContent className="p-12 text-center">
            <Users className="mx-auto size-8 text-muted-foreground" />

            <h2 className="mt-3 font-semibold">
              No voters found
            </h2>

            <p className="mt-1 text-sm text-muted-foreground">
              Try a different search term.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Voters */}
      {!loading && !error && filteredVoters.length > 0 && (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filteredVoters.map((voter) => (
            <VoterCard
              key={voter.voterCardId}
              voter={voter}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function VoterCard({ voter }: { voter: Voter }) {
  const hasVotingHistory = voter.votingAttempts > 0;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>

            <div className="min-w-0">
              <h2 className="truncate font-semibold">
                {voter.voterName}
              </h2>

              <p className="text-xs text-muted-foreground">
                {voter.voterId}
              </p>
            </div>
          </div>

          <Badge
            variant={
              voter.voterCardStatus === "ACTIVE"
                ? "secondary"
                : "destructive"
            }
          >
            {voter.voterCardStatus}
          </Badge>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <Info
            label="Voter card"
            value={voter.voterCardId}
          />

          <Info
            label="Voting attempts"
            value={String(voter.votingAttempts)}
          />

          <Info
            label="Polling unit"
            value={
              voter.pollingUnitName ?? "Not assigned"
            }
          />

          <Info
            label="Ward"
            value={
              voter.pollingUnitWard ?? "Not assigned"
            }
          />
        </div>

        {hasVotingHistory && (
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
            {voter.votingAttempts > 1 ? (
              <ShieldAlert className="size-3.5 text-destructive" />
            ) : (
              <CheckCircle2 className="size-3.5 text-emerald-600" />
            )}

            <span>
              {voter.votingAttempts === 1
                ? "1 voting attempt recorded"
                : `${voter.votingAttempts} voting attempts recorded`}
            </span>
          </div>
        )}

        <Button className="mt-5 w-full">
          <Link
            href={`/voters/${encodeURIComponent(
              voter.voterCardId,
            )}`}
          >
            Record voting attempt
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function Info({
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