const fs = require('fs');
const path = require('path');

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
    const repoRoot = path.resolve(__dirname, '..');
    const envPathLocal = path.join(repoRoot, '.env.local');
    const envPath = fs.existsSync(envPathLocal) ? envPathLocal : path.join(repoRoot, '.env');
    console.log('Using env file:', envPath);
    const env = parseEnv(envPath);
    const supabaseUrl = env.VITE_SUPABASE_URL;
    const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error('Supabase URL or ANON key missing in env file');
      process.exit(2);
    }

    const { createClient } = require('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const email = 'admin@example.com';
    const password = 'admin123';

    console.log('Attempting sign-in for', email);
    const res = await supabase.auth.signInWithPassword({ email, password });
    console.log('Result:', JSON.stringify(res, null, 2));
    if (res.error) {
      console.error('Login failed:', res.error.message);
      process.exit(1);
    }
    console.log('Login succeeded. User id:', res.data?.user?.id);
  } catch (err) {
    console.error('Test script error:', err);
    process.exit(3);
  }
})();
