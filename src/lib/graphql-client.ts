// GraphQL client using native fetch
const GRAPHQL_ENDPOINT = 'http://84.247.131.60:9598/graphql';

export interface GraphQLResponse<T> {
  data?: T;
  errors?: Array<{ message: string }>;
}

export async function graphqlFetch<T>(
  query: string,
  variables?: Record<string, any>
): Promise<T> {
  try {
    const response = await fetch(GRAPHQL_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables,
      }),
      mode: 'cors',
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json: GraphQLResponse<T> = await response.json();

    if (json.errors) {
      throw new Error(json.errors[0]?.message || 'GraphQL Error');
    }

    if (!json.data) {
      throw new Error('No data returned from GraphQL');
    }

    return json.data;
  } catch (error) {
    // Silent fallback - do not log anything
    throw error;
  }
}
