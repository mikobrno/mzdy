// This acts as the *whitelisted* low-level HTTP client in tests.
export async function doOk() {
  // Allowed: literal supabase URL
  // host: abc.supabase.co
  return fetch('https://abc.supabase.co/rest/v1/ok')
}

export async function doDynamicOk() {
  const url = 'https://abc.supabase.co/rest/v1/' + 'merge'
  // Dynamic → must be annotated:
  return fetch(url) // allow-dynamic-url
}

export async function doExternalNeedsAllow() {
  // This one should violate unless inline allowed; test: active external fetch without allow-external
  return fetch('https://api.example.com/x')
}

export { }
