"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { translations } from "@/lib/translations";
import { MonthlyDataPoint } from "@/lib/database/balances";

interface FinancialChartProps {
  data: MonthlyDataPoint[];
}

function formatYAxis(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

function formatMonthLabel(month: string): string {
  const [year, m] = month.split("-");
  const label = translations.months[parseInt(m, 10) - 1];
  return `${label} ${year.slice(2)}`;
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { name: string; value: number; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-md text-xs">
      <p className="mb-1 font-semibold text-gray-700">
        {label ? formatMonthLabel(label) : ""}
      </p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name === "income" ? translations.labels.income : translations.labels.expenses}:{" "}
          <span className="font-semibold">
            {new Intl.NumberFormat("es-CO", {
              style: "currency",
              currency: "COP",
              maximumFractionDigits: 0,
            }).format(p.value)}
          </span>
        </p>
      ))}
    </div>
  );
}

export default function FinancialChart({ data }: FinancialChartProps) {
  if (data.length === 0) {
    return (
      <p className="text-center text-sm text-gray-400">
        {translations.labels.noChartData}
      </p>
    );
  }

  const chartData = data.map((d) => ({
    ...d,
    label: d.month,
  }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis
          dataKey="label"
          tickFormatter={formatMonthLabel}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fill: "#6b7280" }}
          tickLine={false}
          axisLine={false}
          width={56}
        />
        <Tooltip content={<CustomTooltip />} />
        <Legend
          wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          formatter={(value) =>
            value === "income"
              ? translations.labels.income
              : translations.labels.expenses
          }
        />
        <Line
          type="monotone"
          dataKey="income"
          stroke="#059669"
          strokeWidth={2}
          dot={{ r: 3, fill: "#059669" }}
          activeDot={{ r: 5 }}
        />
        <Line
          type="monotone"
          dataKey="expenses"
          stroke="#dc2626"
          strokeWidth={2}
          dot={{ r: 3, fill: "#dc2626" }}
          activeDot={{ r: 5 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
