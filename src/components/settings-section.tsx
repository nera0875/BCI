import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Switch } from "./ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Slider } from "./ui/slider";
import { Badge } from "./ui/badge";
import { 
  Server, 
  Bell, 
  Palette, 
  Database, 
  Zap,
  Download,
  Upload,
  Copy,
  Check
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useDatabaseSchema } from "../lib/graphql-hooks";

export function SettingsSection() {
  const [pollInterval, setPollInterval] = useState([10]);
  const [workDuration, setWorkDuration] = useState([25]);
  const [breakDuration, setBreakDuration] = useState([5]);
  const [copied, setCopied] = useState(false);
  const [testing, setTesting] = useState(false);
  const apiEndpoint = "https://neurodopa.fr/bci/api/graphql";
  
  const { refetch: testConnection } = useDatabaseSchema({ skip: true });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiEndpoint);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Endpoint copié");
  };

  const handleTestConnection = async () => {
    setTesting(true);
    try {
      await testConnection();
      toast.success("Connexion réussie !", {
        description: "L'API GraphQL répond correctement",
      });
    } catch (error) {
      toast.error("Connexion échouée", {
        description: error instanceof Error ? error.message : "Impossible de se connecter à l'API",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleExportSettings = () => {
    const settings = {
      api: {
        url: apiEndpoint,
        autoReconnect: true,
        mockFallback: true,
        pollInterval: pollInterval[0],
      },
      preferences: {
        notifications: true,
        autoRefresh: true,
      },
      pomodoro: {
        workDuration: workDuration[0],
        breakDuration: breakDuration[0],
      }
    };
    
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bci-settings.json';
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success('Paramètres exportés');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2>Paramètres</h2>
        <p className="text-muted-foreground">
          Configuration du dashboard et des services
        </p>
      </div>

      <Tabs defaultValue="api" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="api">
            <Server className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">API</span>
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <Zap className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Préférences</span>
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Apparence</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="data">
            <Database className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Données</span>
          </TabsTrigger>
        </TabsList>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration API</CardTitle>
              <CardDescription>Paramètres de connexion à l'API GraphQL</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-url">URL de l'API</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-url"
                    value={apiEndpoint}
                    readOnly
                    className="font-mono bg-muted/50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={copyToClipboard}
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-chart-2" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Statut de connexion</Label>
                  <p className="text-sm text-muted-foreground">
                    État de la connexion au backend
                  </p>
                </div>
                <Badge variant="default" className="bg-chart-2">
                  Connecté
                </Badge>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Intervalle de rafraîchissement</Label>
                  <span className="text-sm text-muted-foreground">{pollInterval[0]}s</span>
                </div>
                <Slider
                  value={pollInterval}
                  onValueChange={setPollInterval}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto-reconnexion</Label>
                  <p className="text-sm text-muted-foreground">
                    Réessayer automatiquement en cas d'échec
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode Mock automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Basculer en mock si l'API est indisponible
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <Button 
                className="w-full" 
                onClick={handleTestConnection}
                disabled={testing}
              >
                {testing ? "Test en cours..." : "Tester la connexion"}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Préférences générales</CardTitle>
              <CardDescription>Personnalisez votre expérience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Langue</Label>
                <Select defaultValue="fr">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select defaultValue="europe/paris">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="europe/paris">Europe/Paris</SelectItem>
                    <SelectItem value="utc">UTC</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rafraîchissement automatique</Label>
                  <p className="text-sm text-muted-foreground">
                    Actualiser les données automatiquement
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Pomodoro</CardTitle>
              <CardDescription>Configuration du timer Pomodoro</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Durée de travail</Label>
                  <span className="text-sm text-muted-foreground">{workDuration[0]} min</span>
                </div>
                <Slider
                  value={workDuration}
                  onValueChange={setWorkDuration}
                  min={5}
                  max={60}
                  step={5}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Durée de pause</Label>
                  <span className="text-sm text-muted-foreground">{breakDuration[0]} min</span>
                </div>
                <Slider
                  value={breakDuration}
                  onValueChange={setBreakDuration}
                  min={1}
                  max={15}
                  step={1}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications sonores</Label>
                  <p className="text-sm text-muted-foreground">
                    Son à la fin de chaque session
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apparence</CardTitle>
              <CardDescription>Personnalisez l'interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <Select defaultValue="system">
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="system">Système</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="density">Densité</Label>
                <Select defaultValue="comfortable">
                  <SelectTrigger id="density">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Confortable</SelectItem>
                    <SelectItem value="spacious">Spacieux</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">
                    Activer les animations de l'interface
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Gérez vos préférences de notification</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications bureau</Label>
                  <p className="text-sm text-muted-foreground">
                    Afficher les notifications système
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelle tâche créée</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifier lors de la création d'une tâche
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pomodoro terminé</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifier à la fin de chaque session
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Nouvelle mémoire</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifier lors de l'ajout d'une mémoire
                  </p>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Management */}
        <TabsContent value="data" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des données</CardTitle>
              <CardDescription>Exportez ou importez vos données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Exporter les données</Label>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1" onClick={handleExportSettings}>
                    <Download className="h-4 w-4 mr-2" />
                    Paramètres
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Tout
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Importer les données</Label>
                <Button variant="outline" className="w-full">
                  <Upload className="h-4 w-4 mr-2" />
                  Importer un fichier
                </Button>
              </div>

              <div className="pt-4 border-t space-y-2">
                <Label className="text-destructive">Zone dangereuse</Label>
                <Button variant="destructive" className="w-full">
                  Réinitialiser tous les paramètres
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
