import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, Users, Calendar, GripVertical, X, Loader2 } from "lucide-react";
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
import { useClients } from "@/hooks/useClients";
import { 
  useProductionPosts, 
  useUpdateProductionStatus, 
  useTeamMembers,
  productionStatusMap,
  columnToStatusMap,
  type ProductionPost 
} from "@/hooks/useProduction";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Skeleton } from "@/components/ui/skeleton";

interface KanbanColumn {
  id: string;
  title: string;
  color: string;
}

const columns: KanbanColumn[] = [
  { id: "briefing", title: "Briefing Aprovado", color: "#0E4963" },
  { id: "creation", title: "Em Criação", color: "#ff0b45" },
  { id: "review", title: "Revisão Interna", color: "#fbbf24" },
  { id: "client_approval", title: "Aprovação Cliente", color: "#10dddd" },
  { id: "scheduled", title: "Agendado", color: "#22c55e" },
  { id: "published", title: "Publicado", color: "#10b981" },
];

const priorityColors = {
  low: "bg-success/20 text-success",
  medium: "bg-warning/20 text-warning",
  high: "bg-destructive/20 text-destructive",
};

const funnelBorders = {
  topo: "border-l-secondary",
  meio: "border-l-warning",
  fundo: "border-l-primary",
};

const funnelColors = {
  topo: "funnel-topo",
  meio: "funnel-meio",
  fundo: "funnel-fundo",
};

function mapFunnelStage(stage: string): "topo" | "meio" | "fundo" {
  const stageMap: Record<string, "topo" | "meio" | "fundo"> = {
    "topo": "topo",
    "meio": "meio",
    "fundo": "fundo",
    "awareness": "topo",
    "consideration": "meio",
    "conversion": "fundo",
    "retencao": "fundo",
  };
  return stageMap[stage?.toLowerCase()] || "topo";
}

function getColumnForPost(post: ProductionPost): string {
  return productionStatusMap[post.production_status || "backlog"] || "briefing";
}

