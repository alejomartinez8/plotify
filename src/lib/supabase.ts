import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types based on our Supabase schema
export type Database = {
  public: {
    Tables: {
      lots: {
        Row: {
          id: string;
          lot_number: string;
          owner: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          lot_number: string;
          owner: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          lot_number?: string;
          owner?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      contributions: {
        Row: {
          id: number;
          lot_id: string;
          type: string;
          amount: number;
          date: string;
          description: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          lot_id: string;
          type: string;
          amount: number;
          date: string;
          description: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          lot_id?: string;
          type?: string;
          amount?: number;
          date?: string;
          description?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      expenses: {
        Row: {
          id: number;
          type: string;
          amount: number;
          date: string;
          description: string;
          category: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          type: string;
          amount: number;
          date: string;
          description: string;
          category: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          type?: string;
          amount?: number;
          date?: string;
          description?: string;
          category?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
};
