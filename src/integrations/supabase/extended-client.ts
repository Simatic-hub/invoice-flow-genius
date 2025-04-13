
import { createClient } from '@supabase/supabase-js';
import { supabase } from './client';
import { Database } from './types';

// Define the line item interface
export interface LineItem {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
  vat_rate: string | number;
  total: number;
}

// Define the extended database type to include the line_items column
export interface ExtendedDatabase {
  public: {
    Tables: {
      invoices: Database['public']['Tables']['invoices'] & {
        Row: {
          line_items: LineItem[];
        };
        Insert: {
          line_items?: LineItem[];
        };
        Update: {
          line_items?: LineItem[];
        };
      };
      quotes: Database['public']['Tables']['quotes'] & {
        Row: {
          line_items: LineItem[];
        };
        Insert: {
          line_items?: LineItem[];
        };
        Update: {
          line_items?: LineItem[];
        };
      };
      clients: Database['public']['Tables']['clients'] & {
        Row: {
          vat_number?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
        };
        Insert: {
          vat_number?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
        };
        Update: {
          vat_number?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
        };
      };
    };
    Views: Database['public']['Views'];
    Functions: Database['public']['Functions'];
    Enums: Database['public']['Enums'];
    CompositeTypes: Database['public']['CompositeTypes'];
  };
}

// Cast the existing supabase client to use our extended database type
export const extendedSupabase = supabase as unknown as ReturnType<typeof createExtendedClient>;

// This is just to make TypeScript happy, we don't actually call this function
function createExtendedClient(
  supabaseUrl: string, 
  supabaseKey: string
) {
  return createClient<ExtendedDatabase>(supabaseUrl, supabaseKey);
}
