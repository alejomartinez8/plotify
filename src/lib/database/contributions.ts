import { supabase } from "@/lib/supabase";
import { Contribution } from "@/types/contributions.types";

export async function getContributions(): Promise<Contribution[]> {
  try {
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching contributions:", error);
      return [];
    }

    return data.map((contribution) => ({
      id: contribution.id,
      lotId: contribution.lot_id,
      type: contribution.type,
      amount: contribution.amount,
      date: contribution.date,
      description: contribution.description,
    }));
  } catch (error) {
    console.error("Error fetching contributions:", error);
    return [];
  }
}

export async function getContributionById(
  id: number
): Promise<Contribution | null> {
  try {
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching contribution by id:", error);
      return null;
    }

    return {
      id: data.id,
      lotId: data.lot_id,
      type: data.type,
      amount: data.amount,
      date: data.date,
      description: data.description,
    };
  } catch (error) {
    console.error("Error fetching contribution by id:", error);
    return null;
  }
}

export async function createContribution(data: {
  lotId: string;
  type: string;
  amount: number;
  date: string;
  description: string;
}): Promise<Contribution | null> {
  try {
    const { data: newContribution, error } = await supabase
      .from("contributions")
      .insert({
        lot_id: data.lotId,
        type: data.type,
        amount: data.amount,
        date: data.date,
        description: data.description,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating contribution:", error);
      return null;
    }

    return {
      id: newContribution.id,
      lotId: newContribution.lot_id,
      type: newContribution.type,
      amount: newContribution.amount,
      date: newContribution.date,
      description: newContribution.description,
    };
  } catch (error) {
    console.error("Error creating contribution:", error);
    return null;
  }
}

export async function updateContribution(
  id: number,
  data: {
    lotId?: string;
    type?: string;
    amount?: number;
    date?: string;
    description?: string;
  }
): Promise<Contribution | null> {
  try {
    const updateData: any = {};
    if (data.lotId) updateData.lot_id = data.lotId;
    if (data.type) updateData.type = data.type;
    if (data.amount !== undefined) updateData.amount = data.amount;
    if (data.date) updateData.date = data.date;
    if (data.description) updateData.description = data.description;

    const { data: updatedContribution, error } = await supabase
      .from("contributions")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating contribution:", error);
      return null;
    }

    return {
      id: updatedContribution.id,
      lotId: updatedContribution.lot_id,
      type: updatedContribution.type,
      amount: updatedContribution.amount,
      date: updatedContribution.date,
      description: updatedContribution.description,
    };
  } catch (error) {
    console.error("Error updating contribution:", error);
    return null;
  }
}

export async function deleteContribution(id: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("contributions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting contribution:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting contribution:", error);
    return false;
  }
}

export async function getContributionsByLot(
  lotId: string
): Promise<Contribution[]> {
  try {
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("lot_id", lotId)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching contributions by lot:", error);
      return [];
    }

    return data.map((contribution) => ({
      id: contribution.id,
      lotId: contribution.lot_id,
      type: contribution.type,
      amount: contribution.amount,
      date: contribution.date,
      description: contribution.description,
    }));
  } catch (error) {
    console.error("Error fetching contributions by lot:", error);
    return [];
  }
}

export async function getContributionsByType(
  type: string
): Promise<Contribution[]> {
  try {
    const { data, error } = await supabase
      .from("contributions")
      .select("*")
      .eq("type", type)
      .order("date", { ascending: false });

    if (error) {
      console.error("Error fetching contributions by type:", error);
      return [];
    }

    return data.map((contribution) => ({
      id: contribution.id,
      lotId: contribution.lot_id,
      type: contribution.type,
      amount: contribution.amount,
      date: contribution.date,
      description: contribution.description,
    }));
  } catch (error) {
    console.error("Error fetching contributions by type:", error);
    return [];
  }
}
