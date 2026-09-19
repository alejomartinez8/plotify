export interface Lot {
  id: string;
  lotNumber: string;
  owner: string;
  ownerEmail: string | null;
  whatsappPhone: string | null;
  initialWorksDebt: number;
  stage: number;
}
