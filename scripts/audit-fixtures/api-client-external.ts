// Whitelisted client - external literal (should fail without allow-external)
export async function doExternalNeedsAllow() {
  return fetch('https://api.example.com/x')
}

export { }
