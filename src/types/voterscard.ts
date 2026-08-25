export type VoterCardListItem = {
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

export type VotingReferenceData = {
  pollingUnits: {
    id: string;
    name: string;
    ward: string;
  }[];
  devices: {
    id: string;
    name: string;
  }[];
};