export type Voter = {
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