// Quick check of Supabase connection and data status
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function parseEnv(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split(/\r?\n/);
  const env = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx);
    const val = trimmed.slice(idx + 1);
    env[key] = val;
  }
  return env;
}

(async () => {
  try {
    const repoRoot = __dirname;
    const envPathLocal = path.join(repoRoot, '.env.local');
    const envPath = fs.existsSync(envPathLocal) ? envPathLocal : path.join(repoRoot, '.env');
    console.log('Using env file:', envPath);
    
    if (!fs.existsSync(envPath)) {
      console.error('No .env file found. Please create .env.local with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
      process.exit(2);
    }

    const env = parseEnv(envPath);
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or ANON key missing in env file');
      process.exit(2);
    }

    console.log('✓ Supabase URL:', supabaseUrl);
    console.log('✓ Supabase ANON key present:', !!supabaseAnonKey);

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Check tables exist and have data
    const tables = ['svj', 'employees', 'payrolls', 'pdf_templates', 'health_insurance_companies'];
    
    for (const table of tables) {
      try {
        const { data, error, count } = await supabase.from(table).select('id', { count: 'exact' }).limit(1);
        if (error) {
          console.error(`✗ Table ${table}:`, error.message);
        } else {
          console.log(`✓ Table ${table}: ${count || 0} rows, sample data:`, data?.length > 0 ? 'present' : 'empty');
        }
      } catch (e) {
        console.error(`✗ Table ${table}: connection error`, e.message);
      }
    }

    // Check view
    try {
      const { data, error } = await supabase.from('v_payrolls_overview').select('*').limit(1);
      if (error) {
        console.error('✗ View v_payrolls_overview:', error.message);
      } else {
        console.log('✓ View v_payrolls_overview: working');
      }
    } catch (e) {
      console.error('✗ View v_payrolls_overview:', e.message);
    }

  } catch (err) {
    console.error('Check failed:', err);
    process.exit(1);
  }
})();
