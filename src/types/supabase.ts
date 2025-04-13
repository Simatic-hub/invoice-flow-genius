
// Extension of Supabase types to handle quotes and other tables
// This helps TypeScript recognize tables that might not be in the auto-generated types

import { Database } from '@/integrations/supabase/types';

// Extend the Database type
export interface ExtendedDatabase extends Database {
  public: Database['public'] & {
    Tables: Database['public']['Tables'] & {
      quotes: {
        Row: {
          id: string;
          user_id: string;
          client_id: string;
          invoice_number: string;
          date: string;
          due_date: string | null;
          amount: number;
          status: string;
          created_at: string;
          updated_at: string;
          delivery_date: string | null;
          po_number: string | null;
          notes: string | null;
          payment_info: string | null;
          payment_terms: string | null;
          attachment_path: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          client_id: string;
          invoice_number: string;
          date: string;
          due_date?: string | null;
          amount: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          delivery_date?: string | null;
          po_number?: string | null;
          notes?: string | null;
          payment_info?: string | null;
          payment_terms?: string | null;
          attachment_path?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          client_id?: string;
          invoice_number?: string;
          date?: string;
          due_date?: string | null;
          amount?: number;
          status?: string;
          created_at?: string;
          updated_at?: string;
          delivery_date?: string | null;
          po_number?: string | null;
          notes?: string | null;
          payment_info?: string | null;
          payment_terms?: string | null;
          attachment_path?: string | null;
        };
      };
      // Update clients type to include new fields
      clients: Database['public']['Tables']['clients'] & {
        Row: Database['public']['Tables']['clients']['Row'] & {
          address: string | null;
          vat_number: string | null;
          city: string | null;
          postal_code: string | null;
          country: string | null;
        };
        Insert: Database['public']['Tables']['clients']['Insert'] & {
          address?: string | null;
          vat_number?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
        };
        Update: Database['public']['Tables']['clients']['Update'] & {
          address?: string | null;
          vat_number?: string | null;
          city?: string | null;
          postal_code?: string | null;
          country?: string | null;
        };
      };
      // Update invoices type to include new fields
      invoices: Database['public']['Tables']['invoices'] & {
        Row: Database['public']['Tables']['invoices']['Row'] & {
          invoice_number: string;
          date: string;
          delivery_date: string | null;
          po_number: string | null;
          notes: string | null;
          payment_info: string | null;
          payment_terms: string | null;
          attachment_path: string | null;
        };
        Insert: Database['public']['Tables']['invoices']['Insert'] & {
          invoice_number: string;
          date: string;
          delivery_date?: string | null;
          po_number?: string | null;
          notes?: string | null;
          payment_info?: string | null;
          payment_terms?: string | null;
          attachment_path?: string | null;
        };
        Update: Database['public']['Tables']['invoices']['Update'] & {
          invoice_number?: string;
          date?: string;
          delivery_date?: string | null;
          po_number?: string | null;
          notes?: string | null;
          payment_info?: string | null;
          payment_terms?: string | null;
          attachment_path?: string | null;
        };
      };
    };
  };
}

// Create a new ExtendedSupabaseClient type
export type ExtendedSupabaseClient = ReturnType<typeof createExtendedClient>;

// This is a utility function that we'll use to extend the types for the supabase client
import { createClient } from '@supabase/supabase-js';

export function createExtendedClient(
  supabaseUrl: string,
  supabaseKey: string
) {
  return createClient<ExtendedDatabase>(supabaseUrl, supabaseKey);
}
