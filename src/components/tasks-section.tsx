import { useState } from "react";
import {
  useTasks,
  useCreateTask,
  useUpdateTask,
  useStartPomodoro,
  useTaskStats,
  type CreateTaskInput,
  type UpdateTaskInput,
  type StartPomodoroInput,
} from "../lib/graphql-hooks";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { CheckCircle2, Circle, Clock, Plus, Timer } from "lucide-react";
import { Skeleton } from "./ui/skeleton";
import { toast } from "sonner@2.0.3";

export function TasksSection() {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    type: "strategic",
    priority: "medium",
    tags: "",
  });

  const { data: statsData, loading: statsLoading } = useTaskStats({
    pollInterval: 5000,
  });

  const { data: tasksData, loading: tasksLoading, refetch } = useTasks(
    {
      status: filterStatus === "all" ? undefined : filterStatus,
      priority: filterPriority === "all" ? undefined : filterPriority,
      limit: 50,
    }
  );

  const [createTask, { loading: creating }] = useCreateTask({
    onCompleted: (data) => {
      if (data.createTask.success) {
        toast.success("Tâche créée avec succès");
        setDialogOpen(false);
        setNewTask({
          title: "",
          description: "",
          type: "strategic",
          priority: "medium",
          tags: "",
        });
        refetch();
      }
    },
    onError: (error) => {
      toast.error("Erreur lors de la création", {
        description: error.message,
      });
    },
  });

  const [updateTask] = useUpdateTask({
    onCompleted: () => {
      toast.success("Tâche mise à jour");
      refetch();
    },
  });

  const [startPomodoro] = useStartPomodoro({
    onCompleted: (data) => {
      if (data.startPomodoro.success) {
        toast.success("Pomodoro démarré", {
          description: `Session de ${data.startPomodoro.session.durationMinutes} minutes`,
        });
      }
    },
  });

  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      toast.error("Le titre ne peut pas être vide");
      return;
    }

    const input: CreateTaskInput = {
      title: newTask.title,
      description: newTask.description,
      type: newTask.type,
      priority: newTask.priority,
      status: "pending",
      tags: newTask.tags.split(",").map((t) => t.trim()).filter(Boolean),
    };

    await createTask({ variables: { input } });
  };

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    const input: UpdateTaskInput = { status: newStatus };
    await updateTask({ variables: { taskId, input } });
  };

  const handleStartPomodoro = async (taskId: string) => {
    const input: StartPomodoroInput = {
      taskId,
      durationMinutes: 25,
    };
    await startPomodoro({ variables: { input } });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive";
      case "medium":
        return "bg-chart-4";
      case "low":
        return "bg-chart-2";
      default:
        return "bg-secondary";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-chart-2" />;
      case "in-progress":
        return <Clock className="h-4 w-4 text-chart-4" />;
      default:
        return <Circle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("fr-FR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(new Date(dateString));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Tasks Service</h2>
          <p className="text-muted-foreground">
            Gestion des tâches et sessions Pomodoro
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle tâche
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer une nouvelle tâche</DialogTitle>
              <DialogDescription>
                Ajouter une tâche au système de gestion
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label htmlFor="task-title">Titre</label>
                <Input
                  id="task-title"
                  placeholder="Titre de la tâche..."
                  value={newTask.title}
                  onChange={(e) =>
                    setNewTask({ ...newTask, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="task-description">Description</label>
                <Textarea
                  id="task-description"
                  placeholder="Description..."
                  value={newTask.description}
                  onChange={(e) =>
                    setNewTask({ ...newTask, description: e.target.value })
                  }
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label>Type</label>
                  <Select
                    value={newTask.type}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="strategic">Stratégique</SelectItem>
                      <SelectItem value="operational">Opérationnel</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label>Priorité</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value) =>
                      setNewTask({ ...newTask, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Haute</SelectItem>
                      <SelectItem value="medium">Moyenne</SelectItem>
                      <SelectItem value="low">Basse</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="task-tags">Tags (séparés par des virgules)</label>
                <Input
                  id="task-tags"
                  placeholder="feature, bug, documentation..."
                  value={newTask.tags}
                  onChange={(e) =>
                    setNewTask({ ...newTask, tags: e.target.value })
                  }
                />
              </div>
              <Button
                onClick={handleCreateTask}
                disabled={creating}
                className="w-full"
              >
                {creating ? "Création..." : "Créer la tâche"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{statsData?.taskStats.totalTasks || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En attente</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{statsData?.taskStats.pending || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">En cours</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{statsData?.taskStats.inProgress || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Terminées</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{statsData?.taskStats.completed || 0}</div>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Pomodoros</CardTitle>
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl">{statsData?.taskStats.totalPomodoros || 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtres</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4">
          <div className="flex-1 space-y-2">
            <label>Statut</label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="in-progress">En cours</SelectItem>
                <SelectItem value="completed">Terminé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1 space-y-2">
            <label>Priorité</label>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes</SelectItem>
                <SelectItem value="high">Haute</SelectItem>
                <SelectItem value="medium">Moyenne</SelectItem>
                <SelectItem value="low">Basse</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tasks List */}
      <Card>
        <CardHeader>
          <CardTitle>Liste des tâches</CardTitle>
          <CardDescription>
            {tasksData?.tasks.length || 0} tâche(s) trouvée(s)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {tasksLoading ? (
            [...Array(5)].map((_, i) => <Skeleton key={i} className="h-24 w-full" />)
          ) : tasksData?.tasks.length > 0 ? (
            tasksData.tasks.map((task: any) => (
              <Card key={task.id} className="bg-muted/30">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() =>
                        handleStatusChange(
                          task.id,
                          task.status === "completed" ? "pending" : "completed"
                        )
                      }
                      className="mt-1"
                    >
                      {getStatusIcon(task.status)}
                    </button>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between">
                        <h4>{task.title}</h4>
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                      </div>
                      {task.description && (
                        <p className="text-sm text-muted-foreground">
                          {task.description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline">{task.type}</Badge>
                        <Badge variant="secondary">{task.status}</Badge>
                        {task.tags?.map((tag: string) => (
                          <Badge key={tag} variant="secondary">
                            {tag}
                          </Badge>
                        ))}
                        <span className="text-xs text-muted-foreground ml-auto">
                          {formatDate(task.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {task.status !== "completed" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStartPomodoro(task.id)}
                          >
                            <Timer className="h-4 w-4" />
                          </Button>
                          <Select
                            value={task.status}
                            onValueChange={(value) =>
                              handleStatusChange(task.id, value)
                            }
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">En attente</SelectItem>
                              <SelectItem value="in-progress">En cours</SelectItem>
                              <SelectItem value="completed">Terminé</SelectItem>
                            </SelectContent>
                          </Select>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Aucune tâche trouvée
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
