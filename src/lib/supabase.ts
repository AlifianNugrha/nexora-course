import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://ybkprcpivuoawdjoipuw.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_6UWeXQu8S6_CxV2K3IJfIA_KUVbU3jD";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
