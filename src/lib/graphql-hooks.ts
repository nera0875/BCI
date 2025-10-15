import { useQuery as useApolloQuery, useMutation as useApolloMutation, gql } from '@apollo/client';

// ============= MOCK DATA =============

function getMockMemoryStats() {
  return {
    success: true,
    qdrantVectors: 1247,
    neo4jNodes: 523,
    relations: 834,
    cache: {
      hits: 1245,
      misses: 89,
      size: 1334,
      hitRate: 0.933,
    },
    status: 'healthy',
  };
}

function getMockNeo4jNodes() {
  return [
    {
      _id: 'mem_1',
      content: 'Architecture microservices du système BCI',
      type: 'context',
      status: 'active',
      project: 'BCI',
      created_at: new Date(Date.now() - 86400000).toISOString(),
      _labels: ['Memory'],
    },
    {
      _id: 'mem_2',
      content: 'Intégration GraphQL avec FastAPI',
      type: 'solution',
      status: 'active',
      project: 'BCI',
      created_at: new Date(Date.now() - 172800000).toISOString(),
      _labels: ['Memory'],
    },
  ];
}

// ============= GRAPHQL QUERIES =============

const DATABASE_SCHEMA_QUERY = gql`
  query GetDatabaseSchema {
    databaseSchema {
      success
      labels {
        name
        count
      }
      relationshipTypes {
        name
      }
    }
  }
`;

const DATABASE_NODES_QUERY = gql`
  query GetDatabaseNodes($label: String!, $limit: Int, $offset: Int) {
    databaseNodes(label: $label, limit: $limit, offset: $offset) {
      properties
    }
  }
`;

const HEALTH_CHECK_QUERY = gql`
  query GetHealthCheck {
    healthCheck {
      overallStatus
      neo4j {
        status
        message
        responseTimeMs
        lastChecked
      }
      qdrant {
        status
        message
        responseTimeMs
        lastChecked
      }
      postgres {
        status
        message
        responseTimeMs
        lastChecked
      }
      redis {
        status
        message
        responseTimeMs
        lastChecked
      }
    }
  }
`;

const MEMORY_STATS_QUERY = gql`
  query GetMemoryStats {
    memoryStats {
      success
      qdrantVectors
      neo4jNodes
      relations
      cache {
        hits
        misses
        size
        hitRate
      }
      status
    }
  }
`;

const SEARCH_MEMORIES_QUERY = gql`
  query SearchMemories($query: String!, $limit: Int, $type: String, $project: String, $includeRelations: Boolean) {
    memories(query: $query, limit: $limit, type: $type, project: $project, includeRelations: $includeRelations) {
      id
      text
      type
      tags
      project
      score
      timestamp
      status
      relations {
        relationType
        text
        type
      }
    }
  }
`;

const GET_TASKS_QUERY = gql`
  query GetTasks($status: String, $priority: String, $assignedTo: String, $limit: Int) {
    tasks(status: $status, priority: $priority, assignedTo: $assignedTo, limit: $limit) {
      id
      title
      description
      type
      priority
      status
      assignedTo
      createdAt
      updatedAt
      dueDate
      completedAt
      tags
    }
  }
`;

const TASK_STATS_QUERY = gql`
  query GetTaskStats {
    taskStats {
      success
      totalTasks
      pending
      inProgress
      completed
      cancelled
      completedToday
      totalPomodoros
    }
  }
`;

const SYSTEM_LOGS_QUERY = gql`
  query GetSystemLogs($limit: Int, $level: String, $service: String) {
    systemLogs(limit: $limit, level: $level, service: $service) {
      timestamp
      level
      message
      service
      details
    }
  }
`;

const METRICS_QUERY = gql`
  query GetMetrics {
    metrics {
      totalRequests
      errorCount
      errorRate
      avgResponseTimeMs
      lastError
      lastErrorTime
      uptimeSeconds
    }
  }
`;

// ============= GRAPHQL MUTATIONS =============

const UPDATE_NODE_MUTATION = gql`
  mutation UpdateNode($nodeId: String!, $properties: String!) {
    updateNode(nodeId: $nodeId, properties: $properties) {
      success
      data
      message
    }
  }
`;

