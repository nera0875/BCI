import { Bell, Search, Moon, Sun, Command, Zap, Wifi, WifiOff } from "lucide-react";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { SidebarTrigger } from "./ui/sidebar";
import { Badge } from "./ui/badge";
import { useState, useEffect } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "./ui/command";

type DashboardHeaderProps = {
  currentSection: string;
  onNavigate: (section: string) => void;
  apiStatus?: 'checking' | 'connected' | 'mock';
};



const sectionLabels: Record<string, string> = {
  overview: "Vue d'ensemble",
  brain: "Brain",
  work: "Work",
  system: "System",
  settings: "Paramètres",
};

const quickActions = [
  { id: "new-task", label: "Nouvelle tâche", section: "work" },
  { id: "new-memory", label: "Nouvelle mémoire", section: "brain" },
  { id: "start-pomodoro", label: "Démarrer Pomodoro", section: "work" },
  { id: "view-logs", label: "Voir les logs", section: "system" },
];

export function DashboardHeader({ currentSection, onNavigate, apiStatus = 'checking' }: DashboardHeaderProps) {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [commandOpen, setCommandOpen] = useState(false);

  useEffect(() => {
    const root = window.document.documentElement;
    const isDark = root.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    if (theme === "light") {
      root.classList.add("dark");
      setTheme("dark");
    } else {
      root.classList.remove("dark");
      setTheme("light");
    }
  };

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <>
      <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 py-3 gap-4">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">Dashboard</span>
              <span className="text-muted-foreground">/</span>
              <span className="font-medium">{sectionLabels[currentSection]}</span>
            </div>
          </div>

          <div className="flex-1 max-w-md hidden lg:block">
            <Button
              variant="outline"
              className="w-full justify-between text-muted-foreground hover:text-foreground bg-input-background border-0"
              onClick={() => setCommandOpen(true)}
            >
              <div className="flex items-center gap-2">
                <Search className="h-4 w-4" />
                <span>Rechercher...</span>
              </div>
              <div className="flex items-center gap-1 text-xs">
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono opacity-100">
                  <Command className="h-3 w-3" />K
                </kbd>
              </div>
            </Button>
          </div>

          <div className="flex items-center gap-1">
            {/* API Status Indicator */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md bg-muted/50 mr-2">
              {apiStatus === 'connected' ? (
                <>
                  <Wifi className="h-3.5 w-3.5 text-chart-2" />
                  <span className="text-xs">API</span>
                </>
              ) : apiStatus === 'mock' ? (
                <>
                  <WifiOff className="h-3.5 w-3.5 text-chart-4" />
                  <span className="text-xs text-muted-foreground">Mock</span>
                </>
              ) : (
                <>
                  <div className="h-3.5 w-3.5 rounded-full bg-muted-foreground animate-pulse" />
                  <span className="text-xs text-muted-foreground">...</span>
                </>
              )}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>

            <Button variant="ghost" size="icon" onClick={toggleTheme}>
              {theme === "light" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-destructive rounded-full animate-pulse" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="space-y-1 max-h-80 overflow-y-auto">
                  <div className="px-2 py-3 hover:bg-accent rounded-md cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-chart-2/10 flex items-center justify-center shrink-0">
                        <Zap className="h-4 w-4 text-chart-2" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">Nouvelle mémoire créée</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Il y a 5 minutes</p>
                      </div>
                    </div>
                  </div>
                  <div className="px-2 py-3 hover:bg-accent rounded-md cursor-pointer">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-full bg-chart-4/10 flex items-center justify-center shrink-0">
                        ⏱️
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm">Pomodoro terminé</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Il y a 12 minutes</p>
                      </div>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <div className="p-2">
                  <Button variant="ghost" className="w-full text-xs">
                    Tout marquer comme lu
                  </Button>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="relative h-8 w-8 rounded-full hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ml-1">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">BCI</AvatarFallback>
                  </Avatar>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  <div>
                    <p>Mon compte</p>
                    <p className="text-xs text-muted-foreground font-normal">admin@bci.dev</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Profil</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onNavigate("settings")}>
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>Déconnexion</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Command Palette */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Rechercher ou taper une commande..." />
        <CommandList>
          <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
          
          <CommandGroup heading="Navigation">
            {Object.entries(sectionLabels).map(([key, label]) => (
              <CommandItem
                key={key}
                onSelect={() => {
                  onNavigate(key);
                  setCommandOpen(false);
                }}
              >
                <span>{label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Actions rapides">
            {quickActions.map((action) => (
              <CommandItem
                key={action.id}
                onSelect={() => {
                  onNavigate(action.section);
                  setCommandOpen(false);
                }}
              >
                <span className="mr-2">{action.icon}</span>
                <span>{action.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          <CommandGroup heading="Thème">
            <CommandItem onSelect={toggleTheme}>
              {theme === "light" ? (
                <>
                  <Moon className="mr-2 h-4 w-4" />
                  <span>Mode sombre</span>
                </>
              ) : (
                <>
                  <Sun className="mr-2 h-4 w-4" />
                  <span>Mode clair</span>
                </>
              )}
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </>
  );
}
