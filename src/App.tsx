import { useState, useEffect, useCallback } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import {
  LayoutDashboard,
  Settings,
  Brain,
  Zap,
  WifiOff,
  Briefcase,
  Server,
} from "lucide-react";
import { DashboardHeader } from "./components/dashboard-header";
import { OverviewSection } from "./components/overview-section";
import { BrainSection } from "./components/brain-section";
import { WorkSection } from "./components/work-section";
import { HealthSection } from "./components/health-section";
import { SystemSection } from "./components/system-section";
import { SettingsSection } from "./components/settings-section";
import { Toaster } from "./components/ui/sonner";
import { NewMemorySheet } from "./components/new-memory-sheet";
import { NewTaskSheet } from "./components/new-task-sheet";
import { KeyboardShortcutsDialog } from "./components/keyboard-shortcuts-dialog";
import { CommandPalette } from "./components/command-palette";
import { NotificationsCenter } from "./components/notifications-center";
import { ErrorBoundary } from "./components/error-boundary";
import { toast } from "sonner";
import { ApolloProvider } from '@apollo/client/react';
import { apolloClient } from './lib/apollo-client';

type Section = "overview" | "brain" | "work" | "health" | "system" | "settings";

const navigationItems = [
  {
    id: "overview" as Section,
    title: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "brain" as Section,
    title: "Brain",
    icon: Brain,
  },
  {
    id: "work" as Section,
    title: "Work",
    icon: Briefcase,
  },
  {
    id: "health" as Section,
    title: "Health",
    icon: Zap,
  },
  {
    id: "system" as Section,
    title: "System",
    icon: Server,
  },
];

