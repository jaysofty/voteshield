export type InvestigationData = {
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
    id: string | null;
    name: string | null;
  };
  alert: {
    id: string;
    type: string;
    severity: string;
    message: string;
    status: "OPEN" | "INVESTIGATING" | "RESOLVED";
  } | null;
};
