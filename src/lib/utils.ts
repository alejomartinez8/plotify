export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0
  }).format(amount);
}

export function getCurrentMonth(): string {
  return new Date().toLocaleString('en-US', { month: 'short' }).toUpperCase();
}

export async function fetchData<T>(endpoint: string): Promise<T> {
  const response = await fetch(`http://localhost:3000/api/${endpoint}`);
  if (!response.ok) throw new Error('Failed to fetch data');
  return response.json();
}

export const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
