import { useState } from "react";
import {
  useSearchMemories,
  useStoreMemory,
  useMemoryStats,
  type MemoryInput,
} from "../lib/graphql-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Search, Plus, Database, Network, Activity } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner";

export function MemorySection() {
  const [searchQuery, setSearchQuery] = useState("BCI");
  const [newMemoryText, setNewMemoryText] = useState("");
  const [newMemoryTags, setNewMemoryTags] = useState("");

  const { data: statsData, loading: statsLoading } = useMemoryStats({
    pollInterval: 10000, // Refresh every 10 seconds
  });

  const { data: memoriesData, loading: memoriesLoading, refetch } = useSearchMemories(
    {
      query: searchQuery,
      limit: 10,
      includeRelations: true,
    },
    {
      skip: !searchQuery,
    }
  );

  const [storeMemory, { loading: storing }] = useStoreMemory({
    onCompleted: (data) => {
      if (data.storeMemory.success) {
        toast.success("Mémoire enregistrée avec succès", {
          description: data.storeMemory.message,
        });
        setNewMemoryText("");
        setNewMemoryTags("");
        refetch();
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de l'enregistrement", {
        description: error.message,
      });
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim()) {
      refetch();
    }
  };

  const handleStoreMemory = async () => {
    if (!newMemoryText.trim()) {
      toast.error("Le texte de la mémoire ne peut pas être vide");
      return;
    }

    const input: MemoryInput = {
      text: newMemoryText,
      type: "context",
      tags: newMemoryTags.split(",").map((t) => t.trim()).filter(Boolean),
      project: "BCI",
    };

    await storeMemory({ variables: { input } });
  };

  const formatTimestamp = (timestamp: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(timestamp));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Memory Service</h2>
        <p className="text-muted-foreground">
          Système de mémoire vectorielle avec graphe de connaissances
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Vecteurs Qdrant
            </CardTitle>
            <Database className="h-4 w-4 text-chart-1" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl">{statsData?.memoryStats.qdrantVectors || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Nœuds Neo4j
            </CardTitle>
            <Network className="h-4 w-4 text-chart-2" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl">{statsData?.memoryStats.neo4jNodes || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm text-muted-foreground">
              Relations
            </CardTitle>
            <Activity className="h-4 w-4 text-chart-3" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl">{statsData?.memoryStats.relations || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cache Stats */}
      {statsData?.memoryStats.cache && (
        <Card>
          <CardHeader>
            <CardTitle>Performance du cache</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hits:</span>
              <span>{statsData.memoryStats.cache.hits}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Misses:</span>
              <span>{statsData.memoryStats.cache.misses}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hit Rate:</span>
              <span>{(statsData.memoryStats.cache.hitRate * 100).toFixed(1)}%</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Memories */}
      <Card>
        <CardHeader>
          <CardTitle>Rechercher des mémoires</CardTitle>
          <CardDescription>
            Recherche sémantique dans la base vectorielle
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Rechercher... (ex: BCI architecture)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
            <Button onClick={handleSearch} disabled={memoriesLoading}>
              <Search className="h-4 w-4 mr-2" />
              Rechercher
            </Button>
          </div>

          {memoriesLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          ) : memoriesData?.memories.length > 0 ? (
            <div className="space-y-3">
              {memoriesData.memories.map((memory: any) => (
                <Card key={memory.id} className="bg-muted/30">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <p className="flex-1">{memory.text}</p>
                      {memory.score && (
                        <Badge variant="secondary" className="ml-2">
                          {(memory.score * 100).toFixed(0)}%
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{memory.type}</Badge>
                      {memory.tags?.map((tag: string) => (
                        <Badge key={tag} variant="secondary">
                          {tag}
                        </Badge>
                      ))}
                      <span className="text-xs text-muted-foreground ml-auto">
                        {formatTimestamp(memory.timestamp)}
                      </span>
                    </div>
                    {memory.relations && memory.relations.length > 0 && (
                      <div className="pt-2 border-t border-border">
                        <p className="text-xs text-muted-foreground mb-1">
                          Relations:
                        </p>
                        {memory.relations.map((rel: any, idx: number) => (
                          <div key={idx} className="text-xs pl-2">
                            <span className="text-muted-foreground">
                              {rel.relationType}:
                            </span>{" "}
                            {rel.text}
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : searchQuery ? (
            <p className="text-center text-muted-foreground py-8">
              Aucune mémoire trouvée
            </p>
          ) : null}
        </CardContent>
      </Card>

      {/* Store New Memory */}
      <Card>
        <CardHeader>
          <CardTitle>Enregistrer une nouvelle mémoire</CardTitle>
          <CardDescription>
            Ajouter une nouvelle entrée dans le système de mémoire
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="memory-text">Texte</label>
            <Textarea
              id="memory-text"
              placeholder="Entrez le texte de la mémoire..."
              value={newMemoryText}
              onChange={(e) => setNewMemoryText(e.target.value)}
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="memory-tags">Tags (séparés par des virgules)</label>
            <Input
              id="memory-tags"
              placeholder="bci, graphql, architecture..."
              value={newMemoryTags}
              onChange={(e) => setNewMemoryTags(e.target.value)}
            />
          </div>
          <Button onClick={handleStoreMemory} disabled={storing} className="w-full">
            <Plus className="h-4 w-4 mr-2" />
            {storing ? "Enregistrement..." : "Enregistrer la mémoire"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
