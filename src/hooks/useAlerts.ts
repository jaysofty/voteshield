"use client";

import type { Alert, UpdateAlertStatusInput } from "@/types/alerts";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";

async function updateAlertStatus({
  alertId,
  status,
}: UpdateAlertStatusInput): Promise<Alert> {
  const response = await fetch(
    `/api/alerts/${encodeURIComponent(alertId)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
      }),
    },
  );

  const data: {
    alert?: Alert;
    message?: string;
  } = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message ?? "Unable to update alert.",
    );
  }

  if (!data.alert) {
    throw new Error("Alert update returned no data.");
  }

  return data.alert;
}

export function useUpdateAlertStatus() {
  const mutation = useMutation<
    Alert,
    Error,
    UpdateAlertStatusInput
  >({
    mutationFn: updateAlertStatus,

    onSuccess: (alert) => {
      toast.success(
        `${alert.id} is now ${alert.status.toLowerCase()}.`,
      );
    },

    onError: (error) => {
      toast.error(
        error.message || "Unable to update alert.",
      );
    },
  });

  return {
    updateStatus: mutation.mutate,
    updateStatusAsync: mutation.mutateAsync,
    updating: mutation.isPending,
    error: mutation.error?.message ?? "",
    reset: mutation.reset,
  };
}