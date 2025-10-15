import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { ScrollArea } from "./ui/scroll-area";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { 
  Plus, 
  Search, 
  CheckSquare, 
  Clock,
  Play,
  Pause,
  RotateCcw,
  Settings as SettingsIcon,
  Filter,
  SortAsc,
  MoreVertical,
  Check,
  Circle,
  Coffee,
  Trophy,
  Trash2,
  Edit,
  GripVertical
} from "lucide-react";
import { useTasks, useTaskStats } from "../lib/graphql-hooks";
import { Skeleton } from "./ui/skeleton";
import { useState, useEffect } from "react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from "./ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";

const statusColumns = [
  { id: 'pending', label: 'To Do', color: 'bg-slate-500' },
  { id: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
  { id: 'completed', label: 'Done', color: 'bg-green-500' },
];

const priorityColors = {
  high: 'bg-red-500/10 text-red-600 border-red-500/20',
  medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  low: 'bg-green-500/10 text-green-600 border-green-500/20',
};

type PomodoroSession = {
  id: string;
  type: 'work' | 'break' | 'longBreak';
  duration: number;
  completedAt: string;
  taskTitle?: string;
};

export function WorkSection() {
  const { data: statsData, loading: statsLoading } = useTaskStats();
  const { data: tasksData, loading: tasksLoading } = useTasks();
  
  // Pomodoro state
  const [pomodoroRunning, setPomodoroRunning] = useState(false);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [pomodoroType, setPomodoroType] = useState<'work' | 'break' | 'longBreak'>('work');
  const [completedSessions, setCompletedSessions] = useState<PomodoroSession[]>([]);
  const [showPomodoroSettings, setShowPomodoroSettings] = useState(false);
  
  // Pomodoro settings
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [longBreakDuration, setLongBreakDuration] = useState(15);
  const [sessionsBeforeLongBreak, setSessionsBeforeLongBreak] = useState(4);
  
  // List view state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPriority, setFilterPriority] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("created");

  const stats = statsData?.taskStats;
  const allTasks = tasksData?.tasks || [];

  // Pomodoro timer effect
  useEffect(() => {
    if (!pomodoroRunning || pomodoroTime <= 0) return;

    const interval = setInterval(() => {
      setPomodoroTime((prev) => {
        if (prev <= 1) {
          setPomodoroRunning(false);
          handlePomodoroComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [pomodoroRunning, pomodoroTime]);

  const handlePomodoroComplete = () => {
    const session: PomodoroSession = {
      id: Date.now().toString(),
      type: pomodoroType,
      duration: pomodoroType === 'work' ? workDuration : pomodoroType === 'break' ? breakDuration : longBreakDuration,
      completedAt: new Date().toISOString(),
    };
    setCompletedSessions((prev) => [session, ...prev]);

    // Auto-switch to break/work
    if (pomodoroType === 'work') {
      const workSessions = completedSessions.filter(s => s.type === 'work').length + 1;
      if (workSessions % sessionsBeforeLongBreak === 0) {
        setPomodoroType('longBreak');
        setPomodoroTime(longBreakDuration * 60);
      } else {
        setPomodoroType('break');
        setPomodoroTime(breakDuration * 60);
      }
    } else {
      setPomodoroType('work');
      setPomodoroTime(workDuration * 60);
    }
  };

  const startPomodoro = (type: 'work' | 'break' | 'longBreak') => {
    setPomodoroType(type);
    const duration = type === 'work' ? workDuration : type === 'break' ? breakDuration : longBreakDuration;
    setPomodoroTime(duration * 60);
    setPomodoroRunning(false);
  };

  // Filter and sort tasks
  const filteredTasks = allTasks
    .filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || task.priority === filterPriority;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
      }
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      return 0; // default: created date
    });

  const todaysSessions = completedSessions.filter(s => {
    const today = new Date().toDateString();
    return new Date(s.completedAt).toDateString() === today;
  });

  const todaysWorkSessions = todaysSessions.filter(s => s.type === 'work').length;
  const todaysFocusTime = todaysSessions
    .filter(s => s.type === 'work')
    .reduce((acc, s) => acc + s.duration, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2>Work</h2>
          <p className="text-muted-foreground">
            Tasks, Kanban & Pomodoro
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          New Task
        </Button>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
          <TabsTrigger value="pomodoro">Pomodoro</TabsTrigger>
        </TabsList>

        {/* Kanban View */}
        <TabsContent value="kanban" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Total</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl">{stats?.totalTasks || 0}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Pending</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl">{stats?.pending || 0}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">In Progress</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl">{stats?.inProgress || 0}</div>}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                {statsLoading ? <Skeleton className="h-8 w-16" /> : <div className="text-2xl">{stats?.completed || 0}</div>}
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {statusColumns.map((column) => {
              const columnTasks = allTasks.filter(task => task.status === column.id);
              
              return (
                <div key={column.id} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`h-3 w-3 rounded-full ${column.color}`} />
                      <h4>{column.label}</h4>
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </div>
                    <Button variant="ghost" size="icon" className="h-6 w-6">
                      <Plus className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <ScrollArea className="h-[600px] pr-3">
                    <div className="space-y-2">
                      {tasksLoading ? (
                        Array.from({ length: 2 }).map((_, i) => (
                          <Skeleton key={i} className="h-28 w-full" />
                        ))
                      ) : (
                        columnTasks.map((task) => (
                          <Card key={task.id} className="group cursor-move hover:shadow-md transition-all border-l-4" style={{ borderLeftColor: task.priority === 'high' ? '#ef4444' : task.priority === 'medium' ? '#f59e0b' : '#22c55e' }}>
                            <CardContent className="p-3 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div className="flex items-start gap-2 flex-1 min-w-0">
                                  <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
                                  <h4 className="text-sm leading-tight truncate">{task.title}</h4>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                                      <MoreVertical className="h-3 w-3" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem>
                                      <Edit className="h-3 w-3 mr-2" />
                                      Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem>
                                      <Clock className="h-3 w-3 mr-2" />
                                      Start Pomodoro
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem className="text-destructive">
                                      <Trash2 className="h-3 w-3 mr-2" />
                                      Delete
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              {task.description && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <Badge variant="outline" className={`text-xs ${priorityColors[task.priority as keyof typeof priorityColors]}`}>
                                  {task.priority}
                                </Badge>
                                {task.tags.slice(0, 2).map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {task.tags.length > 2 && (
                                  <Badge variant="secondary" className="text-xs">
                                    +{task.tags.length - 2}
                                  </Badge>
                                )}
                              </div>
                              {task.pomodoros > 0 && (
                                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {task.pomodoros} pomodoros
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input 
                placeholder="Search tasks..." 
                className="pl-9" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px]">
                <SortAsc className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created">Created</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="divide-y">
                  {tasksLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="p-4">
                        <Skeleton className="h-16 w-full" />
                      </div>
                    ))
                  ) : filteredTasks.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      No tasks found
                    </div>
                  ) : (
                    filteredTasks.map((task) => (
                      <div key={task.id} className="p-4 hover:bg-muted/50 transition-colors group">
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                              {task.status === 'completed' ? (
                                <Check className="h-4 w-4 text-green-500" />
                              ) : (
                                <Circle className="h-4 w-4" />
                              )}
                            </Button>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="truncate">{task.title}</h4>
                                {task.pomodoros > 0 && (
                                  <Badge variant="outline" className="shrink-0 text-xs">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {task.pomodoros}
                                  </Badge>
                                )}
                              </div>
                              {task.description && (
                                <p className="text-sm text-muted-foreground truncate">{task.description}</p>
                              )}
                              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                {task.tags.map((tag) => (
                                  <Badge key={tag} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Badge variant="outline" className={priorityColors[task.priority as keyof typeof priorityColors]}>
                              {task.priority}
                            </Badge>
                            <Badge>{task.status}</Badge>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Clock className="h-4 w-4 mr-2" />
                                  Start Pomodoro
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pomodoro Timer */}
        <TabsContent value="pomodoro" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Today's Sessions</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{todaysWorkSessions}</div>
                <p className="text-xs text-muted-foreground">work sessions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Focus Time</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{Math.floor(todaysFocusTime / 60)}m</div>
                <p className="text-xs text-muted-foreground">total focused</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm">Breaks</CardTitle>
                <Coffee className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl">{todaysSessions.filter(s => s.type !== 'work').length}</div>
                <p className="text-xs text-muted-foreground">breaks taken</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Timer</CardTitle>
                    <CardDescription>
                      {pomodoroType === 'work' ? 'Focus Session' : pomodoroType === 'break' ? 'Short Break' : 'Long Break'}
                    </CardDescription>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowPomodoroSettings(true)}>
                    <SettingsIcon className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col items-center justify-center py-8">
                  <div className="relative mb-8">
                    <div className="text-7xl font-mono tabular-nums">
                      {Math.floor(pomodoroTime / 60).toString().padStart(2, '0')}:
                      {(pomodoroTime % 60).toString().padStart(2, '0')}
                    </div>
                    <div className="absolute -bottom-6 left-0 right-0 text-center">
                      <Badge variant="outline" className={
                        pomodoroType === 'work' ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' :
                        pomodoroType === 'break' ? 'bg-green-500/10 text-green-600 border-green-500/20' :
                        'bg-purple-500/10 text-purple-600 border-purple-500/20'
                      }>
                        {pomodoroType === 'work' ? 'Focus' : pomodoroType === 'break' ? 'Break' : 'Long Break'}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex gap-3 mt-4">
                    <Button
                      size="lg"
                      onClick={() => setPomodoroRunning(!pomodoroRunning)}
                      disabled={pomodoroTime === 0}
                    >
                      {pomodoroRunning ? (
                        <>
                          <Pause className="h-5 w-5 mr-2" />
                          Pause
                        </>
                      ) : (
                        <>
                          <Play className="h-5 w-5 mr-2" />
                          Start
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const duration = pomodoroType === 'work' ? workDuration : pomodoroType === 'break' ? breakDuration : longBreakDuration;
                        setPomodoroTime(duration * 60);
                        setPomodoroRunning(false);
                      }}
                    >
                      <RotateCcw className="h-5 w-5 mr-2" />
                      Reset
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Quick Start</Label>
                  <div className="grid grid-cols-3 gap-2">
                    <Button 
                      variant={pomodoroType === 'work' ? 'default' : 'outline'}
                      onClick={() => startPomodoro('work')}
                      className="flex-col h-auto py-3"
                    >
                      <Clock className="h-4 w-4 mb-1" />
                      <span className="text-xs">Work</span>
                      <span className="text-xs text-muted-foreground">{workDuration}m</span>
                    </Button>
                    <Button 
                      variant={pomodoroType === 'break' ? 'default' : 'outline'}
                      onClick={() => startPomodoro('break')}
                      className="flex-col h-auto py-3"
                    >
                      <Coffee className="h-4 w-4 mb-1" />
                      <span className="text-xs">Break</span>
                      <span className="text-xs text-muted-foreground">{breakDuration}m</span>
                    </Button>
                    <Button 
                      variant={pomodoroType === 'longBreak' ? 'default' : 'outline'}
                      onClick={() => startPomodoro('longBreak')}
                      className="flex-col h-auto py-3"
                    >
                      <Trophy className="h-4 w-4 mb-1" />
                      <span className="text-xs">Long</span>
                      <span className="text-xs text-muted-foreground">{longBreakDuration}m</span>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Today's History</CardTitle>
                <CardDescription>{todaysSessions.length} sessions completed</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[380px] pr-3">
                  {todaysSessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                      <Clock className="h-12 w-12 mb-3 opacity-50" />
                      <p>No sessions yet today</p>
                      <p className="text-xs">Start a pomodoro to begin tracking</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {todaysSessions.map((session) => (
                        <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg border">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                            session.type === 'work' ? 'bg-blue-500/10' :
                            session.type === 'break' ? 'bg-green-500/10' :
                            'bg-purple-500/10'
                          }`}>
                            <Clock className={`h-5 w-5 ${
                              session.type === 'work' ? 'text-blue-500' :
                              session.type === 'break' ? 'text-green-500' :
                              'text-purple-500'
                            }`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm">
                                {session.type === 'work' ? 'Focus Session' : 
                                 session.type === 'break' ? 'Short Break' : 'Long Break'}
                              </span>
                              <Badge variant="secondary" className="text-xs">
                                {session.duration}m
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              {new Date(session.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Pomodoro Settings Dialog */}
      <Dialog open={showPomodoroSettings} onOpenChange={setShowPomodoroSettings}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Pomodoro Settings</DialogTitle>
            <DialogDescription>
              Customize your pomodoro timer durations
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Work Duration</Label>
                <span className="text-sm text-muted-foreground">{workDuration} minutes</span>
              </div>
              <Slider
                value={[workDuration]}
                onValueChange={([value]) => setWorkDuration(value)}
                min={5}
                max={60}
                step={5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Short Break</Label>
                <span className="text-sm text-muted-foreground">{breakDuration} minutes</span>
              </div>
              <Slider
                value={[breakDuration]}
                onValueChange={([value]) => setBreakDuration(value)}
                min={1}
                max={15}
                step={1}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Long Break</Label>
                <span className="text-sm text-muted-foreground">{longBreakDuration} minutes</span>
              </div>
              <Slider
                value={[longBreakDuration]}
                onValueChange={([value]) => setLongBreakDuration(value)}
                min={10}
                max={45}
                step={5}
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Sessions Before Long Break</Label>
                <span className="text-sm text-muted-foreground">{sessionsBeforeLongBreak}</span>
              </div>
              <Slider
                value={[sessionsBeforeLongBreak]}
                onValueChange={([value]) => setSessionsBeforeLongBreak(value)}
                min={2}
                max={8}
                step={1}
              />
            </div>

            <Button onClick={() => setShowPomodoroSettings(false)} className="w-full">
              Save Settings
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
