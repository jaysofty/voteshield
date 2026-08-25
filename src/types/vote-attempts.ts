export type CreateVotingAttemptInput = {
  voterCardId: string;
  pollingUnitId: string;
  deviceId: string;
};

export type CreateVotingAttemptResult = {
  attempt: {
    id: string;
    status: string;
    timestamp: string;
  };
  flagged: boolean;
  alert: {
    id: string;
    type: string;
    severity: string;
    message: string;
    status: string;
  } | null;
};

export type VotingAttemptResult = {
  success: boolean;
  flagged: boolean;
  attempt: {
    id: string;
    status: string;
    timestamp: string;
  };
  alert: {
    id: string;
    type: string;
    severity: string;
    message: string;
    status: string;
  } | null;
};

export type RecordVotingAttemptProps = {
  initialVoterCardId?: string;
  initialPollingUnitId?: string;
};

export type Device = {
  id: string;
  name: string;
  status?: string;
};

export type PollingUnit = {
  id: string;
  name: string;
  ward?: string | null;
};

