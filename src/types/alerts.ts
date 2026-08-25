export type AlertStatus =
  | "OPEN"
  | "INVESTIGATING"
  | "RESOLVED";

export type Alert = {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: AlertStatus;
  createdAt: string;
};

export type UpdateAlertStatusInput = {
  alertId: string;
  status: AlertStatus;
};

export type AlertData = {
  id: string;
  type: string;
  severity: string;
  message: string;
  status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  createdAt: string;
  attemptId: string;
  voterName: string;
  voterCardId: string;
  pollingUnit: string;
};