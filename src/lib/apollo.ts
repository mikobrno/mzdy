// Shim for legacy apollo client. Project migrated to Supabase;
// keep this file as a harmless stub to avoid bundler errors while
// we remove all Apollo usages.

export const apolloClient = {
  // minimal stub methods if any consumer calls them
  // accept optional args so callers using apolloClient.query({...}) type-check
  query: async (_opts?: any) => ({ data: null }),
  mutate: async (_opts?: any) => ({ data: null }),
}
