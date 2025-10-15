import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Database, Network, Link, Clock } from "lucide-react";
import { useMemoryStats } from "../lib/graphql-hooks";
import { Skeleton } from "./ui/skeleton";

const statsCards = [
  {
    title: "Total Vectors",
    subtitle: "Stored in Qdrant",
    icon: Database,
    color: "bg-blue-500",
    key: "qdrantVectors" as const
  },
  {
    title: "Graph Nodes",
    subtitle: "In Neo4j",
    icon: Network,
    color: "bg-green-500",
    key: "neo4jNodes" as const
  },
  {
    title: "Relations",
    subtitle: "Graph connections",
    icon: Link,
    color: "bg-purple-500",
    key: "relations" as const
  },
  {
    title: "Status",
    subtitle: "System health",
    icon: Clock,
    color: "bg-orange-500",
    key: "status" as const
  }
];

export function AnalyticsSection() {
  const { data, loading } = useMemoryStats();
  const stats = data?.memoryStats;

  return (
    <div className="space-y-6">
      <div>
        <h2>Analytics</h2>
        <p className="text-muted-foreground">
          Monitor memory system performance and usage
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          const value = stats?.[card.key];
          const displayValue = card.key === "status" ? value : (value || 0);
          
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">{card.title}</CardTitle>
                <div className={`${card.color} p-2 rounded-lg`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-2xl">{displayValue}</div>
                )}
                <p className="text-xs text-muted-foreground mt-1">
                  {card.subtitle}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">System Status</span>
              {loading ? (
                <Skeleton className="h-5 w-20" />
              ) : (
                <span>{stats?.status || "Unknown"}</span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Qdrant Vectors</span>
              {loading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <span>{stats?.qdrantVectors || 0}</span>
              )}
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-muted-foreground">Neo4j Nodes</span>
              {loading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <span>{stats?.neo4jNodes || 0}</span>
              )}
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-muted-foreground">Relations</span>
              {loading ? (
                <Skeleton className="h-5 w-12" />
              ) : (
                <span>{stats?.relations || 0}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Activity tracking coming soon...
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
