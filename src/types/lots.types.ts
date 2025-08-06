export interface Lot {
  id: string;
  lotNumber: string;
  owner: string;
  initialWorksDebt: number;
  isExempt: boolean;
  exemptionReason: string | null;
}
