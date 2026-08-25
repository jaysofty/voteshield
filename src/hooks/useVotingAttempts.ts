"use client";

import { CreateVotingAttemptInput, VotingAttemptResult } from "@/types/vote-attempts";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

async function createVotingAttempt(
  payload: CreateVotingAttemptInput,
): Promise<VotingAttemptResult> {
  const response = await fetch("/api/voting-attempts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Failed to record voting attempt.",
    );
  }

  return data;
}

export function useCreateVotingAttempt() {
  const mutation = useMutation({
    mutationFn: createVotingAttempt,

    onSuccess: (data) => {
      if (data.flagged) {
        toast.error("Voting attempt flagged for investigation.");
      } else {
        toast.success("Voting attempt recorded successfully.");
      }
    },

    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  return {
    createAttempt: mutation.mutateAsync,
    creating: mutation.isPending,
    error: mutation.error,
  };
}