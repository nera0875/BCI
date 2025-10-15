import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Pagination } from "./pagination";
import {
  Activity,
  AlertCircle,
  CheckCircle,
  XCircle,
  Database,
  RefreshCw,
  Search,
  Info,
  Clock,
  TrendingUp,
  AlertTriangle,
  ScrollText,
  Shield,
} from "lucide-react";
import { useState } from "react";
import { useHealthCheck, useMetrics, useSystemLogs } from "../lib/graphql-hooks";

export function HealthSection() {
  const [logLevel, setLogLevel] = useState("ALL");
  const [logSearch, setLogSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const logsPerPage = 20;

  const { data: healthData, loading: healthLoading, refetch: refetchHealth } = useHealthCheck();
  const { data: metricsData, loading: metricsLoading } = useMetrics();
  const { data: logsData, loading: logsLoading, refetch: refetchLogs } = useSystemLogs({
    limit: 100,
    level: logLevel === "ALL" ? undefined : logLevel,
  });

  const health = healthData?.healthCheck;
  const metrics = metricsData?.metrics;
  const logs = logsData?.systemLogs || [];

  const filteredLogs = logs.filter((log) => {
    if (!logSearch) return true;
    const searchLower = logSearch.toLowerCase();
    return (
      log.message.toLowerCase().includes(searchLower) ||
      log.service.toLowerCase().includes(searchLower)
    );
  });

  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * logsPerPage,
    currentPage * logsPerPage
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
      case "down":
        return <XCircle className="h-4 w-4 text-destructive" />;
      default:
        return <AlertCircle className="h-4 w-4 text-chart-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "healthy":
        return <Badge className="bg-chart-2">Healthy</Badge>;
      case "down":
        return <Badge variant="destructive">Down</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "ERROR":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "WARNING":
        return <AlertTriangle className="h-4 w-4 text-chart-4" />;
      case "SUCCESS":
        return <CheckCircle className="h-4 w-4 text-chart-2" />;
      default:
        return <Info className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Health</h2>
        <p className="text-muted-foreground">
          System health, monitoring & logs
        </p>
      </div>

      <Tabs defaultValue="status" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="status">
            <Activity className="h-4 w-4 mr-2" />
            Status
          </TabsTrigger>
          <TabsTrigger value="metrics">
            <TrendingUp className="h-4 w-4 mr-2" />
            Metrics
          </TabsTrigger>
          <TabsTrigger value="logs">
            <ScrollText className="h-4 w-4 mr-2" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Status Tab */}
        <TabsContent value="status" className="space-y-6">

          {/* Overall Status */}
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Overall Status</CardTitle>
              <CardDescription>Backend services health check</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchHealth()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {healthLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  {getStatusIcon(health?.overallStatus || "unknown")}
                  <div>
                    <p className="text-sm">System</p>
                    <p className="text-xs text-muted-foreground">Overall Status</p>
                  </div>
                </div>
                {getStatusBadge(health?.overallStatus || "unknown")}
              </div>

              {/* Neo4j */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  {getStatusIcon(health?.neo4j?.status || "unknown")}
                  <div>
                    <p className="text-sm">Neo4j</p>
                    <p className="text-xs text-muted-foreground">
                      {health?.neo4j?.message || "No information"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {health?.neo4j?.responseTimeMs && (
                    <span className="text-xs text-muted-foreground">
                      {health.neo4j.responseTimeMs}ms
                    </span>
                  )}
                  {getStatusBadge(health?.neo4j?.status || "unknown")}
                </div>
              </div>

              {/* Qdrant */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  {getStatusIcon(health?.qdrant?.status || "unknown")}
                  <div>
                    <p className="text-sm">Qdrant</p>
                    <p className="text-xs text-muted-foreground">
                      {health?.qdrant?.message || "No information"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {health?.qdrant?.responseTimeMs && (
                    <span className="text-xs text-muted-foreground">
                      {health.qdrant.responseTimeMs}ms
                    </span>
                  )}
                  {getStatusBadge(health?.qdrant?.status || "unknown")}
                </div>
              </div>

              {/* PostgreSQL */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  {getStatusIcon(health?.postgres?.status || "unknown")}
                  <div>
                    <p className="text-sm">PostgreSQL</p>
                    <p className="text-xs text-muted-foreground">
                      {health?.postgres?.message || "No information"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {health?.postgres?.responseTimeMs && (
                    <span className="text-xs text-muted-foreground">
                      {health.postgres.responseTimeMs}ms
                    </span>
                  )}
                  {getStatusBadge(health?.postgres?.status || "unknown")}
                </div>
              </div>

              {/* Redis */}
              <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  {getStatusIcon(health?.redis?.status || "unknown")}
                  <div>
                    <p className="text-sm">Redis</p>
                    <p className="text-xs text-muted-foreground">
                      {health?.redis?.message || "No information"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {health?.redis?.responseTimeMs && (
                    <span className="text-xs text-muted-foreground">
                      {health.redis.responseTimeMs}ms
                    </span>
                  )}
                  {getStatusBadge(health?.redis?.status || "unknown")}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Requests</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{metrics?.totalRequests || 0}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Error Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{metrics?.errorRate?.toFixed(2) || 0}%</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg Response</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{metrics?.avgResponseTimeMs?.toFixed(0) || 0}ms</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Uptime</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {metricsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">
                {Math.floor((metrics?.uptimeSeconds || 0) / 3600)}h
              </div>
            )}
          </CardContent>
        </Card>
          </div>

          {/* Last Error */}
          {metrics?.lastError && (
            <Card>
              <CardHeader>
                <CardTitle>Last Error</CardTitle>
                <CardDescription>Most recent system error</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-destructive/10">
                    <XCircle className="h-5 w-5 text-destructive mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm">{metrics.lastError}</p>
                      {metrics.lastErrorTime && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(metrics.lastErrorTime).toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Detailed Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Details</CardTitle>
              <CardDescription>System performance breakdown</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">Total Requests</span>
                  <span className="text-sm">{metrics?.totalRequests || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">Error Count</span>
                  <span className="text-sm">{metrics?.errorCount || 0}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">Success Rate</span>
                  <span className="text-sm">
                    {metrics?.errorRate ? (100 - metrics.errorRate).toFixed(2) : 100}%
                  </span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">Uptime</span>
                  <span className="text-sm">
                    {Math.floor((metrics?.uptimeSeconds || 0) / 3600)}h{" "}
                    {Math.floor(((metrics?.uptimeSeconds || 0) % 3600) / 60)}m
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          {/* Log Level Stats */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Info</CardTitle>
                <Info className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {filteredLogs.filter(l => l.level === 'INFO').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Success</CardTitle>
                <CheckCircle className="h-4 w-4 text-chart-2" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {filteredLogs.filter(l => l.level === 'SUCCESS').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Warning</CardTitle>
                <AlertTriangle className="h-4 w-4 text-chart-4" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {filteredLogs.filter(l => l.level === 'WARNING').length}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Error</CardTitle>
                <XCircle className="h-4 w-4 text-destructive" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">
                  {filteredLogs.filter(l => l.level === 'ERROR').length}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Logs */}
          <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>System Logs</CardTitle>
              <CardDescription>Live backend activity</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={() => refetchLogs()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search logs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={logLevel} onValueChange={setLogLevel}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Levels</SelectItem>
                <SelectItem value="INFO">Info</SelectItem>
                <SelectItem value="SUCCESS">Success</SelectItem>
                <SelectItem value="WARNING">Warning</SelectItem>
                <SelectItem value="ERROR">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {logsLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {filteredLogs.map((log, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-3 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-[140px]">
                      <span className="text-xs text-muted-foreground">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 min-w-[100px]">
                      {getLevelIcon(log.level)}
                      <Badge
                        variant={
                          log.level === "ERROR"
                            ? "destructive"
                            : log.level === "WARNING"
                            ? "outline"
                            : "secondary"
                        }
                        className="text-xs"
                      >
                        {log.level}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs min-w-[80px]">
                      {log.service}
                    </Badge>
                    <p className="text-sm flex-1">{log.message}</p>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
