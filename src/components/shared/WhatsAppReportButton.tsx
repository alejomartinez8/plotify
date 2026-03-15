"use client";

import { useRef, useState } from "react";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { SimpleLotBalance } from "@/types/quotas.types";
import { formatCurrency, formatDateForDisplay } from "@/lib/utils";
import { translations } from "@/lib/translations";

const t = translations.whatsapp;

function generateWhatsAppReport(lotBalances: SimpleLotBalance[]): string {
  const today = formatDateForDisplay(new Date());
  const lines: string[] = [];

  lines.push(t.reportTitle);
  lines.push(`${t.reportDate} ${today}`);
  lines.push(t.reportSeparator);
  lines.push(t.reportLots);

  const sorted = [...lotBalances].sort((a, b) =>
    a.lotNumber.localeCompare(b.lotNumber, undefined, { numeric: true })
  );

  for (const lot of sorted) {
    lines.push("");
    lines.push(`${t.lotPrefix} ${lot.lotNumber}* — ${t.ownerPrefix} ${lot.owner}`);
    if (lot.outstandingBalance === 0) {
      lines.push(t.currentLabel);
    } else {
      lines.push(`${t.owedLabel} ${formatCurrency(lot.outstandingBalance)}`);
    }
  }

  const overdueCount = lotBalances.filter((l) => l.status === "overdue").length;
  const currentCount = lotBalances.filter((l) => l.status === "current").length;
  const totalDebt = lotBalances.reduce((sum, l) => sum + l.outstandingBalance, 0);

  lines.push("");
  lines.push(t.reportSeparator);
  lines.push(t.summaryTitle);
  lines.push(`${t.summaryTotalLots} ${lotBalances.length}`);
  lines.push(`${t.summaryOverdue} ${overdueCount}`);
  lines.push(`✅ Al día: ${currentCount}`);
  lines.push(`${t.summaryDebt} ${formatCurrency(totalDebt)}`);
  lines.push(t.reportSeparator);
  lines.push(t.summaryFooter);

  return lines.join("\n");
}

type CopyStatus = "idle" | "copied" | "error";

interface WhatsAppReportButtonProps {
  lotBalances: SimpleLotBalance[];
}

export default function WhatsAppReportButton({ lotBalances }: WhatsAppReportButtonProps) {
  const [status, setStatus] = useState<CopyStatus>("idle");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  async function handleClick() {
    const text = generateWhatsAppReport(lotBalances);
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
        : t.copyReport;

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
