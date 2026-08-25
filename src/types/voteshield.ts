export type DashboardStats = {
  voters: number;
  votingAttempts: number;
  suspiciousAttempts: number;
  activeAlerts: number;
  duplicateCardAlerts: number;
  deviceAlerts: number;
  resolvedAlerts: number;
};

export type VotingAttempt = {
  id: string;
  status: string;
  voterName: string;
  voterCardId: string;
  pollingUnit: string;
};

export type RecentVotingActivityProps = {
  attempts: VotingAttempt[];
  loading: boolean;
}

export type Alert = {
  id: string;
  type: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  message: string;
  createdAt: string;
  attemptId: string;
  voterName: string;
  voterCardId: string;
  pollingUnit: string;
  status: "OPEN" | "UNDER_REVIEW" | "RESOLVED" | "ESCALATED";
};

export type Investigation = {
  voter: {
    id: string;
    name: string;
    status: string;
  };
  voterCard: {
    id: string;
    status: string;
  };
  attempt: {
    id: string;
    status: string;
    timestamp: string;
  };
  pollingUnit: {
    id: string;
    name: string;
  };
  device: {
    id: string;
    name: string;
  };
  alert?: {
    id: string;
    severity: string;
    message: string;
  };
};