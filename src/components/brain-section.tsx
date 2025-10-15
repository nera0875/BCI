import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { ScrollArea } from "./ui/scroll-area";
import { Breadcrumbs } from "./breadcrumbs";
import { DatabaseView } from "./database-view";
import {
  Database,
  Network,
  BarChart3,
  Search,
  RefreshCw,
  Plus,
  Link,
  Key,
  ScrollText,
  Code2,
  CheckSquare,
  Folder,
  Shield,
  Settings,
  ZoomIn,
  ZoomOut,
  Maximize,
  ArrowLeft
} from "lucide-react";
import {
  useMemoryStats,
  useSearchMemories,
  useDatabaseSchema,
  useParsedDatabaseNodes,
  useNeo4jRelations
} from "../lib/graphql-hooks";
import { useState } from "react";

export function BrainSection() {
  const [searchQuery, setSearchQuery] = useState("recent context");

  const { data: memoryStatsData, loading: statsLoading } = useMemoryStats();
  const { data: memoriesData, loading: memoriesLoading } = useSearchMemories({ query: searchQuery, limit: 10 });

  // Use REAL Neo4j API
  const { data: schemaData, loading: schemaLoading } = useDatabaseSchema();
  const { data: memoryNodesData, loading: nodesLoading } = useParsedDatabaseNodes({ label: "Memory", limit: 20 });
  
  const { data: relationsData } = useNeo4jRelations({ limit: 10 });

  const stats = memoryStatsData?.memoryStats;
  const memories = memoriesData?.memories || [];
  
  // Map real Neo4j schema to old format
  const schema = schemaData?.databaseSchema ? {
    success: schemaData.databaseSchema.success,
    tables: schemaData.databaseSchema.labels.map((label) => ({
      label: label.name,
      count: label.count,
    })),
    relationshipTypes: schemaData.databaseSchema.relationshipTypes.map((rt) => rt.name),
    totalTables: schemaData.databaseSchema.labels.length,
  } : undefined;
  
  // Map parsed Neo4j nodes to old format
  const nodes = (memoryNodesData?.databaseNodes || []).map((node: any) => ({
    id: node._id || node.id || 'unknown',
    text: node.content || node.text || 'No content',
    type: node._labels?.[0] || node.type || 'Unknown',
    status: node.status || 'active',
    project: node.project,
    timestamp: node.created_at || node.timestamp,
  }));
  
  const relations = relationsData?.neo4jRelations || [];

  return (
    <div className="space-y-6">
      <div>
        <h2>Brain</h2>
        <p className="text-muted-foreground">
          Memory, Knowledge Graph & Analytics
        </p>
      </div>

      <Tabs defaultValue="memory" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="memory">
            <Database className="h-4 w-4 mr-2" />
            Memory
          </TabsTrigger>
          <TabsTrigger value="database">
            <Database className="h-4 w-4 mr-2" />
            Database
          </TabsTrigger>
          <TabsTrigger value="graph">
            <Network className="h-4 w-4 mr-2" />
            Graph
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>

        {/* Memory Tab */}
        <TabsContent value="memory" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Vectors</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl">{stats?.qdrantVectors || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Nodes</CardTitle>
                <Network className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl">{stats?.neo4jNodes || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Relations</CardTitle>
                <Link className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl">{stats?.relations || 0}</div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Cache Hit</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                {statsLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-2xl">{Math.round((stats?.cache?.hitRate || 0) * 100)}%</div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Search Memories</CardTitle>
                  <CardDescription>Search through your knowledge base</CardDescription>
                </div>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Memory
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search memories..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Button variant="outline" size="icon">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {memoriesLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-24 w-full" />
                  ))
                ) : (
                  memories.map((memory) => (
                    <Card key={memory.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-1">
                            <p>{memory.text}</p>
                            <div className="flex gap-2">
                              <Badge variant="outline">{memory.type}</Badge>
                              {memory.tags.map((tag) => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                              ))}
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(memory.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Database Tab */}
        <TabsContent value="database" className="space-y-6">
          <DatabaseView />
        </TabsContent>

        {/* Graph Tab */}
        <TabsContent value="graph" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Knowledge Graph</CardTitle>
                  <CardDescription>Visualize relationships between memories in Neo4j</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Maximize className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative w-full h-[500px] bg-muted/30 rounded-lg flex items-center justify-center">
                {/* Simple Graph Visualization Placeholder */}
                <svg width="100%" height="100%" className="absolute inset-0">
                  {/* Central node */}
                  <circle cx="50%" cy="50%" r="50" fill="hsl(var(--chart-1))" opacity="0.8" />
                  <text x="50%" y="50%" textAnchor="middle" dy=".3em" className="text-xs fill-white">
                    Knowledge Graph
                  </text>
                  
                  {/* Connected nodes */}
                  <line x1="50%" y1="50%" x2="30%" y2="30%" stroke="hsl(var(--border))" strokeWidth="2" />
                  <circle cx="30%" cy="30%" r="35" fill="hsl(var(--chart-2))" opacity="0.8" />
                  <text x="30%" cy="30%" textAnchor="middle" dy=".3em" className="text-xs fill-white">
                    Memories
                  </text>
                  
                  <line x1="50%" y1="50%" x2="70%" y2="30%" stroke="hsl(var(--border))" strokeWidth="2" />
                  <circle cx="70%" cy="30%" r="35" fill="hsl(var(--chart-3))" opacity="0.8" />
                  <text x="70%" cy="30%" textAnchor="middle" dy=".3em" className="text-xs fill-white">
                    System
                  </text>
                  
                  <line x1="50%" y1="50%" x2="50%" y2="75%" stroke="hsl(var(--border))" strokeWidth="2" />
                  <circle cx="50%" cy="75%" r="35" fill="hsl(var(--chart-4))" opacity="0.8" />
                  <text x="50%" cy="75%" textAnchor="middle" dy=".3em" className="text-xs fill-white">
                    Tasks
                  </text>
                </svg>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Node Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {schema?.tables.map((table) => (
                    <div key={table.label} className="flex items-center justify-between p-2 rounded-lg border">
                      <div className="flex items-center gap-2">
                        <div className="h-3 w-3 rounded-full bg-chart-2" />
                        <span className="text-sm">{table.label}</span>
                      </div>
                      <Badge variant="secondary" className="text-xs">{table.count}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Relationship Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {schema?.relationshipTypes.map((type) => (
                    <div key={type} className="flex items-center gap-2 p-2 rounded-lg border">
                      <div className="h-0.5 w-8 bg-border" />
                      <span className="text-sm">{type}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>Monitor memory system health and usage</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={stats?.status === 'healthy' ? 'default' : 'destructive'}>
                    {stats?.status || 'Unknown'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Cache Hits</span>
                  <span>{stats?.cache?.hits || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2 border-b">
                  <span className="text-muted-foreground">Cache Misses</span>
                  <span>{stats?.cache?.misses || 0}</span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-muted-foreground">Cache Size</span>
                  <span>{stats?.cache?.size || 0} MB</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
