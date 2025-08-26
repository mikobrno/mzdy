// Whitelisted client - dynamic URL annotated with allow-dynamic-url
export async function doDynamicOk() {
  const url = 'https://abc.supabase.co/rest/v1/' + 'merge'
  return fetch(url) // allow-dynamic-url
}

export { }
