import { getLots } from "@/lib/database/lots";
import { getContributions } from "@/lib/database/contributions";
import { getQuotaConfigs } from "@/lib/database/quotas";

export interface SimpleLotBalance {
  lotId: string;
  lotNumber: string;
  owner: string;
  totalContributions: number;
  totalQuotas: number;
  initialWorksDebt: number;
  outstandingBalance: number; // Changed from balance - only shows debt owed
  status: "current" | "overdue"; // Simplified - removed "advance"
}

export async function calculateSimpleLotBalances(): Promise<SimpleLotBalance[]> {
  try {
    const [lots, contributions, quotaConfigs] = await Promise.all([
      getLots(),
      getContributions(),
      getQuotaConfigs(),
    ]);

    const currentDate = new Date();

    // Filter quotas that should be applied by now based on dueDate
    const applicableQuotas = quotaConfigs.filter(quota => {
      if (quota.dueDate) {
        return new Date(quota.dueDate) <= currentDate;
      }
      return false;
    });

    const lotBalances: SimpleLotBalance[] = lots
      .filter(lot => !lot.isExempt) // Exclude exempt lots from debt calculations
      .map(lot => {
      const lotContributions = contributions.filter(c => c.lotId === lot.id);
      const totalContributions = lotContributions.reduce((sum, c) => sum + c.amount, 0);
      
      // Calculate total quotas applicable to this lot
      const totalQuotas = applicableQuotas.reduce((sum, quota) => sum + quota.amount, 0);
      
      // Calculate balance: quotas + initial debt - contributions
      const balance = totalQuotas + lot.initialWorksDebt - totalContributions;
      
      // Outstanding balance: only show debt owed (0 if paid in advance)
      const outstandingBalance = Math.max(0, balance);
      
      // Determine status: only "current" (paid up) or "overdue" (owes money)
      const status: "current" | "overdue" = balance <= 0 ? "current" : "overdue";

      return {
        lotId: lot.id,
        lotNumber: lot.lotNumber,
        owner: lot.owner,
        totalContributions,
        totalQuotas: totalQuotas + lot.initialWorksDebt,
        initialWorksDebt: lot.initialWorksDebt,
        outstandingBalance,
        status,
      };
    });

    return lotBalances.sort((a, b) => b.outstandingBalance - a.outstandingBalance);
  } catch (error) {
    console.error("Error calculating simple lot balances:", error);
    return [];
  }
}

export function getStatusColor(status: "current" | "overdue"): string {
  switch (status) {
    case "current":
      return "bg-green-100 text-green-800";
    case "overdue":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusText(status: "current" | "overdue"): string {
  switch (status) {
    case "current":
      return "Al día";
    case "overdue":
      return "Atrasado";
    default:
      return "Desconocido";
  }
}

export function getStatusIcon(status: "current" | "overdue"): string {
  switch (status) {
    case "current":
      return "🟢";
    case "overdue":
      return "🔴";
    default:
      return "⚪";
  }
}


export interface LotDebtDetail {
  lotId: string;
  initialWorksDebt: number;
  maintenanceDebt: number;
  worksDebt: number;
  totalDebt: number;
  totalContributions: number;
  totalQuotas: number;
  outstandingBalance: number;
  status: "current" | "overdue";
}

export async function calculateLotDebtDetail(lotId: string): Promise<LotDebtDetail | null> {
  try {
    const [lots, contributions, quotaConfigs] = await Promise.all([
      getLots(),
      getContributions(),
      getQuotaConfigs(),
    ]);

    const lot = lots.find(l => l.id === lotId);
    if (!lot) return null;
    
    // Return null for exempt lots (they don't have debt calculations)
    if (lot.isExempt) return null;

    const currentDate = new Date();
    
    // Filter quotas that should be applied by now based on dueDate
    const applicableQuotas = quotaConfigs.filter(quota => {
      if (quota.dueDate) {
        return new Date(quota.dueDate) <= currentDate;
      }
      return false;
    });

    const lotContributions = contributions.filter(c => c.lotId === lot.id);
    
    // Calculate contributions by type
    const maintenanceContributions = lotContributions
      .filter(c => c.type === "maintenance")
      .reduce((sum, c) => sum + c.amount, 0);
    
    const worksContributions = lotContributions
      .filter(c => c.type === "works")
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalContributions = maintenanceContributions + worksContributions;
    
    // Calculate quotas by type
    const maintenanceQuotas = applicableQuotas
      .filter(q => q.quotaType === "maintenance")
      .reduce((sum, q) => sum + q.amount, 0);
    
    const worksQuotas = applicableQuotas
      .filter(q => q.quotaType === "works")
      .reduce((sum, q) => sum + q.amount, 0);
    
    // Calculate debt by type
    const maintenanceDebt = Math.max(0, maintenanceQuotas - maintenanceContributions);
    const worksDebt = Math.max(0, (worksQuotas + lot.initialWorksDebt) - worksContributions);
    
    const totalQuotas = maintenanceQuotas + worksQuotas + lot.initialWorksDebt;
    const totalDebt = maintenanceDebt + worksDebt;
    const outstandingBalance = Math.max(0, totalQuotas - totalContributions);
    
    const status: "current" | "overdue" = outstandingBalance <= 0 ? "current" : "overdue";

    return {
      lotId: lot.id,
      initialWorksDebt: lot.initialWorksDebt,
      maintenanceDebt,
      worksDebt,
      totalDebt,
      totalContributions,
      totalQuotas,
      outstandingBalance,
      status,
    };
  } catch (error) {
    console.error("Error calculating lot debt detail:", error);
    return null;
  }
}