const CREATE_NODE_MUTATION = gql`
  mutation CreateNode($input: CreateNodeInput!) {
    createNode(input: $input) {
      success
      nodeId
      message
    }
  }
`;

const DELETE_NODE_MUTATION = gql`
  mutation DeleteNode($nodeId: String!) {
    deleteNode(nodeId: $nodeId) {
      success
      count
      message
    }
  }
`;

const CYPHER_MUTATION = gql`
  mutation ExecuteCypher($cypher: String!, $parameters: String) {
    databaseQuery(cypher: $cypher, parameters: $parameters) {
      success
      data
      count
      message
    }
  }
`;

const STORE_MEMORY_MUTATION = gql`
  mutation StoreMemory($input: MemoryInput!) {
    storeMemory(input: $input) {
      success
      memoryId
      message
      relationsCreated
      autoExtracted
    }
  }
`;

const CREATE_TASK_MUTATION = gql`
  mutation CreateTask($input: CreateTaskInput!) {
    createTask(input: $input) {
      success
      task {
        id
        title
        description
        type
        priority
        status
        assignedTo
        createdAt
        tags
      }
      message
    }
  }
`;

const UPDATE_TASK_MUTATION = gql`
  mutation UpdateTask($taskId: String!, $input: UpdateTaskInput!) {
    updateTask(taskId: $taskId, input: $input) {
      success
      task {
        id
        title
        description
        priority
        status
        updatedAt
      }
      message
    }
  }
`;

const START_POMODORO_MUTATION = gql`
  mutation StartPomodoro($input: StartPomodoroInput!) {
    startPomodoro(input: $input) {
      success
      session {
        id
        taskId
        durationMinutes
        startedAt
        status
      }
      message
    }
  }
`;

const CREATE_RELATIONSHIP_MUTATION = gql`
  mutation CreateRelationship($input: CreateRelationshipInput!) {
    createRelationship(input: $input) {
      success
      relationshipId
      message
    }
  }
`;

// ============= HELPER FUNCTIONS =============

function parseNodeProperties(propertiesString: string): any {
  try {
    return JSON.parse(propertiesString);
  } catch {
    return {};
  }
}

// ============= CUSTOM HOOKS =============

