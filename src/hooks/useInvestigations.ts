"use client";

import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

import type { InvestigationData } from "@/types/investigations";

async function investigateAttempt(
  attemptId: string,
): Promise<InvestigationData> {
  const trimmedId = attemptId.trim();

  if (!trimmedId) {
    throw new Error("Enter a voting attempt ID.");
  }

  const response = await fetch(
    `/api/investigate/${encodeURIComponent(trimmedId)}`,
  );

  const data: {
    investigation?: InvestigationData;
    message?: string;
  } = await response.json();

  // API returned an error
  if (!response.ok) {
    throw new Error(
      data.message ??
        `Voting attempt ${trimmedId} was not found.`,
    );
  }

  // API returned 200 but no investigation
  if (!data.investigation) {
    throw new Error(
      `Voting attempt ${trimmedId} was not found.`,
    );
  }

  // IMPORTANT:
  // Make sure the API actually returned the investigation
  // for the ID we requested.
  if (
    data.investigation.attempt.id.toLowerCase() !==
    trimmedId.toLowerCase()
  ) {
    throw new Error(
      `Voting attempt ${trimmedId} was not found.`,
    );
  }

  return data.investigation;
}

export function useInvestigation() {
  const mutation = useMutation<
    InvestigationData,
    Error,
    string
  >({
    mutationFn: investigateAttempt,

    onError: (error) => {
      toast.error(
        error.message || "Unable to load Investigation.",
      );
    },
  });

  return {
    investigate: mutation.mutate,
    investigateAsync: mutation.mutateAsync,
    investigation: mutation.data ?? null,
    loading: mutation.isPending,
    error: mutation.error?.message ?? "",
    reset: mutation.reset,
  };
}