"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { getExpenses } from "@/lib/database/expenses";
import { translations } from "@/lib/translations";
import { logger } from "@/lib/logger";


function formatDate(date: string | Date): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return dateObj.toLocaleDateString("es-CO");
}

function generateTimestamp(): string {
  const now = new Date();
  return now.toISOString().slice(0, 16).replace("T", "_").replace(":", "-");
}

export async function exportIncomesAction(): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  const actionTimer = logger.timer('Export Incomes Action');
  
  try {
    // Get contributions with lot information
    const contributionsWithLots = await prisma.contribution.findMany({
      include: {
        lot: true,
      },
      orderBy: {
        id: "desc",
      },
    });

    // CSV headers
    const headers = [
      "ID",
      "Fecha",
      "Número de Lote",
      "Propietario",
      "Tipo",
      "Descripción",
      "Número de Recibo",
      "Monto",
    ];

    // Convert data to CSV format
    const csvData = contributionsWithLots.map((contribution) => [
      contribution.id.toString(),
      formatDate(contribution.date),
      contribution.lot.lotNumber || "N/A",
      contribution.lot.owner || "N/A",
      contribution.type === "maintenance" ? "Mantenimiento" : "Obras",
      contribution.description,
      contribution.receiptNumber || "",
      contribution.amount.toString(),
    ]);

    // Combine headers and data
    const allRows = [headers, ...csvData];

    // Convert to CSV string
    const csvContent = allRows
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Add BOM for proper UTF-8 encoding
    const csvWithBOM = "\uFEFF" + csvContent;

    const filename = `ingresos_${generateTimestamp()}.csv`;

    actionTimer.end();
    return {
      success: true,
      data: csvWithBOM,
      filename,
    };
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Error exporting incomes", errorInstance, {
      component: 'exportIncomesAction'
    });
    actionTimer.end();
    
    return {
      success: false,
      error: translations.errors.export.incomes,
    };
  }
}

export async function exportExpensesAction(): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  const actionTimer = logger.timer('Export Expenses Action');
  
  try {
    const expenses = await getExpenses();

    // CSV headers
    const headers = [
      "ID",
      "Fecha",
      "Tipo",
      "Categoría",
      "Descripción",
      "Número de Recibo",
      "Monto",
    ];

    // Convert data to CSV format
    const csvData = expenses.map((expense) => [
      expense.id.toString(),
      formatDate(expense.date),
      "Gasto General",
      expense.category,
      expense.description,
      expense.receiptNumber || "",
      expense.amount.toString(),
    ]);

    // Combine headers and data
    const allRows = [headers, ...csvData];

    // Convert to CSV string
    const csvContent = allRows
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Add BOM for proper UTF-8 encoding
    const csvWithBOM = "\uFEFF" + csvContent;

    const filename = `gastos_${generateTimestamp()}.csv`;

    actionTimer.end();
    return {
      success: true,
      data: csvWithBOM,
      filename,
    };
  } catch (error) {
    const errorInstance = error instanceof Error ? error : new Error(String(error));
    logger.error("Error exporting expenses", errorInstance, {
      component: 'exportExpensesAction'
    });
    actionTimer.end();
    
    return {
      success: false,
      error: translations.errors.export.expenses,
    };
  }
}

export async function exportLotsAction(): Promise<{
  success: boolean;
  data?: string;
  filename?: string;
  error?: string;
}> {
  try {
    await requireAuth();

    // Get lots (basic info only, no contributions)
    const lots = await prisma.lot.findMany({
      orderBy: {
        lotNumber: "asc",
      },
    });

    // CSV headers
    const headers = [
      "ID",
      "Número de Lote",
      "Propietario",
    ];

    // Convert data to CSV format
    const csvData = lots.map((lot) => [
      lot.id.toString(),
      lot.lotNumber,
      lot.owner,
    ]);

    // Combine headers and data
    const allRows = [headers, ...csvData];

    // Convert to CSV string
    const csvContent = allRows
      .map((row) => row.map((field) => `"${field}"`).join(","))
      .join("\n");

    // Add BOM for proper UTF-8 encoding
    const csvWithBOM = "\uFEFF" + csvContent;

    const filename = `lotes_${generateTimestamp()}.csv`;

    return {
      success: true,
      data: csvWithBOM,
      filename,
    };
  } catch (error) {
    console.error("Error exporting lots:", error);
    return {
      success: false,
      error: translations.errors.export.lots,
    };
  }
}
