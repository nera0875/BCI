import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import { Database, Network, GitBranch, Circle } from "lucide-react";
import { useNeo4jExplore } from "../lib/graphql-hooks";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";

export function Neo4jSection() {
  const { data, loading, error } = useNeo4jExplore({
    pollInterval: 15000, // Refresh every 15 seconds
  });

  return (
    <div className="space-y-6">
      <div>
        <h2>Neo4j Explorer</h2>
        <p className="text-muted-foreground">
          Visualisation du graphe de connaissances
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="pt-6">
            <p className="text-destructive">Erreur de connexion à Neo4j</p>
            <p className="text-muted-foreground mt-2 text-sm">
              {error.message}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Schema Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Schéma de la base de données</CardTitle>
          <CardDescription>
            Labels et types de relations disponibles
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          ) : data?.neo4jSchema ? (
            <div className="space-y-6">
              {/* Tables/Labels */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Database className="h-4 w-4 text-chart-1" />
                  <h4>Labels ({data.neo4jSchema.totalTables})</h4>
                </div>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {data.neo4jSchema.tables.map((table) => (
                    <Card key={table.label} className="bg-muted/30">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl">{table.icon}</span>
                            <span>{table.label}</span>
                          </div>
                          <Badge variant="secondary">{table.count}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Relationship Types */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <GitBranch className="h-4 w-4 text-chart-2" />
                  <h4>Types de relations ({data.neo4jSchema.relationshipTypes.length})</h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {data.neo4jSchema.relationshipTypes.map((relType) => (
                    <Badge key={relType} variant="outline" className="text-sm">
                      {relType}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucune donnée de schéma disponible
            </p>
          )}
        </CardContent>
      </Card>

      {/* Nodes and Relations Tabs */}
      <Tabs defaultValue="nodes" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="nodes">
            <Circle className="h-4 w-4 mr-2" />
            Nœuds
          </TabsTrigger>
          <TabsTrigger value="relations">
            <Network className="h-4 w-4 mr-2" />
            Relations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="nodes">
          <Card>
            <CardHeader>
              <CardTitle>Nœuds du graphe</CardTitle>
              <CardDescription>
                {data?.neo4jNodes.length || 0} nœuds affichés (limite: 20)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : data?.neo4jNodes && data.neo4jNodes.length > 0 ? (
                  <div className="space-y-3">
                    {data.neo4jNodes.map((node) => (
                      <Card key={node.id} className="bg-muted/30">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-start justify-between">
                              <p className="flex-1">{node.text}</p>
                              <Badge variant="outline" className="ml-2">
                                {node.type}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 flex-wrap text-xs text-muted-foreground">
                              <span className="font-mono">ID: {node.id}</span>
                              {node.project && (
                                <>
                                  <span>•</span>
                                  <span>Projet: {node.project}</span>
                                </>
                              )}
                              {node.status && (
                                <>
                                  <span>•</span>
                                  <Badge
                                    variant="secondary"
                                    className={`text-xs ${
                                      node.status === "active"
                                        ? "bg-chart-2"
                                        : "bg-muted"
                                    }`}
                                  >
                                    {node.status}
                                  </Badge>
                                </>
                              )}
                              {node.timestamp && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {new Date(node.timestamp).toLocaleDateString('fr-FR')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucun nœud trouvé
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="relations">
          <Card>
            <CardHeader>
              <CardTitle>Relations du graphe</CardTitle>
              <CardDescription>
                {data?.neo4jRelations.length || 0} relations affichées (limite: 10)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px] pr-4">
                {loading ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-32 w-full" />
                    ))}
                  </div>
                ) : data?.neo4jRelations && data.neo4jRelations.length > 0 ? (
                  <div className="space-y-4">
                    {data.neo4jRelations.map((relation, idx) => (
                      <Card key={idx} className="bg-muted/30 border-l-4 border-l-chart-3">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            {/* Source */}
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <div className="h-3 w-3 rounded-full bg-chart-1" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Source</p>
                                <p>{relation.sourceText}</p>
                                <p className="text-xs text-muted-foreground font-mono mt-1">
                                  ID: {relation.sourceId}
                                </p>
                              </div>
                            </div>

                            {/* Relation Type */}
                            <div className="flex items-center justify-center">
                              <Badge variant="default" className="bg-chart-3">
                                {relation.relationType}
                              </Badge>
                            </div>

                            {/* Target */}
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                <div className="h-3 w-3 rounded-full bg-chart-2" />
                              </div>
                              <div className="flex-1">
                                <p className="text-sm text-muted-foreground">Cible</p>
                                <p>{relation.targetText}</p>
                                <p className="text-xs text-muted-foreground font-mono mt-1">
                                  ID: {relation.targetId}
                                </p>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-8">
                    Aucune relation trouvée
                  </p>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
