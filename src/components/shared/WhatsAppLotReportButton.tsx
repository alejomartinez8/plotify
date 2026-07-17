"use client";

import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { LotDebtDetail } from "@/types/quotas.types";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { translations } from "@/lib/translations";

const t = translations.whatsapp;

interface WhatsAppLotReportButtonProps {
  lotNumber: string;
  owner: string;
  debtDetail: LotDebtDetail;
  maintenancePaid: number;
  worksPaid: number;
}

function generateLotReport(
  lotNumber: string,
  owner: string,
  debtDetail: LotDebtDetail,
  maintenancePaid: number,
  worksPaid: number
): string {
  const today = formatDateForDisplay(new Date());
  const lines: string[] = [];

  const maintenanceTotalQuota = maintenancePaid + debtDetail.maintenanceDebt;
  const worksTotalQuota = worksPaid + debtDetail.worksDebt;

  lines.push(`${t.lotReportTitle}`);
  lines.push(`${t.lotReportLotPrefix} ${lotNumber}* — ${owner}`);
  lines.push(t.reportSeparator);

  if (debtDetail.initialWorksDebt > 0) {
    lines.push(`${t.lotReportInitialBalance} ${formatCurrency(debtDetail.initialWorksDebt)}`);
    lines.push("");
  }

  lines.push(t.lotReportMaintenance);
  lines.push(`${t.lotReportTotalQuota} ${formatCurrency(maintenanceTotalQuota)}`);
  lines.push(`${t.lotReportPaid} ${formatCurrency(maintenancePaid)}`);
  lines.push(`${t.lotReportOwed} ${formatCurrency(debtDetail.maintenanceDebt)}`);
  lines.push("");

  lines.push(t.lotReportWorks);
  lines.push(`${t.lotReportTotalQuota} ${formatCurrency(worksTotalQuota)}`);
  lines.push(`${t.lotReportPaid} ${formatCurrency(worksPaid)}`);
  lines.push(`${t.lotReportOwed} ${formatCurrency(debtDetail.worksDebt)}`);

  lines.push(t.reportSeparator);

  if (debtDetail.outstandingBalance > 0) {
    lines.push(`${t.lotReportTotalOwed} ${formatCurrency(debtDetail.outstandingBalance)}`);
  } else {
    lines.push(t.lotReportCurrentStatus);
  }

  lines.push(`${t.lotReportDate} ${today}`);
  lines.push(t.summaryFooter);

  return lines.join("\n");
}

type CopyStatus = "idle" | "copied" | "error";

export default function WhatsAppLotReportButton({
  lotNumber,
  owner,
  debtDetail,
  maintenancePaid,
  worksPaid,
}: WhatsAppLotReportButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleClick() {
    const text = generateLotReport(lotNumber, owner, debtDetail, maintenancePaid, worksPaid);
    try {
      await navigator.clipboard.writeText(text);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("copied");
      timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
    } catch {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setStatus("error");
      timeoutRef.current = setTimeout(() => setStatus("idle"), 2000);
    }
  }

  const label =
    status === "copied"
      ? t.copied
      : status === "error"
        ? t.copyError
        : t.lotReportCopy;

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      className={
        status === "copied"
          ? "border-green-500 text-green-600"
          : status === "error"
            ? "border-red-500 text-red-600"
            : ""
      }
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      {label}
    </Button>
  );
}
