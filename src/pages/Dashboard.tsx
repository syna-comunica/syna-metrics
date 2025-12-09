import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { MatrixIndicator } from "@/components/dashboard/MatrixIndicator";
import { AlertCard } from "@/components/dashboard/AlertCard";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Calendar, 
  TrendingUp, 
  Target,
  Plus,
  Search,
  Filter,
  X,
  Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients, useCreateClient } from "@/hooks/useClients";
import { useDashboardMetrics } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { clients, isLoading: clientsLoading } = useClients();
  const { metrics, alerts, isLoading: metricsLoading } = useDashboardMetrics();
  const createClient = useCreateClient();

  const [searchQuery, setSearchQuery] = useState("");
  const [isNewClientModalOpen, setIsNewClientModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientSegment, setNewClientSegment] = useState("");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);

  const filteredClients = (clients || []).filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.industry || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter.length === 0 || statusFilter.includes(client.scheduleStatus);
    return matchesSearch && matchesStatus;
  }).slice(0, 4); // Show only first 4 on dashboard

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      return;
    }
    await createClient.mutateAsync({
      name: newClientName.trim(),
      industry: newClientSegment || null,
      created_by: user?.id,
    });
    setIsNewClientModalOpen(false);
    setNewClientName("");
    setNewClientSegment("");
  };

  const toggleStatusFilter = (status: string) => {
    setStatusFilter(prev => 
      prev.includes(status) 
        ? prev.filter(s => s !== status)
        : [...prev, status]
    );
  };

  const isLoading = clientsLoading || metricsLoading;

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Visão geral de todos os clientes e métricas
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar cliente..."
                className="pl-9 w-64 input-modern"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                  onClick={() => setSearchQuery("")}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={statusFilter.length > 0 ? "border-primary" : ""}>
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                <DropdownMenuLabel>Filtrar por status</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("pending")}
                  onCheckedChange={() => toggleStatusFilter("pending")}
                >
                  Pendente
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("approved")}
                  onCheckedChange={() => toggleStatusFilter("approved")}
                >
                  Aprovado
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("in_production")}
                  onCheckedChange={() => toggleStatusFilter("in_production")}
                >
                  Em Produção
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={statusFilter.includes("published")}
                  onCheckedChange={() => toggleStatusFilter("published")}
                >
                  Publicado
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button className="gap-2" onClick={() => setIsNewClientModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="metric-card">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-8 w-16" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                    <Skeleton className="w-12 h-12 rounded-xl" />
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              <MetricCard
                title="Total de Clientes"
                value={metrics?.totalClients || 0}
                change={metrics?.activeClients ? Math.round((metrics.activeClients / (metrics.totalClients || 1)) * 100) : 0}
                changeLabel="ativos"
                icon={Users}
                variant="primary"
              />
              <MetricCard
                title="Cronogramas"
                value={`${metrics?.approvedSchedules || 0}/${metrics?.totalClients || 0}`}
                change={metrics?.pendingSchedules || 0}
                changeLabel="pendentes"
                icon={Calendar}
                variant="accent"
              />
              <MetricCard
                title="Meta Média"
                value={`${metrics?.averageGoalProgress || 0}%`}
                change={metrics?.averageGoalProgress ? metrics.averageGoalProgress - 70 : 0}
                changeLabel="vs meta"
                icon={Target}
                variant="warning"
              />
              <MetricCard
                title="Posts Publicados"
                value={metrics?.postsPublished || 0}
                change={metrics?.postsInProduction || 0}
                changeLabel="em produção"
                icon={TrendingUp}
                variant="primary"
              />
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Clients Grid */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Clientes Ativos</h2>
              <Button variant="ghost" size="sm" onClick={() => navigate("/clients")}>
                Ver todos
              </Button>
            </div>
            {clientsLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="glass-card p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-12 h-12 rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                    <Skeleton className="h-2 w-full" />
                    <Skeleton className="h-2 w-3/4" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredClients.length > 0 ? (
                  filteredClients.map((client) => (
                    <ClientCard 
                      key={client.id} 
                      id={client.id}
                      name={client.name}
                      logo={client.logo_url || undefined}
                      segment={client.industry || "Não definido"}
                      scheduleStatus={client.scheduleStatus}
                      goalProgress={client.goalProgress}
                      postsCompleted={client.postsCompleted}
                      postsTotal={client.postsTotal}
                      lastUpdate={client.lastUpdate}
                    />
                  ))
                ) : (
                  <div className="col-span-2 text-center py-8 text-muted-foreground">
                    <p>Nenhum cliente encontrado</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setIsNewClientModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Adicionar primeiro cliente
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <MatrixIndicator 
              topo={metrics?.topoCount || 0} 
              meio={metrics?.meioCount || 0} 
              fundo={metrics?.fundoCount || 0} 
            />
            <AlertCard alerts={alerts} />
          </div>
        </div>
      </div>

      {/* New Client Modal */}
      <Dialog open={isNewClientModalOpen} onOpenChange={setIsNewClientModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente</Label>
              <Input
                id="clientName"
                placeholder="Ex: TechStart"
                className="input-modern"
                value={newClientName}
                onChange={(e) => setNewClientName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clientSegment">Segmento</Label>
              <Select value={newClientSegment} onValueChange={setNewClientSegment}>
                <SelectTrigger className="input-modern">
                  <SelectValue placeholder="Selecione o segmento" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                  <SelectItem value="Alimentação">Alimentação</SelectItem>
                  <SelectItem value="Moda">Moda</SelectItem>
                  <SelectItem value="Fitness">Fitness</SelectItem>
                  <SelectItem value="Educação">Educação</SelectItem>
                  <SelectItem value="Beleza">Beleza</SelectItem>
                  <SelectItem value="Saúde">Saúde</SelectItem>
                  <SelectItem value="Finanças">Finanças</SelectItem>
                  <SelectItem value="Outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsNewClientModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateClient} disabled={createClient.isPending || !newClientName.trim()}>
                {createClient.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Cliente
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
