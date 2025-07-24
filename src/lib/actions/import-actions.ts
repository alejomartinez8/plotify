"use server";

import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { translations } from "@/lib/translations";

interface ImportResult {
  success: boolean;
  message: string;
  imported?: number;
  errors?: string[];
}

function parseCSV(csvContent: string): string[][] {
  const lines = csvContent.trim().split('\n');
  return lines.map(line => {
    const values: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  });
}

function parseDate(dateString: string): Date {
  // Try different date formats
  const formats = [
    // Spanish format DD/MM/YYYY
    /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/,
    // ISO format YYYY-MM-DD
    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
  ];

  for (const format of formats) {
    const match = dateString.match(format);
    if (match) {
      if (format === formats[0]) {
        // DD/MM/YYYY format
        const [, day, month, year] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      } else {
        // YYYY-MM-DD format
        const [, year, month, day] = match;
        return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      }
    }
  }
  
  // Fallback to Date constructor
  return new Date(dateString);
}

export async function importLotsAction(csvContent: string): Promise<ImportResult> {
  try {
    await requireAuth();

    const rows = parseCSV(csvContent);
    if (rows.length < 2) {
      return {
        success: false,
        message: translations.errors.import.csvFormat
      };
    }

    const headers = rows[0];
    const expectedHeaders = ["ID", "Número de Lote", "Propietario"];
    
    // Validate headers
    if (!expectedHeaders.every(header => headers.includes(header))) {
      return {
        success: false,
        message: translations.errors.import.headerMismatch + expectedHeaders.join(", ")
      };
    }

    const dataRows = rows.slice(1);
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2; // +2 because we start from row 1 and skip header
      
      try {
        const lotNumber = row[1]?.replace(/"/g, '') || '';
        const owner = row[2]?.replace(/"/g, '') || '';

        if (!lotNumber || !owner) {
          errors.push(`Fila ${rowNum}: Número de lote y propietario son requeridos`);
          continue;
        }

        // Check if lot already exists
        const existingLot = await prisma.lot.findFirst({
          where: { lotNumber }
        });

        if (existingLot) {
          // Update existing lot
          await prisma.lot.update({
            where: { id: existingLot.id },
            data: { owner }
          });
        } else {
          // Create new lot
          await prisma.lot.create({
            data: {
              lotNumber,
              owner
            }
          });
        }

        imported++;
      } catch (error) {
        console.error(`Error processing row ${rowNum}:`, error);
        errors.push(`Fila ${rowNum}: ${translations.errors.import.processing}`);
      }
    }

    revalidatePath("/lots");

    return {
      success: true,
      message: `Se importaron ${imported} lotes exitosamente`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error("Error importing lots:", error);
    return {
      success: false,
      message: translations.errors.import.lots
    };
  }
}

export async function importIncomesAction(csvContent: string): Promise<ImportResult> {
  try {
    await requireAuth();

    const rows = parseCSV(csvContent);
    if (rows.length < 2) {
      return {
        success: false,
        message: translations.errors.import.csvFormat
      };
    }

    const headers = rows[0];
    const expectedHeaders = ["ID", "Fecha", "Número de Lote", "Propietario", "Tipo", "Descripción", "Número de Recibo", "Monto"];
    
    // Validate headers
    if (!expectedHeaders.every(header => headers.includes(header))) {
      return {
        success: false,
        message: translations.errors.import.headerMismatch + expectedHeaders.join(", ")
      };
    }

    const dataRows = rows.slice(1);
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2;
      
      try {
        const date = parseDate(row[1]?.replace(/"/g, '') || '').toISOString();
        const lotNumber = row[2]?.replace(/"/g, '') || '';
        const owner = row[3]?.replace(/"/g, '') || '';
        const type = row[4]?.replace(/"/g, '') === 'Mantenimiento' ? 'maintenance' : 'works';
        const description = row[5]?.replace(/"/g, '') || '';
        const receiptNumber = row[6]?.replace(/"/g, '') || null;
        const amount = parseInt(row[7]?.replace(/"/g, '') || '0');

        if (!lotNumber || !owner || !amount || isNaN(amount)) {
          errors.push(`Fila ${rowNum}: ${translations.errors.import.missingData}`);
          continue;
        }

        // Find or create lot
        let lot = await prisma.lot.findFirst({
          where: { lotNumber }
        });

        if (!lot) {
          lot = await prisma.lot.create({
            data: {
              lotNumber,
              owner
            }
          });
        }

        // Create contribution
        await prisma.contribution.create({
          data: {
            lotId: lot.id,
            type,
            amount,
            date,
            description,
            receiptNumber
          }
        });

        imported++;
      } catch (error) {
        console.error(`Error processing row ${rowNum}:`, error);
        errors.push(`Fila ${rowNum}: ${translations.errors.import.processing}`);
      }
    }

    revalidatePath("/");
    revalidatePath("/lots");

    return {
      success: true,
      message: `Se importaron ${imported} ingresos exitosamente`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error("Error importing incomes:", error);
    return {
      success: false,
      message: translations.errors.import.incomes
    };
  }
}

export async function importExpensesAction(csvContent: string): Promise<ImportResult> {
  try {
    await requireAuth();

    const rows = parseCSV(csvContent);
    if (rows.length < 2) {
      return {
        success: false,
        message: translations.errors.import.csvFormat
      };
    }

    const headers = rows[0];
    const expectedHeaders = ["ID", "Fecha", "Tipo", "Categoría", "Descripción", "Número de Recibo", "Monto"];
    
    // Validate headers
    if (!expectedHeaders.every(header => headers.includes(header))) {
      return {
        success: false,
        message: translations.errors.import.headerMismatch + expectedHeaders.join(", ")
      };
    }

    const dataRows = rows.slice(1);
    const errors: string[] = [];
    let imported = 0;

    for (let i = 0; i < dataRows.length; i++) {
      const row = dataRows[i];
      const rowNum = i + 2;
      
      try {
        const date = parseDate(row[1]?.replace(/"/g, '') || '').toISOString();
        const type = row[2]?.replace(/"/g, '') === 'Mantenimiento' ? 'maintenance' : 'works';
        const category = row[3]?.replace(/"/g, '') || '';
        const description = row[4]?.replace(/"/g, '') || '';
        const receiptNumber = row[5]?.replace(/"/g, '') || null;
        const amount = parseInt(row[6]?.replace(/"/g, '') || '0');

        if (!category || !amount || isNaN(amount)) {
          errors.push(`Fila ${rowNum}: ${translations.errors.import.categoryRequired}`);
          continue;
        }

        // Create expense
        await prisma.expense.create({
          data: {
            type,
            category,
            amount,
            date,
            description,
            receiptNumber
          }
        });

        imported++;
      } catch (error) {
        console.error(`Error processing row ${rowNum}:`, error);
        errors.push(`Fila ${rowNum}: ${translations.errors.import.processing}`);
      }
    }

    revalidatePath("/expenses");

    return {
      success: true,
      message: `Se importaron ${imported} gastos exitosamente`,
      imported,
      errors: errors.length > 0 ? errors : undefined
    };

  } catch (error) {
    console.error("Error importing expenses:", error);
    return {
      success: false,
      message: translations.errors.import.expenses
    };
  }
}