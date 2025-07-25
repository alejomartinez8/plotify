import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    currencyDisplay: "symbol",
  }).format(amount).replace("COP", "$");
}

export function getCurrentMonth(): string {
  return new Date().toLocaleString("en-US", { month: "short" }).toUpperCase();
}

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`http://localhost:3000/api/${endpoint}`);
  if (!response.ok) throw new Error("Failed to fetch data");
  return response.json();
}


export function formatDateForStorage(dateInput: string | Date): string {
  if (typeof dateInput === 'string') {
    // If already a string in YYYY-MM-DD format, return as is
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return dateInput;
    }
  }
  
  // Parse date string as local date to avoid timezone issues (same logic as formatDateForDisplay)
  let date: Date;
  
  if (typeof dateInput === 'string') {
    // If it's a YYYY-MM-DD string, parse it as local date
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateInput.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }
  
  // Use local methods for consistency with formatDateForDisplay
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateForDisplay(dateInput: string | Date): string {
  // Parse date string as local date to avoid timezone issues
  let date: Date;
  
  if (typeof dateInput === 'string') {
    // If it's a YYYY-MM-DD string, parse it as local date
    if (dateInput.match(/^\d{4}-\d{2}-\d{2}$/)) {
      const [year, month, day] = dateInput.split('-').map(Number);
      date = new Date(year, month - 1, day);
    } else {
      date = new Date(dateInput);
    }
  } else {
    date = dateInput;
  }
  
  // Return DD/MM/YYYY format for display
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}
