import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client'
import { setContext } from '@apollo/client/link/context'
import { nhost } from './nhost'

// HTTP link k Nhost GraphQL endpointu
const httpLink = createHttpLink({
  uri: nhost.graphql.getUrl(),
})

// Auth link pro přidání authorization tokenu
const authLink = setContext((_, { headers }) => {
  const token = nhost.auth.getAccessToken()
  
  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    }
  }
})

// Vytvoření Apollo Client instance
export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'ignore',
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
    },
  },
})
