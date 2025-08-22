declare module '@apollo/client' {
  export const gql: any
  export function useMutation(...args: any[]): any
  export function useQuery(...args: any[]): any
  export const ApolloClient: any
  export const InMemoryCache: any
  export const createHttpLink: any
  export const setContext: any
}

declare module '@apollo/client/link/context' {
  export const setContext: any
}

