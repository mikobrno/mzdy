// Any direct fetch/axios here must be a violation in tests.
export async function bad() {
  return fetch('https://abc.supabase.co/rest/v1/ok') // should VIOLATE (not whitelisted file)
}
