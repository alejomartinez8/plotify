export interface Lot {
  id: string;
  lotNumber: string;
  owner: string;
  ownerEmail: string | null;
  initialWorksDebt: number;
  isExempt: boolean;
  exemptionReason: string | null;
}
