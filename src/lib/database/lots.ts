import { supabase } from "@/lib/supabase";
import { Lot } from "@/types/lots.types";

export async function getLots(): Promise<Lot[]> {
  try {
    const { data, error } = await supabase
      .from("lots")
      .select("*")
      .order("lot_number", { ascending: true });

    if (error) {
      console.error("Error fetching lots:", error);
      return [];
    }

    return data.map((lot) => ({
      id: lot.id,
      lotNumber: lot.lot_number,
      owner: lot.owner,
    }));
  } catch (error) {
    console.error("Error fetching lots:", error);
    return [];
  }
}

export async function getLotById(id: string): Promise<Lot | null> {
  try {
    const { data, error } = await supabase
      .from("lots")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lot by id:", error);
      return null;
    }

    return {
      id: data.id,
      lotNumber: data.lot_number,
      owner: data.owner,
    };
  } catch (error) {
    console.error("Error fetching lot by id:", error);
    return null;
  }
}

export async function createLot(data: {
  lotNumber: string;
  owner: string;
}): Promise<Lot | null> {
  try {
    const { data: newLot, error } = await supabase
      .from("lots")
      .insert({
        lot_number: data.lotNumber,
        owner: data.owner,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating lot:", error);
      return null;
    }

    return {
      id: newLot.id,
      lotNumber: newLot.lot_number,
      owner: newLot.owner,
    };
  } catch (error) {
    console.error("Error creating lot:", error);
    return null;
  }
}

export async function updateLot(
  id: string,
  data: { lotNumber?: string; owner?: string }
): Promise<Lot | null> {
  try {
    const updateData: any = {};
    if (data.lotNumber) updateData.lot_number = data.lotNumber;
    if (data.owner) updateData.owner = data.owner;

    const { data: updatedLot, error } = await supabase
      .from("lots")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating lot:", error);
      return null;
    }

    return {
      id: updatedLot.id,
      lotNumber: updatedLot.lot_number,
      owner: updatedLot.owner,
    };
  } catch (error) {
    console.error("Error updating lot:", error);
    return null;
  }
}

export async function deleteLot(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from("lots").delete().eq("id", id);

    if (error) {
      console.error("Error deleting lot:", error);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error deleting lot:", error);
    return false;
  }
}

export async function getLotWithContributions(id: string) {
  try {
    const { data, error } = await supabase
      .from("lots")
      .select(
        `
        *,
        contributions (
          id,
          lot_id,
          type,
          amount,
          date,
          description,
          created_at,
          updated_at
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching lot with contributions:", error);
      return null;
    }

    return {
      id: data.id,
      lotNumber: data.lot_number,
      owner: data.owner,
      contributions: data.contributions
        .map((contribution: any) => ({
          id: contribution.id,
          lotId: contribution.lot_id,
          type: contribution.type,
          amount: contribution.amount,
          date: contribution.date,
          description: contribution.description,
        }))
        .sort(
          (a: any, b: any) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        ),
    };
  } catch (error) {
    console.error("Error fetching lot with contributions:", error);
    return null;
  }
}
