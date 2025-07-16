import { Expense } from "@/types/expenses.types";
import { ContributionType } from "@/types/contributions.types";
import { formatCurrency } from "@/lib/utils";

interface ExpenseListProps {
  title: string;
  expenses: Expense[];
  type: ContributionType;
  color: "blue" | "orange";
}

export default async function ExpenseList({
  title,
  expenses,
  type,
  color,
}: ExpenseListProps) {
  const filteredExpenses = expenses.filter((e) => e.type === type);

  const colorClasses = {
    blue: "text-blue-600",
    orange: "text-orange-600",
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h3 className={`text-lg font-semibold mb-4 ${colorClasses[color]}`}>
        {title}
      </h3>
      <div className="space-y-3">
        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="flex justify-between items-center p-3 bg-gray-50 rounded-sm"
          >
            <div>
              <p className="font-medium">{expense.description}</p>
              <p className="text-sm text-gray-600">{expense.date}</p>
            </div>
            <span className="font-semibold text-red-600">
              {formatCurrency(expense.amount)}
            </span>
          </div>
        ))}
        {filteredExpenses.length === 0 && (
          <p className="text-gray-500 text-center py-4">No expenses recorded</p>
        )}
      </div>
    </div>
  );
}
