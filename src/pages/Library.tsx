import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  Grid, 
  List,
  Star,
  Eye,
  Heart,
  MessageCircle,
  Calendar,
  BookOpen,
  Lightbulb,
  Plus,
  X
} from "lucide-react";
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

interface LibraryPost {
  id: string;
  title: string;
  client: string;
  date: string;
  funnel: "topo" | "meio" | "fundo";
  format: string;
  performance: number;
  isTopPerformer: boolean;
  metrics: {
    views: number;
    likes: number;
    comments: number;
  };
  thumbnail?: string;
  copy?: string;
  insights?: string;
}

const mockPosts: LibraryPost[] = [
  {
    id: "1",
    title: "5 sinais de que você está perdendo clientes no digital",
    client: "TechStart",
    date: "2024-12-05",
    funnel: "topo",
    format: "Carrossel",
    performance: 143,
    isTopPerformer: true,
    metrics: { views: 15200, likes: 892, comments: 156 },
    copy: "🚀 Você sabia que muitas empresas perdem clientes sem nem perceber? Aqui estão 5 sinais de alerta...",
    insights: "Carrosséis educativos com números no título performam muito bem. Usar emojis no início ajuda na atenção.",
  },
  {
    id: "2",
    title: "Case de Sucesso: Como o Cliente X triplicou vendas",
    client: "FoodDelivery Plus",
    date: "2024-12-03",
    funnel: "fundo",
    format: "Reels",
    performance: 178,
    isTopPerformer: true,
    metrics: { views: 28500, likes: 1250, comments: 89 },
    copy: "Olha só o resultado incrível do nosso cliente! Em apenas 3 meses, triplicamos as vendas...",
    insights: "Depoimentos em vídeo curto têm alta conversão. Mostrar números reais gera credibilidade.",
  },
  {
    id: "3",
    title: "Tutorial: Configurando sua primeira campanha",
    client: "TechStart",
    date: "2024-12-01",
    funnel: "meio",
    format: "Vídeo",
    performance: 95,
    isTopPerformer: false,
    metrics: { views: 8900, likes: 456, comments: 67 },
    copy: "Passo a passo completo para configurar sua primeira campanha de marketing digital...",
    insights: "Tutoriais muito longos perdem engajamento. Próximo deve ser mais curto e direto.",
  },
  {
    id: "4",
    title: "Promoção Black Friday - Últimas horas!",
    client: "EcoStyle",
    date: "2024-11-29",
    funnel: "fundo",
    format: "Post",
    performance: 177,
    isTopPerformer: true,
    metrics: { views: 12300, likes: 678, comments: 234 },
    copy: "⏰ ÚLTIMAS HORAS! Black Friday EcoStyle com até 70% OFF em toda a coleção...",
    insights: "Urgência funciona muito bem. Usar timer e emojis de alerta aumenta conversão.",
  },
  {
    id: "5",
    title: "Tendências de Marketing para 2025",
    client: "Digital Academy",
    date: "2024-11-28",
    funnel: "topo",
    format: "Carrossel",
    performance: 88,
    isTopPerformer: false,
    metrics: { views: 9800, likes: 534, comments: 45 },
    copy: "O futuro do marketing já começou! Confira as 7 tendências que vão dominar 2025...",
    insights: "Post teve bom alcance mas baixo engajamento. Próximo deve ter perguntas para gerar comentários.",
  },
  {
    id: "6",
    title: "Depoimento: Maria conta sua experiência",
    client: "FitLife Gym",
    date: "2024-11-25",
    funnel: "fundo",
    format: "Reels",
    performance: 125,
    isTopPerformer: true,
    metrics: { views: 18700, likes: 1100, comments: 178 },
    copy: "A Maria perdeu 15kg em 6 meses e mudou sua vida! Assista o depoimento completo...",
    insights: "Transformações visuais geram muito engajamento. Antes/depois é muito efetivo.",
  },
];

const initialInsights = [
  {
    id: "1",
    title: "Carrosséis educativos performam melhor",
    description: "Posts em carrossel com conteúdo educativo tiveram 40% mais salvamentos que outros formatos.",
    type: "success",
    date: "2024-12-01",
  },
  {
    id: "2",
    title: "Horário ideal: 18h-20h",
    description: "Posts publicados entre 18h e 20h tiveram 25% mais engajamento.",
    type: "success",
    date: "2024-11-28",
  },
  {
    id: "3",
    title: "Conteúdo de MEIO precisa de ajuste",
    description: "Posts de consideração tiveram performance 15% abaixo da média. Revisar estratégia.",
    type: "warning",
    date: "2024-11-25",
  },
];

const funnelColors = {
  topo: "funnel-topo",
  meio: "funnel-meio",
  fundo: "funnel-fundo",
};