const configItems = [
  {
    id: "settings" as Section,
    title: "Settings",
    icon: Settings,
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<Section>("overview");
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'mock'>('checking');
  const [newMemoryOpen, setNewMemoryOpen] = useState(false);
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    // Check API connectivity
    const checkApi = async () => {
      try {
        const response = await fetch('http://84.247.131.60:9598/graphql', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: '{ health }' }),
          mode: 'cors',
        });
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('mock');
        }
      } catch {
        setApiStatus('mock');
      }
    };
    
    checkApi();
    const interval = setInterval(checkApi, 30000); // Check every 30s
    return () => clearInterval(interval);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command Palette with Ctrl+K
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Show shortcuts with ?
      if (e.key === '?' && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        setShortcutsOpen(true);
        return;
      }

      // Navigation shortcuts (G + key)
      if (e.key === 'g' || e.key === 'G') {
        const nextKey = (e: KeyboardEvent) => {
          if (e.key === 'o' || e.key === 'O') setActiveSection('overview');
          if (e.key === 'b' || e.key === 'B') setActiveSection('brain');
          if (e.key === 'w' || e.key === 'W') setActiveSection('work');
          if (e.key === 'h' || e.key === 'H') setActiveSection('health');
          if (e.key === 's' || e.key === 'S') setActiveSection('system');
          document.removeEventListener('keydown', nextKey);
        };
        document.addEventListener('keydown', nextKey);
        setTimeout(() => document.removeEventListener('keydown', nextKey), 1000);
      }

      // New actions (N + key)
      if (e.key === 'n' || e.key === 'N') {
        const nextKey = (e: KeyboardEvent) => {
          if (e.key === 'm' || e.key === 'M') {
            setNewMemoryOpen(true);
            toast.info('Nouvelle mémoire');
          }
          if (e.key === 't' || e.key === 'T') {
            setNewTaskOpen(true);
            toast.info('Nouvelle tâche');
          }
          if (e.key === 'p' || e.key === 'P') {
            setActiveSection('work');
            toast.info('Pomodoro démarré');
          }
          document.removeEventListener('keydown', nextKey);
        };
        document.addEventListener('keydown', nextKey);
        setTimeout(() => document.removeEventListener('keydown', nextKey), 1000);
      }

      // Export data with Ctrl+E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        handleExportData();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleExportData = useCallback(() => {
    const data = {
      exportDate: new Date().toISOString(),
      sections: {
        overview: 'Overview data',
        brain: 'Brain data',
        work: 'Work data',
        system: 'System data',
      }
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bci-dashboard-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Données exportées', {
      description: 'Le fichier JSON a été téléchargé',
    });
  }, []);

  const renderSection = () => {
    switch (activeSection) {
      case "overview":
        return <OverviewSection onNavigate={setActiveSection} />;
      case "brain":
        return <BrainSection />;
      case "work":
        return <WorkSection />;
      case "health":
        return <HealthSection />;
      case "system":
        return <SystemSection />;
      case "settings":
        return <SettingsSection />;
      default:
        return <OverviewSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <ErrorBoundary>
      <ApolloProvider client={apolloClient}>
        <SidebarProvider>
        <div className="flex min-h-screen w-full">
        <Sidebar>
          <SidebarHeader className="border-b border-sidebar-border p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                <Brain className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg">BCI Dashboard</h1>
                <p className="text-xs text-sidebar-foreground/60">
                  Interface Cerveau-Ordinateur
                </p>
              </div>
            </div>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>NAVIGATION</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveSection(item.id)}
                          isActive={activeSection === item.id}
                          tooltip={item.title}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupLabel>CONFIG</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {configItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton
                          onClick={() => setActiveSection(item.id)}
                          isActive={activeSection === item.id}
                          tooltip={item.title}
                        >
                          <Icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <SidebarGroup>
              <SidebarGroupContent>
                <div className="space-y-3">
                  {/* Quick Stats */}
                  <div className="rounded-lg bg-sidebar-accent p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/60">
                        Vecteurs
                      </span>
                      <span className="text-xs font-medium">1,247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/60">
                        Nodes Neo4j
                      </span>
                      <span className="text-xs font-medium">2,583</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/60">
                        Tâches actives
                      </span>
                      <span className="text-xs font-medium">12</span>
                    </div>
                  </div>

                  {/* API Status */}
                  <div className="rounded-lg bg-sidebar-accent p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/60">
                        API Status
                      </span>
                      {apiStatus === 'checking' ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground animate-pulse" />
                          <span className="text-xs">Checking...</span>
                        </div>
                      ) : apiStatus === 'connected' ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-chart-2 animate-pulse" />
                          <span className="text-xs">Connected</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5">
                          <WifiOff className="h-3 w-3 text-chart-4" />
                          <span className="text-xs text-chart-4">Demo Mode</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-sidebar-foreground/60">
                        Mode
                      </span>
                      <span className="text-xs">
                        {apiStatus === 'connected' ? 'Production' : 'Mock Data'}
                      </span>
                    </div>
                  </div>
                </div>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-sidebar-border p-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-sidebar-foreground/60">
                  <Zap className="h-3.5 w-3.5" />
                  <span>FastAPI Backend</span>
                </div>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-sidebar-border bg-sidebar-accent px-1.5 font-mono text-[10px] text-sidebar-foreground/60">
                  ⌘K
                </kbd>
              </div>
              <div className="text-xs text-sidebar-foreground/40">
                v1.0.0 • GraphQL API
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <div className="flex-1 flex flex-col">
          <DashboardHeader 
            currentSection={activeSection} 
            onNavigate={setActiveSection}
            apiStatus={apiStatus}
            onOpenNotifications={() => setNotificationsOpen(true)}
          />
          <main className="flex-1 overflow-auto">
            <div className="container mx-auto p-6">
              {renderSection()}
            </div>
          </main>
        </div>
        </div>
        <Toaster />

        {/* Sheets & Dialogs */}
        <CommandPalette
          open={commandPaletteOpen}
          onOpenChange={setCommandPaletteOpen}
          onNavigate={setActiveSection}
          onNewMemory={() => setNewMemoryOpen(true)}
          onNewTask={() => setNewTaskOpen(true)}
        />
        <NewMemorySheet open={newMemoryOpen} onOpenChange={setNewMemoryOpen} />
        <NewTaskSheet open={newTaskOpen} onOpenChange={setNewTaskOpen} />
        <KeyboardShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
        <NotificationsCenter open={notificationsOpen} onOpenChange={setNotificationsOpen} />
        </SidebarProvider>
      </ApolloProvider>
    </ErrorBoundary>
  );
}
