"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CreditCard } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { RecordVotingAttempt } from "@/app/components/voting/record-voting-attempt";


type Voter = {
  voterId: string;
  voterName: string;
  voterStatus: string;
  voterCardId: string;
  voterCardStatus: string;
  pollingUnitId: string | null;
  pollingUnitName: string | null;
  pollingUnitWard: string | null;
  votingAttempts: number;
};

export default function RecordVotePage({
  params,
}: {
  params: Promise<{ cardId: string }>;
}) {
  const [cardId, setCardId] = useState<string | null>(null);
  const [voter, setVoter] = useState<Voter | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(({ cardId }) => {
      setCardId(decodeURIComponent(cardId));
    });
  }, [params]);

  useEffect(() => {
    if (!cardId) return;

    async function loadVoter() {
      try {
        const response = await fetch("/api/voters", {
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Failed to load voter");
        }

        const data = await response.json();

        const found = data.voters?.find(
          (item: Voter) =>
            item.voterCardId === cardId,
        );

        setVoter(found ?? null);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    loadVoter();
  }, [cardId]);

  if (loading) {
    return (
      <div className="p-6 lg:p-8">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="mt-6 h-32 w-full" />
      </div>
    );
  }

  if (!voter) {
    return (
      <div className="p-6 lg:p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="font-semibold">
              Voter card not found
            </h1>

            <p className="mt-1 text-sm text-muted-foreground">
              The selected voter card does not exist.
            </p>

            <Button  className="mt-4">
              <Link href="/voters">
                Back to voters
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8">
      <Button
        variant="ghost"
    
        className="-ml-2"
      >
        <Link href="/voters">
          <ArrowLeft className="mr-2 size-4" />
          Back to voters
        </Link>
      </Button>

      <div className="mt-6">
        <Badge variant="secondary">
          Voting activity
        </Badge>

        <h1 className="mt-2 text-2xl font-bold tracking-tight">
          Record voting attempt
        </h1>

        <p className="mt-1 text-sm text-muted-foreground">
          Record activity for this voter card and run
          VoteShield integrity checks.
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <CreditCard className="size-5" />
            </div>

            <div>
              <CardTitle>
                {voter.voterName}
              </CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                {voter.voterId} · {voter.voterCardId}
              </p>
            </div>

            <Badge
              className="ml-auto"
              variant="secondary"
            >
              {voter.voterCardStatus}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <div className="grid gap-4 rounded-xl bg-muted/50 p-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted-foreground">
                Voter card
              </p>

              <p className="mt-1 text-sm font-medium">
                {voter.voterCardId}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Assigned polling unit
              </p>

              <p className="mt-1 text-sm font-medium">
                {voter.pollingUnitName ??
                  "Not assigned"}
              </p>
            </div>

            <div>
              <p className="text-xs text-muted-foreground">
                Previous attempts
              </p>

              <p className="mt-1 text-sm font-medium">
                {voter.votingAttempts}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6">
        <RecordVotingAttempt
          initialVoterCardId={voter.voterCardId}
          initialPollingUnitId={
            voter.pollingUnitId ?? ""
          }
        />
      </div>
    </div>
  );
}