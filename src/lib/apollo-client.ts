import { ApolloClient, InMemoryCache, HttpLink, from } from '@apollo/client/core';
import { onError } from '@apollo/client/link/error';
import { RetryLink } from '@apollo/client/link/retry';
import { graphqlEndpoint } from '../config/api';

const GRAPHQL_ENDPOINT = graphqlEndpoint;

// Retry link with exponential backoff
const retryLink = new RetryLink({
  delay: {
    initial: 300,
    max: 30000,
    jitter: true,
  },
  attempts: {
    max: 3,
    retryIf: (error, _operation) => {
      // Retry on network errors or 5xx errors
      return !!error && (
        error.message.includes('NetworkError') ||
        error.message.includes('fetch') ||
        (error.statusCode && error.statusCode >= 500)
      );
    },
  },
});

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError, operation }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${JSON.stringify(locations)}, Path: ${path}`
      );
    });
  }

  if (networkError) {
    console.error(`[Network error ${operation.operationName}]: ${networkError.message}`);
    // Emit custom event for health check to detect backend offline
    window.dispatchEvent(new CustomEvent('apollo-network-error', {
      detail: { operation: operation.operationName, error: networkError.message }
    }));
  }
});

// HTTP link with CORS
const httpLink = new HttpLink({
  uri: GRAPHQL_ENDPOINT,
  credentials: 'omit',
  fetchOptions: {
    mode: 'cors',
  },
});

// Combine links: error handling → retry → http
const link = from([errorLink, retryLink, httpLink]);

// Apollo Client with normalized cache
export const apolloClient = new ApolloClient({
  link,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          databaseNodes: {
            merge(existing = [], incoming) {
              return incoming;
            },
          },
          systemStatus: {
            merge(existing, incoming) {
              return incoming;
            },
          },
        },
      },
      DatabaseNode: {
        keyFields: ['id'],
      },
      Memory: {
        keyFields: ['id'],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network',
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true,
    },
    query: {
      fetchPolicy: 'network-only',
      errorPolicy: 'all',
    },
    mutate: {
      errorPolicy: 'all',
    },
  },
  connectToDevTools: import.meta.env.DEV,
});