// Database Schema
export const useDatabaseSchema = () => {
  const { data, loading, error, refetch } = useApolloQuery(DATABASE_SCHEMA_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  // Fallback to mock data on error
  if (error && !data) {
    return {
      data: {
        databaseSchema: {
          success: true,
          labels: [
            { name: 'Memory', count: 270 },
            { name: 'Task', count: 42 },
            { name: 'User', count: 5 },
            { name: 'Project', count: 8 },
          ],
          relationshipTypes: [
            { name: 'RELATES_TO' },
            { name: 'DEPENDS_ON' },
            { name: 'USES' },
          ],
        },
      },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// Database Nodes (raw)
export const useDatabaseNodes = (variables: { label: string; limit?: number; offset?: number }) => {
  const { data, loading, error, refetch } = useApolloQuery(DATABASE_NODES_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
    skip: !variables.label,
  });

  // Fallback to mock data on error
  if (error && !data) {
    const mockNodes = variables.label === 'Memory'
      ? getMockNeo4jNodes().map(node => ({
          properties: JSON.stringify(node),
        }))
      : [];

    return {
      data: { databaseNodes: mockNodes },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// Parsed Database Nodes
export const useParsedDatabaseNodes = (variables: { label: string; limit?: number; offset?: number }, options?: { skip?: boolean }) => {
  const result = useDatabaseNodes(variables);

  if (!result.data) {
    return result;
  }

  // Parse all properties from JSON strings
  const parsedNodes = result.data.databaseNodes?.map((node: any) => parseNodeProperties(node.properties)) || [];

  return {
    ...result,
    data: {
      databaseNodes: parsedNodes,
    },
  };
};

// Health Check
export const useHealthCheck = () => {
  const { data, loading, error, refetch } = useApolloQuery(HEALTH_CHECK_QUERY, {
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
    pollInterval: 30000, // Refetch every 30s
  });

  // Fallback to unknown status on error
  if (error && !data) {
    return {
      data: {
        healthCheck: {
          overallStatus: 'unknown',
          neo4j: {
            status: 'unknown',
            message: 'Unable to connect to backend',
            responseTimeMs: null,
            lastChecked: new Date().toISOString(),
          },
          qdrant: {
            status: 'unknown',
            message: 'Unable to connect to backend',
            responseTimeMs: null,
            lastChecked: new Date().toISOString(),
          },
          postgres: {
            status: 'unknown',
            message: 'Unable to connect to backend',
            responseTimeMs: null,
            lastChecked: new Date().toISOString(),
          },
          redis: {
            status: 'unknown',
            message: 'Unable to connect to backend',
            responseTimeMs: null,
            lastChecked: new Date().toISOString(),
          },
        },
      },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// Memory Stats
export const useMemoryStats = () => {
  const { data, loading, error, refetch } = useApolloQuery(MEMORY_STATS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  if (error && !data) {
    return {
      data: { memoryStats: getMockMemoryStats() },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// Search Memories
export const useSearchMemories = (variables: { query: string; limit?: number; type?: string; project?: string; includeRelations?: boolean }) => {
  const { data, loading, error, refetch } = useApolloQuery(SEARCH_MEMORIES_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  if (error && !data) {
    return {
      data: { memories: [] },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// Tasks
export const useTasks = (variables?: { status?: string; priority?: string; assignedTo?: string; limit?: number }) => {
  const { data, loading, error, refetch } = useApolloQuery(GET_TASKS_QUERY, {
    variables,
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  if (error && !data) {
    return {
      data: { tasks: [] },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// Task Stats
export const useTaskStats = () => {
  const { data, loading, error, refetch } = useApolloQuery(TASK_STATS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  if (error && !data) {
    return {
      data: {
        taskStats: {
          success: true,
          totalTasks: 0,
          pending: 0,
          inProgress: 0,
          completed: 0,
          cancelled: 0,
          completedToday: 0,
          totalPomodoros: 0,
        },
      },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// System Logs
export const useSystemLogs = (variables?: { limit?: number; level?: string; service?: string }) => {
  const { data, loading, error, refetch } = useApolloQuery(SYSTEM_LOGS_QUERY, {
    variables,
    fetchPolicy: 'network-only',
    errorPolicy: 'all',
  });

  if (error && !data) {
    return {
      data: {
        systemLogs: [
          {
            timestamp: new Date().toISOString(),
            level: 'INFO',
            message: 'Mock data - Backend offline',
            service: 'system',
            details: null,
          },
        ],
      },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// Metrics
export const useMetrics = () => {
  const { data, loading, error, refetch } = useApolloQuery(METRICS_QUERY, {
    fetchPolicy: 'cache-and-network',
    errorPolicy: 'all',
  });

  if (error && !data) {
    return {
      data: {
        metrics: {
          totalRequests: 0,
          errorCount: 0,
          errorRate: 0,
          avgResponseTimeMs: 0,
          lastError: null,
          lastErrorTime: null,
          uptimeSeconds: 0,
        },
      },
      loading: false,
      error: undefined,
      refetch,
    };
  }

  return { data, loading, error, refetch };
};

// ============= MUTATIONS =============

// Update Node
export const useUpdateNode = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(UPDATE_NODE_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Create Node
export const useCreateNode = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(CREATE_NODE_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Delete Node
export const useDeleteNode = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(DELETE_NODE_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Cypher Mutation
export const useCypherMutation = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(CYPHER_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Store Memory
export const useStoreMemory = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(STORE_MEMORY_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Create Task
export const useCreateTask = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(CREATE_TASK_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Update Task
export const useUpdateTask = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(UPDATE_TASK_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Start Pomodoro
export const useStartPomodoro = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(START_POMODORO_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};

// Create Relationship
export const useCreateRelationship = (options?: any) => {
  const [mutate, { data, loading, error }] = useApolloMutation(CREATE_RELATIONSHIP_MUTATION, {
    errorPolicy: 'all',
    onCompleted: options?.onCompleted,
    onError: options?.onError,
  });

  return [mutate, { data, loading, error }];
};
