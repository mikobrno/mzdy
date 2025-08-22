import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'TVOJE_SUPABASE_PROJECT_URL'; // Sem vlož URL projektu
const supabaseAnonKey = 'TVUJ_SUPABASE_ANON_KEY'; // Sem vlož anon public key

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
