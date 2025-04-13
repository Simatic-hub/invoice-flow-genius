
import { Database } from '@/integrations/supabase/types';
import { PostgrestError } from '@supabase/supabase-js';

// Response types for specific tables
export type InvoiceResponse = Database['public']['Tables']['invoices']['Row'];
export type QuoteResponse = Database['public']['Tables']['quotes']['Row'];
export type ClientResponse = Database['public']['Tables']['clients']['Row'];
export type BusinessSettingsResponse = Database['public']['Tables']['business_settings']['Row'];
export type ProfileResponse = Database['public']['Tables']['profiles']['Row'];

// Error handling helper type
export type QueryResult<T> = {
  data: T | null;
  error: PostgrestError | null;
};

// Generic type for table data with error handling
export type TableData<T> = T | { error: PostgrestError };

// Helper function to check if a result is an error
export function isQueryError<T>(result: T | { error: PostgrestError }): result is { error: PostgrestError } {
  return (result as any).error !== undefined;
}
