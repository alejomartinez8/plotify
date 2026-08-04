export interface Lot {
  id: string;
  lotNumber: string;
  owner: string;
  ownerEmail: string | null;
  whatsappPhone: string | null;
  notificationsEnabled: boolean;
  initialWorksDebt: number;
  isExempt: boolean;
  exemptionReason: string | null;
  exemptionEndDate: Date | string | null;
}
