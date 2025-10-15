/**
 * Centralized API configuration
 * All API endpoints are defined here for easy maintenance
 */

const isDevelopment = import.meta.env.DEV;

export const API_CONFIG = {
  // GraphQL endpoint (with fallback)
  graphqlEndpoint: import.meta.env.VITE_GRAPHQL_ENDPOINT || 'https://neurodopa.fr/bci/api/graphql',

  // REST API endpoints
  restEndpoint: 'https://neurodopa.fr/bci/api',
  tasksEndpoint: 'https://neurodopa.fr/bci/api-tasks',
  mcpEndpoint: 'https://neurodopa.fr/bci/api-mcp',
  databaseEndpoint: 'https://neurodopa.fr/bci/api-database',
  rulesEndpoint: 'https://neurodopa.fr/bci/api-rules',
  aiManagerEndpoint: 'https://neurodopa.fr/bci/api-ai-manager',

  // WebSocket endpoints
  wsEndpoint: 'wss://neurodopa.fr/bci/ws',

  // Development overrides (optional)
  ...(isDevelopment && {
    // Uncomment to use local backend in development:
    // graphqlEndpoint: 'http://localhost:9598/graphql',
  }),
} as const;

// Export individual endpoints for convenience
export const {
  graphqlEndpoint,
  restEndpoint,
  tasksEndpoint,
  mcpEndpoint,
  databaseEndpoint,
  rulesEndpoint,
  aiManagerEndpoint,
  wsEndpoint,
} = API_CONFIG;