export default function Production() {
  const { clients, isLoading: clientsLoading } = useClients();
  const { posts, isLoading: postsLoading } = useProductionPosts();
  const { data: teamMembers } = useTeamMembers();
  const updateStatus = useUpdateProductionStatus();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTeamMember, setSelectedTeamMember] = useState("all");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedCard, setSelectedCard] = useState<ProductionPost | null>(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [draggedCard, setDraggedCard] = useState<{ post: ProductionPost; columnId: string } | null>(null);
  const [funnelFilter, setFunnelFilter] = useState<string[]>([]);

  // Group posts by column
  const columnData = useMemo(() => {
    const result: Record<string, ProductionPost[]> = {};
    columns.forEach(col => { result[col.id] = []; });

    (posts || []).forEach(post => {
      const columnId = getColumnForPost(post);
      if (result[columnId]) {
        result[columnId].push(post);
      }
    });

    return result;
  }, [posts]);

  // Filter posts
  const filteredColumnData = useMemo(() => {
    const result: Record<string, ProductionPost[]> = {};

    Object.entries(columnData).forEach(([columnId, posts]) => {
      result[columnId] = posts.filter(post => {
        const matchesSearch = 
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.clientName.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesTeam = selectedTeamMember === "all" || post.assigned_to === selectedTeamMember;
        
        const matchesClient = selectedClient === "all" || post.client_id === selectedClient;
        
        const postFunnel = mapFunnelStage(post.funnel_stage);
        const matchesFunnel = funnelFilter.length === 0 || funnelFilter.includes(postFunnel);

        return matchesSearch && matchesTeam && matchesClient && matchesFunnel;
      });
    });

    return result;
  }, [columnData, searchQuery, selectedTeamMember, selectedClient, funnelFilter]);

  const handleDragStart = (post: ProductionPost, columnId: string) => {
    setDraggedCard({ post, columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetColumnId: string) => {
    if (!draggedCard) return;

    const { post, columnId: sourceColumnId } = draggedCard;

    if (sourceColumnId === targetColumnId) {
      setDraggedCard(null);
      return;
    }

    const newStatus = columnToStatusMap[targetColumnId];
    if (newStatus) {
      await updateStatus.mutateAsync({ postId: post.id, productionStatus: newStatus });
      const targetColumn = columns.find(c => c.id === targetColumnId);
      toast.success(`"${post.title}" movido para ${targetColumn?.title}`);
    }

    setDraggedCard(null);
  };

  const handleCardClick = (post: ProductionPost) => {
    setSelectedCard(post);
    setIsCardModalOpen(true);
  };

  const toggleFunnelFilter = (funnel: string) => {
    setFunnelFilter(prev => 
      prev.includes(funnel) 
        ? prev.filter(f => f !== funnel)
        : [...prev, funnel]
    );
  };

  const isLoading = clientsLoading || postsLoading;

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Produção</h1>
            <p className="text-muted-foreground mt-1">
              Acompanhe o status de produção de todos os posts
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar post..."
                className="pl-9 w-48 input-modern"
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

            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-44 input-modern">
                <SelectValue placeholder="Cliente" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients?.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTeamMember} onValueChange={setSelectedTeamMember}>
              <SelectTrigger className="w-40 input-modern">
                <Users className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Equipe" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                <SelectItem value="all">Todos</SelectItem>
                {teamMembers?.map((member) => (
                  <SelectItem key={member.user_id} value={member.user_id}>
                    {member.full_name || "Sem nome"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className={funnelFilter.length > 0 ? "border-primary" : ""}>
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                <DropdownMenuLabel>Filtrar por Funil</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={funnelFilter.includes("topo")}
                  onCheckedChange={() => toggleFunnelFilter("topo")}
                >
                  Topo (Awareness)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={funnelFilter.includes("meio")}
                  onCheckedChange={() => toggleFunnelFilter("meio")}
                >
                  Meio (Consideração)
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={funnelFilter.includes("fundo")}
                  onCheckedChange={() => toggleFunnelFilter("fundo")}
                >
                  Fundo (Conversão)
                </DropdownMenuCheckboxItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 p-4 glass-card overflow-x-auto">
          {columns.map((column, index) => (
            <div key={column.id} className="flex items-center gap-2 whitespace-nowrap">
              {index > 0 && <div className="h-4 w-px bg-border flex-shrink-0" />}
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
              <span className="text-sm text-muted-foreground">{column.title}:</span>
              <span className="font-semibold">
                {isLoading ? "-" : filteredColumnData[column.id]?.length || 0}
              </span>
            </div>
          ))}
        </div>

        {/* Kanban Board */}
        {isLoading ? (
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <div key={column.id} className="flex-shrink-0 w-80 glass-card p-4">
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className="w-3 h-3 rounded-full" />
                  <Skeleton className="h-5 w-32" />
                </div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <Skeleton key={i} className="h-24 w-full rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
            {columns.map((column) => (
              <div
                key={column.id}
                className="flex-shrink-0 w-80 glass-card p-4 animate-slide-up"
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(column.id)}
              >
                {/* Column Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-semibold text-foreground">{column.title}</h3>
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                      {filteredColumnData[column.id]?.length || 0}
                    </span>
                  </div>
                </div>

                {/* Cards */}
                <div className="space-y-3 min-h-[100px]">
                  {filteredColumnData[column.id]?.map((post) => {
                    const funnel = mapFunnelStage(post.funnel_stage);
                    const assignee = teamMembers?.find(m => m.user_id === post.assigned_to);
                    
                    return (
                      <div
                        key={post.id}
                        draggable
                        onDragStart={() => handleDragStart(post, column.id)}
                        onClick={() => handleCardClick(post)}
                        className={cn(
                          "bg-muted/50 rounded-lg p-3 border-l-4 cursor-grab active:cursor-grabbing hover:bg-muted/70 transition-all group",
                          funnelBorders[funnel],
                          draggedCard?.post.id === post.id && "opacity-50"
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <p className="font-medium text-sm text-foreground line-clamp-2">
                              {post.title}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {post.clientName}
                            </p>
                          </div>
                          <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            <span>
                              {format(new Date(post.scheduled_date), "dd MMM", { locale: ptBR })}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={cn("text-xs", funnelColors[funnel])}>
                              {funnel === "topo" ? "Topo" : funnel === "meio" ? "Meio" : "Fundo"}
                            </Badge>
                            {assignee && (
                              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-medium text-primary-foreground">
                                {assignee.full_name?.charAt(0) || "?"}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {(!filteredColumnData[column.id] || filteredColumnData[column.id].length === 0) && (
                    <div className="text-center py-8 text-muted-foreground text-sm border-2 border-dashed border-border rounded-lg">
                      Arraste cards aqui
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Card Details Modal */}
      <Dialog open={isCardModalOpen} onOpenChange={setIsCardModalOpen}>
        <DialogContent className="bg-card border-border max-w-lg">
          <DialogHeader>
            <DialogTitle>{selectedCard?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Badge className={funnelColors[mapFunnelStage(selectedCard?.funnel_stage || "topo")]}>
                {mapFunnelStage(selectedCard?.funnel_stage || "topo") === "topo" ? "Topo" : 
                 mapFunnelStage(selectedCard?.funnel_stage || "topo") === "meio" ? "Meio" : "Fundo"}
              </Badge>
              <Badge variant="outline">{selectedCard?.clientName}</Badge>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">
                  {selectedCard?.scheduled_date && format(new Date(selectedCard.scheduled_date), "dd/MM/yyyy")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Plataforma</p>
                <p className="font-medium">{selectedCard?.platform || "Não definida"}</p>
              </div>
            </div>

            {selectedCard?.main_message && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Mensagem Principal</p>
                <p className="text-sm">{selectedCard.main_message}</p>
              </div>
            )}

            {selectedCard?.content && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground mb-1">Copy</p>
                <p className="text-sm whitespace-pre-wrap">{selectedCard.content}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsCardModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
