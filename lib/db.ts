import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRole) {
  throw new Error("Missing Supabase env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
}

export const db = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { persistSession: false }
});