export default function Library() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [activeTab, setActiveTab] = useState<"posts" | "insights">("posts");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState("all");
  const [selectedFunnel, setSelectedFunnel] = useState("all");
  const [showTopPerformers, setShowTopPerformers] = useState(false);
  const [selectedPost, setSelectedPost] = useState<LibraryPost | null>(null);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isNewInsightModalOpen, setIsNewInsightModalOpen] = useState(false);
  const [insights, setInsights] = useState(initialInsights);
  const [newInsight, setNewInsight] = useState({ title: "", description: "", type: "success" });
  const [formatFilter, setFormatFilter] = useState<string[]>([]);

  const filteredPosts = mockPosts.filter((post) => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.client.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClient = selectedClient === "all" || 
                         post.client.toLowerCase().includes(selectedClient.toLowerCase());
    const matchesFunnel = selectedFunnel === "all" || post.funnel === selectedFunnel;
    const matchesTopPerformer = !showTopPerformers || post.isTopPerformer;
    const matchesFormat = formatFilter.length === 0 || formatFilter.includes(post.format.toLowerCase());
    return matchesSearch && matchesClient && matchesFunnel && matchesTopPerformer && matchesFormat;
  });

  const handlePostClick = (post: LibraryPost) => {
    setSelectedPost(post);
    setIsPostModalOpen(true);
  };

  const handleCreateInsight = () => {
    if (!newInsight.title.trim() || !newInsight.description.trim()) {
      toast.error("Por favor, preencha todos os campos");
      return;
    }
    const insight = {
      id: String(insights.length + 1),
      ...newInsight,
      date: new Date().toISOString().split("T")[0],
    };
    setInsights(prev => [insight, ...prev]);
    setIsNewInsightModalOpen(false);
    setNewInsight({ title: "", description: "", type: "success" });
    toast.success("Insight salvo com sucesso!");
  };

  const toggleFormatFilter = (format: string) => {
    setFormatFilter(prev => 
      prev.includes(format) 
        ? prev.filter(f => f !== format)
        : [...prev, format]
    );
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Biblioteca</h1>
            <p className="text-muted-foreground mt-1">
              Histórico de posts e insights de aprendizado
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por tema, cliente..."
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
                <Button variant="outline" size="icon" className={formatFilter.length > 0 ? "border-primary" : ""}>
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-card border-border">
                <DropdownMenuLabel>Filtrar por Formato</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuCheckboxItem
                  checked={formatFilter.includes("carrossel")}
                  onCheckedChange={() => toggleFormatFilter("carrossel")}
                >
                  Carrossel
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={formatFilter.includes("reels")}
                  onCheckedChange={() => toggleFormatFilter("reels")}
                >
                  Reels
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={formatFilter.includes("vídeo")}
                  onCheckedChange={() => toggleFormatFilter("vídeo")}
                >
                  Vídeo
                </DropdownMenuCheckboxItem>
                <DropdownMenuCheckboxItem
                  checked={formatFilter.includes("post")}
                  onCheckedChange={() => toggleFormatFilter("post")}
                >
                  Post
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
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-4 border-b border-border pb-4">
          <Button 
            variant="ghost" 
            className={cn(
              "gap-2 rounded-none",
              activeTab === "posts" && "text-primary border-b-2 border-primary"
            )}
            onClick={() => setActiveTab("posts")}
          >
            <BookOpen className="w-4 h-4" />
            Posts Publicados
          </Button>
          <Button 
            variant="ghost" 
            className={cn(
              "gap-2 rounded-none",
              activeTab === "insights" && "text-primary border-b-2 border-primary"
            )}
            onClick={() => setActiveTab("insights")}
          >
            <Lightbulb className="w-4 h-4" />
            Insights Salvos
          </Button>
        </div>

        {activeTab === "posts" && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger className="w-40 input-modern">
                  <SelectValue placeholder="Cliente" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos os clientes</SelectItem>
                  <SelectItem value="techstart">TechStart</SelectItem>
                  <SelectItem value="fooddelivery">FoodDelivery Plus</SelectItem>
                  <SelectItem value="ecostyle">EcoStyle</SelectItem>
                  <SelectItem value="fitlife">FitLife Gym</SelectItem>
                  <SelectItem value="digital">Digital Academy</SelectItem>
                </SelectContent>
              </Select>

              <Select value={selectedFunnel} onValueChange={setSelectedFunnel}>
                <SelectTrigger className="w-32 input-modern">
                  <SelectValue placeholder="Funil" />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="topo">Topo</SelectItem>
                  <SelectItem value="meio">Meio</SelectItem>
                  <SelectItem value="fundo">Fundo</SelectItem>
                </SelectContent>
              </Select>

              <Button 
                variant={showTopPerformers ? "default" : "outline"} 
                className="gap-2"
                onClick={() => setShowTopPerformers(!showTopPerformers)}
              >
                <Star className={cn("w-4 h-4", showTopPerformers && "fill-current")} />
                Top Performers
              </Button>
            </div>

            {/* Posts Grid */}
            <div className={cn(
              "grid gap-4",
              viewMode === "grid" 
                ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" 
                : "grid-cols-1"
            )}>
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, index) => (
                  <div
                    key={post.id}
                    className="glass-card p-5 hover:border-primary/30 transition-all duration-300 animate-slide-up cursor-pointer"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handlePostClick(post)}
                  >
                    {/* Thumbnail placeholder */}
                    <div className="aspect-video bg-muted/50 rounded-lg mb-4 flex items-center justify-center">
                      <span className="text-muted-foreground text-sm">{post.format}</span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-medium text-sm line-clamp-2">{post.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{post.client}</p>
                        </div>
                        {post.isTopPerformer && (
                          <Star className="w-4 h-4 text-warning fill-warning flex-shrink-0" />
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <Badge className={funnelColors[post.funnel]}>
                          {post.funnel === "topo" ? "Topo" : post.funnel === "meio" ? "Meio" : "Fundo"}
                        </Badge>
                        <Badge variant="outline">{post.format}</Badge>
                        <Badge 
                          className={cn(
                            post.performance >= 100 
                              ? "bg-success/20 text-success border-success/30" 
                              : "bg-muted text-muted-foreground"
                          )}
                        >
                          {post.performance}%
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs text-muted-foreground">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(post.metrics.views / 1000).toFixed(1)}K
                          </span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            {post.metrics.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {post.metrics.comments}
                          </span>
                        </div>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(post.date).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <p className="text-lg">Nenhum post encontrado</p>
                  <p className="text-sm mt-1">Tente ajustar os filtros ou termos de busca</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === "insights" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">Aprendizados documentados pela equipe</p>
              <Button className="gap-2" onClick={() => setIsNewInsightModalOpen(true)}>
                <Plus className="w-4 h-4" />
                Novo Insight
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {insights.map((insight, index) => (
                <div
                  key={insight.id}
                  className={cn(
                    "glass-card p-5 border-l-4 animate-slide-up",
                    insight.type === "success" ? "border-l-success" : "border-l-warning"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-3">
                    <Lightbulb className={cn(
                      "w-5 h-5 mt-0.5 flex-shrink-0",
                      insight.type === "success" ? "text-success" : "text-warning"
                    )} />
                    <div>
                      <h3 className="font-medium">{insight.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(insight.date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Post Details Modal */}
      <Dialog open={isPostModalOpen} onOpenChange={setIsPostModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Badge className={funnelColors[selectedPost?.funnel || "topo"]}>
                {selectedPost?.funnel === "topo" ? "Topo" : selectedPost?.funnel === "meio" ? "Meio" : "Fundo"}
              </Badge>
              <Badge variant="outline">{selectedPost?.format}</Badge>
              <Badge variant="outline">{selectedPost?.client}</Badge>
              {selectedPost?.isTopPerformer && (
                <Badge className="bg-warning/20 text-warning border-warning/30">
                  <Star className="w-3 h-3 mr-1 fill-current" />
                  Top Performer
                </Badge>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                <Eye className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{((selectedPost?.metrics.views || 0) / 1000).toFixed(1)}K</p>
                <p className="text-xs text-muted-foreground">Views</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                <Heart className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{selectedPost?.metrics.likes}</p>
                <p className="text-xs text-muted-foreground">Curtidas</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border text-center">
                <MessageCircle className="w-5 h-5 mx-auto text-muted-foreground mb-1" />
                <p className="text-lg font-bold">{selectedPost?.metrics.comments}</p>
                <p className="text-xs text-muted-foreground">Comentários</p>
              </div>
            </div>

            {selectedPost?.copy && (
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm font-medium mb-2">Copy utilizada:</p>
                <p className="text-sm text-muted-foreground">{selectedPost.copy}</p>
              </div>
            )}

            {selectedPost?.insights && (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <p className="text-sm font-medium mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  Insights do post:
                </p>
                <p className="text-sm">{selectedPost.insights}</p>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsPostModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Insight Modal */}
      <Dialog open={isNewInsightModalOpen} onOpenChange={setIsNewInsightModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Novo Insight</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Título</Label>
              <Input
                placeholder="Ex: Carrosséis educativos performam melhor"
                className="input-modern"
                value={newInsight.title}
                onChange={(e) => setNewInsight({ ...newInsight, title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Textarea
                placeholder="Descreva o insight em detalhes..."
                className="input-modern min-h-[100px]"
                value={newInsight.description}
                onChange={(e) => setNewInsight({ ...newInsight, description: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Tipo</Label>
              <Select value={newInsight.type} onValueChange={(value) => setNewInsight({ ...newInsight, type: value })}>
                <SelectTrigger className="input-modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="success">Sucesso (O que funcionou)</SelectItem>
                  <SelectItem value="warning">Alerta (O que precisa melhorar)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsNewInsightModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleCreateInsight}>
                Salvar Insight
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
