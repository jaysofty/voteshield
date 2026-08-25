import type { LucideIcon } from "lucide-react";

export type DashboardData = {
  voters: number;

  votingAttempts: number;

  suspiciousAttempts: number;

  activeAlerts: number;

  duplicateCardAlerts: number;

  deviceAlerts: number;

  resolvedAlerts: number;

  recentAttempts: {
    id: string;
    status: string;
    timestamp: string;
    voterName: string;
    voterCardId: string;
    pollingUnit: string;
    deviceId: string;
  }[];
};

export type StatCardProps = {
  label: string;
  value: number | string;
  description: string;
  icon: LucideIcon;
};