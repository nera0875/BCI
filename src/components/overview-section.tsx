import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Activity, Brain, Database, CheckSquare, TrendingUp, Clock, Zap, Target } from "lucide-react";
import { useDashboard } from "../lib/graphql-hooks";
import { Skeleton } from "./ui/skeleton";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const activityData = [
  { name: "Lun", memories: 12, tasks: 8, pomodoros: 4 },
  { name: "Mar", memories: 19, tasks: 12, pomodoros: 6 },
  { name: "Mer", memories: 15, tasks: 15, pomodoros: 8 },
  { name: "Jeu", memories: 22, tasks: 10, pomodoros: 5 },
  { name: "Ven", memories: 28, tasks: 18, pomodoros: 9 },
  { name: "Sam", memories: 8, tasks: 5, pomodoros: 2 },
  { name: "Dim", memories: 5, tasks: 3, pomodoros: 1 },
];

const taskDistribution = [
  { name: "Pending", value: 8, color: "hsl(var(--chart-1))" },
  { name: "In Progress", value: 12, color: "hsl(var(--chart-4))" },
  { name: "Completed", value: 3, color: "hsl(var(--chart-2))" },
];

export function OverviewSection() {
  const { data, loading, error } = useDashboard({
    pollInterval: 10000,
  });

  const statCards = [
    {
      title: "Vecteurs Qdrant",
      value: data?.memoryStats.qdrantVectors || 0,
      icon: Database,
      color: "text-chart-1",
      bgColor: "bg-chart-1/10",
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Nœuds Neo4j",
      value: data?.memoryStats.neo4jNodes || 0,
      icon: Brain,
      color: "text-chart-2",
      bgColor: "bg-chart-2/10",
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Relations",
      value: data?.memoryStats.relations || 0,
      icon: Activity,
      color: "text-chart-3",
      bgColor: "bg-chart-3/10",
      trend: "+15%",
      trendUp: true,
    },
    {
      title: "Tâches Totales",
      value: data?.taskStats.totalTasks || 0,
      icon: CheckSquare,
      color: "text-chart-4",
      bgColor: "bg-chart-4/10",
      trend: "+5%",
      trendUp: true,
    },
  ];

  const completionRate = data?.taskStats.totalTasks 
    ? Math.round((data.taskStats.completed / data.taskStats.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Vue d'ensemble</h2>
          <p className="text-muted-foreground">
            Dashboard BCI avec Memory Service et Tasks Service
          </p>
        </div>
        {error && (
          <Badge variant="outline" className="bg-chart-4/10 text-chart-4 border-chart-4/20">
            Mode Démo
          </Badge>
        )}
      </div>

      {/* Stats Cards with Trends */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {loading ? (
                    <Skeleton className="h-8 w-24" />
                  ) : (
                    <>
                      <div className="text-2xl">{stat.value}</div>
                      <div className="flex items-center gap-1 text-xs">
                        <TrendingUp className={`h-3 w-3 ${stat.trendUp ? 'text-chart-2' : 'text-destructive'}`} />
                        <span className={stat.trendUp ? 'text-chart-2' : 'text-destructive'}>
                          {stat.trend}
                        </span>
                        <span className="text-muted-foreground">vs last week</span>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Activité de la semaine</CardTitle>
            <CardDescription>Mémoires, tâches et pomodoros</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                    }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="memories" stroke="hsl(var(--chart-1))" strokeWidth={2} name="Mémoires" />
                  <Line type="monotone" dataKey="tasks" stroke="hsl(var(--chart-4))" strokeWidth={2} name="Tâches" />
                  <Line type="monotone" dataKey="pomodoros" stroke="hsl(var(--chart-2))" strokeWidth={2} name="Pomodoros" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribution des tâches</CardTitle>
            <CardDescription>Répartition par statut</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={taskDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {taskDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "var(--radius)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Task Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Progression globale
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Taux de complétion</span>
                    <span className="font-medium">{completionRate}%</span>
                  </div>
                  <Progress value={completionRate} className="h-2" />
                </div>

                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-slate-500" />
                      <span className="text-sm text-muted-foreground">En attente</span>
                    </div>
                    <Badge variant="secondary">{data?.taskStats.pending || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-chart-4" />
                      <span className="text-sm text-muted-foreground">En cours</span>
                    </div>
                    <Badge className="bg-chart-4">{data?.taskStats.inProgress || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-chart-2" />
                      <span className="text-sm text-muted-foreground">Terminées</span>
                    </div>
                    <Badge className="bg-chart-2">{data?.taskStats.completed || 0}</Badge>
                  </div>
                  <div className="flex items-center justify-between pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Terminées aujourd'hui</span>
                    <Badge variant="outline">{data?.taskStats.completedToday || 0}</Badge>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Statistiques rapides
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-2/10 border border-chart-2/20">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-chart-2" />
                    <span className="text-sm">Total Pomodoros</span>
                  </div>
                  <span className="text-lg font-medium">{data?.taskStats.totalPomodoros || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-1/10 border border-chart-1/20">
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-chart-1" />
                    <span className="text-sm">Vecteurs stockés</span>
                  </div>
                  <span className="text-lg font-medium">{data?.memoryStats.qdrantVectors || 0}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-chart-3/10 border border-chart-3/20">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-chart-3" />
                    <span className="text-sm">Relations créées</span>
                  </div>
                  <span className="text-lg font-medium">{data?.memoryStats.relations || 0}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* System Status */}
        <Card>
          <CardHeader>
            <CardTitle>Statut du système</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {loading ? (
              <Skeleton className="h-32 w-full" />
            ) : (
              <>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">Memory Service</span>
                  <Badge className="bg-chart-2">
                    {data?.memoryStats.status || 'healthy'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">API GraphQL</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
                    <span className="text-sm">Connecté</span>
                  </div>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg border">
                  <span className="text-sm text-muted-foreground">Neo4j Database</span>
                  <Badge variant="outline" className="bg-chart-2/10 text-chart-2">
                    Active
                  </Badge>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Tabs defaultValue="tasks" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="tasks">Tâches récentes</TabsTrigger>
          <TabsTrigger value="memories">Mémoires récentes</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4">
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))
                  ) : data?.tasks.length > 0 ? (
                    data.tasks.map((task: any) => (
                      <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="truncate">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-muted-foreground truncate mt-1">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-2 mt-2">
                              <Badge variant="outline" className="text-xs">{task.status}</Badge>
                              <Badge className={`text-xs ${
                                task.priority === 'high' ? 'bg-destructive' : 
                                task.priority === 'medium' ? 'bg-chart-4' : 'bg-chart-2'
                              }`}>
                                {task.priority}
                              </Badge>
                              {task.tags?.slice(0, 2).map((tag: string) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      Aucune tâche en cours
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="memories" className="space-y-4">
          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[300px]">
                <div className="divide-y">
                  {loading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <div key={i} className="p-4">
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))
                  ) : data?.memories.length > 0 ? (
                    data.memories.map((memory: any, idx: number) => (
                      <div key={idx} className="p-4 hover:bg-muted/50 transition-colors">
                        <p className="text-sm">{memory.text}</p>
                        <div className="flex items-center gap-2 mt-2">
                          {memory.tags?.map((tag: string) => (
                            <Badge key={tag} variant="secondary" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-12 text-center text-muted-foreground">
                      Aucune mémoire trouvée
                    </div>
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
