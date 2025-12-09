import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { ClientCard } from "@/components/dashboard/ClientCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Filter, Grid, List, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useClients, useCreateClient, useDeleteClient } from "@/hooks/useClients";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

export default function Clients() {
  const { user } = useAuth();
  const { clients, isLoading, error } = useClients();
  const createClient = useCreateClient();
  const deleteClient = useDeleteClient();

  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
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
  });

  const handleCreateClient = async () => {
    if (!newClientName.trim()) {
      toast.error("Por favor, insira o nome do cliente");
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

  // Calculate stats from real data
  const activeCount = clients?.filter((c) => c.status === "active").length || 0;
  const pendingCount = clients?.filter((c) => c.scheduleStatus === "pending").length || 0;
  const inactiveCount = clients?.filter((c) => c.status === "inactive").length || 0;

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <p className="text-destructive">Erro ao carregar clientes</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Clientes</h1>
            <p className="text-muted-foreground mt-1">
              Gerencie todos os clientes da agência
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
            <div className="flex items-center border border-border rounded-lg p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                className="w-8 h-8"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
            <Button className="gap-2" onClick={() => setIsNewClientModalOpen(true)}>
              <Plus className="w-4 h-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 p-4 glass-card">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Ativos:</span>
            <span className="font-semibold">{isLoading ? "-" : activeCount}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Pendentes:</span>
            <span className="font-semibold">{isLoading ? "-" : pendingCount}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted" />
            <span className="text-sm text-muted-foreground">Inativos:</span>
            <span className="font-semibold">{isLoading ? "-" : inactiveCount}</span>
          </div>
        </div>

        {/* Clients Grid */}
        {isLoading ? (
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
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
          <div className={cn(
            "grid gap-4",
            viewMode === "grid" 
              ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
              : "grid-cols-1"
          )}>
            {filteredClients.length > 0 ? (
              filteredClients.map((client, index) => (
                <div key={client.id} style={{ animationDelay: `${index * 50}ms` }}>
                  <ClientCard
                    id={client.id}
                    name={client.name}
                    logo={client.logo_url || undefined}
                    segment={client.industry || "Não definido"}
                    scheduleStatus={client.scheduleStatus}
                    goalProgress={client.goalProgress}
                    postsCompleted={client.postsCompleted}
                    postsTotal={client.postsTotal}
                    lastUpdate={client.lastUpdate}
                    onDelete={() => deleteClient.mutate(client.id)}
                  />
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-muted-foreground">
                <p className="text-lg">Nenhum cliente encontrado</p>
                <p className="text-sm mt-1">
                  {clients?.length === 0 
                    ? "Comece adicionando seu primeiro cliente" 
                    : "Tente ajustar os filtros ou termos de busca"}
                </p>
              </div>
            )}
          </div>
        )}
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
              <Button onClick={handleCreateClient} disabled={createClient.isPending}>
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
