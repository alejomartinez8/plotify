"use client";

import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/Checkbox";
import { Label } from "@/components/ui/Label";
import { LotDebtDetail } from "@/types/quotas.types";
import { Contribution } from "@/types/contributions.types";
import { QuotaLineStatus, formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { translations } from "@/lib/translations";

const t = translations.whatsapp;

interface WhatsAppLotReportButtonProps {
  lotNumber: string;
  owner: string;
  debtDetail: LotDebtDetail;
  quotaBreakdown: QuotaLineStatus[];
  contributions: Contribution[];
}

function getPaymentTypeLabel(type: string): string {
  if (type === "maintenance") return t.lotReportPaymentTypeMaintenance;
  if (type === "works") return t.lotReportPaymentTypeWorks;
  return t.lotReportPaymentTypeOthers;
}

function generateLotReport(
  lotNumber: string,
  owner: string,
  debtDetail: LotDebtDetail,
  quotaBreakdown: QuotaLineStatus[],
  contributions: Contribution[]
): string {
  const today = formatDateForDisplay(new Date());
  const lines: string[] = [];

  lines.push(t.lotReportTitle);
  lines.push(`${t.lotReportLotPrefix} ${lotNumber}* — ${owner}`);
  lines.push(t.reportSeparator);

  const maintenanceLines = quotaBreakdown.filter((q) => q.quotaType === "maintenance");
  const worksLines = quotaBreakdown.filter((q) => q.quotaType === "works" || q.quotaType === "initial");

  if (maintenanceLines.length > 0) {
    lines.push(t.lotReportMaintenance);
    for (const q of maintenanceLines) {
      const icon =
        q.status === "paid" ? t.lotReportQuotaPaid :
        q.status === "partial" ? t.lotReportQuotaPartial :
        t.lotReportQuotaOwed;
      const suffix =
        q.status === "partial"
          ? ` (${formatCurrency(q.paidAmount)} / ${formatCurrency(q.amount)})`
          : ` — ${formatCurrency(q.amount)}`;
      lines.push(`  ${icon} ${q.label}${suffix}`);
    }
    lines.push("");
  }

  if (worksLines.length > 0) {
    lines.push(t.lotReportWorks);
    for (const q of worksLines) {
      const icon =
        q.status === "paid" ? t.lotReportQuotaPaid :
        q.status === "partial" ? t.lotReportQuotaPartial :
        t.lotReportQuotaOwed;
      const suffix =
        q.status === "partial"
          ? ` (${formatCurrency(q.paidAmount)} / ${formatCurrency(q.amount)})`
          : ` — ${formatCurrency(q.amount)}`;
      lines.push(`  ${icon} ${q.label}${suffix}`);
    }
    lines.push("");
  }

  lines.push(t.reportSeparator);

  // Payments made section
  lines.push(t.lotReportPayments);
  const sortedContributions = [...contributions].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (sortedContributions.length === 0) {
    lines.push(`  ${t.lotReportNoPayments}`);
  } else {
    for (const c of sortedContributions) {
      const date = formatDateForDisplay(new Date(c.date));
      const type = getPaymentTypeLabel(c.type);
      const amount = formatCurrency(c.amount);
      lines.push(`  ${t.lotReportDate} ${date} | [${type}] ${c.description} | ${amount}`);
    }
  }
  lines.push("");

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

const CURRENT_YEAR = new Date().getFullYear();

export default function WhatsAppLotReportButton({
  lotNumber,
  owner,
  debtDetail,
  quotaBreakdown,
  contributions,
}: WhatsAppLotReportButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const [currentYearOnly, setCurrentYearOnly] = useState(true);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredContributions = currentYearOnly
    ? contributions.filter((c) => new Date(c.date).getFullYear() === CURRENT_YEAR)
    : contributions;

  const filteredQuotaBreakdown = currentYearOnly
    ? quotaBreakdown.filter((q) => q.quotaType !== "maintenance" || q.year === CURRENT_YEAR)
    : quotaBreakdown;

  async function handleClick() {
    const text = generateLotReport(lotNumber, owner, debtDetail, filteredQuotaBreakdown, filteredContributions);
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
    <div className="flex flex-col items-end gap-1.5">
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
      <div className="flex items-center gap-1.5">
        <Checkbox
          id="whatsapp-year-filter"
          checked={currentYearOnly}
          onCheckedChange={(checked) => setCurrentYearOnly(!!checked)}
        />
        <Label
          htmlFor="whatsapp-year-filter"
          className="text-muted-foreground cursor-pointer text-xs"
        >
          {t.lotReportCurrentYearOnly} ({CURRENT_YEAR})
        </Label>
      </div>
    </div>
  );
}
