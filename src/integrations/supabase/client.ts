// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://plnmqvzajlmflthpkgjo.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsbm1xdnphamxtZmx0aHBrZ2pvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwNTc5NTMsImV4cCI6MjA1OTYzMzk1M30.NG1nWtWO85nJUB7VzbPygqTksUgSp3fQDk4l5wruuZc";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);