import { supabase } from "@/lib/supabase";
import { Expense } from "@/types/expenses.types";

export async function getExpenses(): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses:", error);
      return [];
    }

    return data.map((expense) => ({
      id: expense.id,
      type: expense.type,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      category: expense.category,
    }));
  } catch (error) {
    console.error("Error fetching expenses:", error);
    return [];
  }
}

export async function getExpenseById(id: number): Promise<Expense | null> {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching expense by id:", error);
      return null;
    }

    return {
      id: data.id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      description: data.description,
      category: data.category,
    };
  } catch (error) {
    console.error("Error fetching expense by id:", error);
    return null;
  }
}

export async function createExpense(data: {
  type: string;
  amount: number;
  date: string;
  description: string;
  category: string;
}): Promise<Expense | null> {
  try {
    const { data: newExpense, error } = await supabase
      .from("expenses")
      .insert({
        type: data.type,
        amount: data.amount,
        date: data.date,
        description: data.description,
        category: data.category,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating expense:", error);
      return null;
    }

    return {
      id: newExpense.id,
      type: newExpense.type,
      amount: newExpense.amount,
      date: newExpense.date,
      description: newExpense.description,
      category: newExpense.category,
    };
  } catch (error) {
    console.error("Error creating expense:", error);
    return null;
  }
}

export async function updateExpense(
  id: number,
  data: {
    type?: string;
    amount?: number;
    date?: string;
    description?: string;
    category?: string;
  }
): Promise<Expense | null> {
  try {
    const updateData: any = {};
    if (data.type) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date) updateData.date = data.date;
    if (data.description) updateData.description = data.description;
    if (data.category) updateData.category = data.category;

    const { data: updatedExpense, error } = await supabase
      .from("expenses")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating expense:", error);
      return null;
    }

    return {
      id: updatedExpense.id,
      type: updatedExpense.type,
      amount: updatedExpense.amount,
      date: updatedExpense.date,
      description: updatedExpense.description,
      category: updatedExpense.category,
    };
  } catch (error) {
    console.error("Error updating expense:", error);
    return null;
  }
}

export async function deleteExpense(id: number): Promise<boolean> {
  try {
    const { error } = await supabase.from("expenses").delete().eq("id", id);

    if (error) {
      console.error("Error deleting expense:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting expense:", error);
    return false;
  }
}

export async function getExpensesByType(type: string): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("type", type)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses by type:", error);
      return [];
    }

    return data.map((expense) => ({
      id: expense.id,
      type: expense.type,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      category: expense.category,
    }));
  } catch (error) {
    console.error("Error fetching expenses by type:", error);
    return [];
  }
}

export async function getExpensesByCategory(
  category: string
): Promise<Expense[]> {
  try {
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .eq("category", category)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching expenses by category:", error);
      return [];
    }

    return data.map((expense) => ({
      id: expense.id,
      type: expense.type,
      amount: expense.amount,
      date: expense.date,
      description: expense.description,
      category: expense.category,
    }));
  } catch (error) {
    console.error("Error fetching expenses by category:", error);
    return [];
  }
}
