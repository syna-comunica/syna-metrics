import { useState, useMemo } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  TrendingUp, 
  Target, 
  DollarSign, 
  Users,
  Download,
  Share2,
  Calendar,
  Eye,
  Heart,
  MessageCircle,
  MousePointer
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts";
import { toast } from "sonner";

// Data per client and month
const clientData: Record<string, Record<string, any>> = {
  "1": {
    "dec": {
      name: "TechStart",
      salesGoal: 28,
      salesActual: 24,
      leadsGoal: 140,
      leadsActual: 156,
      cacMax: 450,
      cacActual: 387,
      roi: 4.2,
      performanceData: [
        { name: "Sem 1", alcance: 12000, engajamento: 850, cliques: 320 },
        { name: "Sem 2", alcance: 15000, engajamento: 1200, cliques: 450 },
        { name: "Sem 3", alcance: 18000, engajamento: 1450, cliques: 580 },
        { name: "Sem 4", alcance: 22000, engajamento: 1800, cliques: 720 },
      ],
      funnelData: [
        { name: "Topo", value: 12, color: "#0E4963" },
        { name: "Meio", value: 8, color: "#fbbf24" },
        { name: "Fundo", value: 10, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "5 sinais de que você está perdendo clientes...", metric: "287 salvamentos", performance: 143, funnel: "topo" },
        { id: "2", title: "Case Cliente X - Como aumentamos vendas", metric: "89 comentários", performance: 178, funnel: "fundo" },
        { id: "3", title: "Promoção Black Friday", metric: "142 cliques", performance: 177, funnel: "fundo" },
      ],
      contentMetrics: { alcance: "67.5K", engajamento: "5.3K", comentarios: "892", cliques: "2.1K" },
    },
    "nov": {
      name: "TechStart",
      salesGoal: 25,
      salesActual: 22,
      leadsGoal: 120,
      leadsActual: 118,
      cacMax: 500,
      cacActual: 420,
      roi: 3.8,
      performanceData: [
        { name: "Sem 1", alcance: 10000, engajamento: 700, cliques: 280 },
        { name: "Sem 2", alcance: 12000, engajamento: 900, cliques: 350 },
        { name: "Sem 3", alcance: 14000, engajamento: 1100, cliques: 420 },
        { name: "Sem 4", alcance: 16000, engajamento: 1300, cliques: 500 },
      ],
      funnelData: [
        { name: "Topo", value: 10, color: "#0E4963" },
        { name: "Meio", value: 7, color: "#fbbf24" },
        { name: "Fundo", value: 8, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "Tutorial: Como começar no digital", metric: "220 salvamentos", performance: 120, funnel: "topo" },
        { id: "2", title: "Depoimento do João", metric: "65 comentários", performance: 150, funnel: "fundo" },
        { id: "3", title: "Comparativo de ferramentas", metric: "98 cliques", performance: 130, funnel: "meio" },
      ],
      contentMetrics: { alcance: "52K", engajamento: "4K", comentarios: "650", cliques: "1.5K" },
    },
  },
  "2": {
    "dec": {
      name: "FoodDelivery Plus",
      salesGoal: 50,
      salesActual: 48,
      leadsGoal: 200,
      leadsActual: 210,
      cacMax: 300,
      cacActual: 280,
      roi: 5.1,
      performanceData: [
        { name: "Sem 1", alcance: 25000, engajamento: 2000, cliques: 800 },
        { name: "Sem 2", alcance: 30000, engajamento: 2500, cliques: 950 },
        { name: "Sem 3", alcance: 35000, engajamento: 3000, cliques: 1100 },
        { name: "Sem 4", alcance: 40000, engajamento: 3500, cliques: 1300 },
      ],
      funnelData: [
        { name: "Topo", value: 15, color: "#0E4963" },
        { name: "Meio", value: 10, color: "#fbbf24" },
        { name: "Fundo", value: 12, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "Promoção: 50% OFF no primeiro pedido", metric: "450 cliques", performance: 200, funnel: "fundo" },
        { id: "2", title: "Bastidores da nossa cozinha", metric: "180 comentários", performance: 160, funnel: "topo" },
        { id: "3", title: "Novos pratos no cardápio", metric: "320 salvamentos", performance: 145, funnel: "meio" },
      ],
      contentMetrics: { alcance: "130K", engajamento: "11K", comentarios: "1.8K", cliques: "4.1K" },
    },
    "nov": {
      name: "FoodDelivery Plus",
      salesGoal: 45,
      salesActual: 40,
      leadsGoal: 180,
      leadsActual: 175,
      cacMax: 320,
      cacActual: 310,
      roi: 4.5,
      performanceData: [
        { name: "Sem 1", alcance: 20000, engajamento: 1500, cliques: 600 },
        { name: "Sem 2", alcance: 24000, engajamento: 1800, cliques: 700 },
        { name: "Sem 3", alcance: 28000, engajamento: 2200, cliques: 850 },
        { name: "Sem 4", alcance: 32000, engajamento: 2600, cliques: 1000 },
      ],
      funnelData: [
        { name: "Topo", value: 12, color: "#0E4963" },
        { name: "Meio", value: 9, color: "#fbbf24" },
        { name: "Fundo", value: 10, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "Receita especial de Halloween", metric: "280 salvamentos", performance: 140, funnel: "topo" },
        { id: "2", title: "Cupom exclusivo", metric: "350 cliques", performance: 175, funnel: "fundo" },
        { id: "3", title: "Como escolher seu prato", metric: "120 comentários", performance: 130, funnel: "meio" },
      ],
      contentMetrics: { alcance: "104K", engajamento: "8.1K", comentarios: "1.4K", cliques: "3.1K" },
    },
  },
  "3": {
    "dec": {
      name: "EcoStyle",
      salesGoal: 35,
      salesActual: 28,
      leadsGoal: 160,
      leadsActual: 145,
      cacMax: 400,
      cacActual: 450,
      roi: 3.2,
      performanceData: [
        { name: "Sem 1", alcance: 8000, engajamento: 600, cliques: 200 },
        { name: "Sem 2", alcance: 10000, engajamento: 750, cliques: 280 },
        { name: "Sem 3", alcance: 12000, engajamento: 900, cliques: 350 },
        { name: "Sem 4", alcance: 14000, engajamento: 1050, cliques: 420 },
      ],
      funnelData: [
        { name: "Topo", value: 14, color: "#0E4963" },
        { name: "Meio", value: 6, color: "#fbbf24" },
        { name: "Fundo", value: 5, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "Materiais sustentáveis explicados", metric: "180 salvamentos", performance: 110, funnel: "topo" },
        { id: "2", title: "Nova coleção inverno", metric: "95 comentários", performance: 125, funnel: "fundo" },
        { id: "3", title: "Por que escolher moda sustentável?", metric: "70 cliques", performance: 90, funnel: "meio" },
      ],
      contentMetrics: { alcance: "44K", engajamento: "3.3K", comentarios: "520", cliques: "1.2K" },
    },
    "nov": {
      name: "EcoStyle",
      salesGoal: 30,
      salesActual: 32,
      leadsGoal: 140,
      leadsActual: 155,
      cacMax: 380,
      cacActual: 340,
      roi: 3.8,
      performanceData: [
        { name: "Sem 1", alcance: 9000, engajamento: 700, cliques: 250 },
        { name: "Sem 2", alcance: 11000, engajamento: 850, cliques: 320 },
        { name: "Sem 3", alcance: 13000, engajamento: 1000, cliques: 400 },
        { name: "Sem 4", alcance: 15000, engajamento: 1150, cliques: 480 },
      ],
      funnelData: [
        { name: "Topo", value: 11, color: "#0E4963" },
        { name: "Meio", value: 8, color: "#fbbf24" },
        { name: "Fundo", value: 7, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "Black November Eco", metric: "250 salvamentos", performance: 155, funnel: "fundo" },
        { id: "2", title: "Bastidores da produção", metric: "110 comentários", performance: 140, funnel: "topo" },
        { id: "3", title: "Guia de tamanhos", metric: "85 cliques", performance: 100, funnel: "meio" },
      ],
      contentMetrics: { alcance: "48K", engajamento: "3.7K", comentarios: "580", cliques: "1.4K" },
    },
  },
  "4": {
    "dec": {
      name: "FitLife Gym",
      salesGoal: 40,
      salesActual: 42,
      leadsGoal: 180,
      leadsActual: 195,
      cacMax: 350,
      cacActual: 310,
      roi: 4.8,
      performanceData: [
        { name: "Sem 1", alcance: 18000, engajamento: 1400, cliques: 550 },
        { name: "Sem 2", alcance: 22000, engajamento: 1700, cliques: 680 },
        { name: "Sem 3", alcance: 26000, engajamento: 2000, cliques: 820 },
        { name: "Sem 4", alcance: 30000, engajamento: 2300, cliques: 960 },
      ],
      funnelData: [
        { name: "Topo", value: 10, color: "#0E4963" },
        { name: "Meio", value: 9, color: "#fbbf24" },
        { name: "Fundo", value: 11, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "Transformação do João - 6 meses", metric: "380 salvamentos", performance: 190, funnel: "fundo" },
        { id: "2", title: "5 exercícios para iniciantes", metric: "145 comentários", performance: 155, funnel: "topo" },
        { id: "3", title: "Promoção Ano Novo", metric: "210 cliques", performance: 180, funnel: "fundo" },
      ],
      contentMetrics: { alcance: "96K", engajamento: "7.4K", comentarios: "1.2K", cliques: "3K" },
    },
    "nov": {
      name: "FitLife Gym",
      salesGoal: 35,
      salesActual: 38,
      leadsGoal: 160,
      leadsActual: 172,
      cacMax: 370,
      cacActual: 335,
      roi: 4.5,
      performanceData: [
        { name: "Sem 1", alcance: 15000, engajamento: 1200, cliques: 480 },
        { name: "Sem 2", alcance: 18000, engajamento: 1450, cliques: 580 },
        { name: "Sem 3", alcance: 21000, engajamento: 1700, cliques: 700 },
        { name: "Sem 4", alcance: 24000, engajamento: 1950, cliques: 820 },
      ],
      funnelData: [
        { name: "Topo", value: 9, color: "#0E4963" },
        { name: "Meio", value: 8, color: "#fbbf24" },
        { name: "Fundo", value: 9, color: "#ff0b45" },
      ],
      topPosts: [
        { id: "1", title: "Black Friday - 3 meses por 2", metric: "300 cliques", performance: 175, funnel: "fundo" },
        { id: "2", title: "Dicas de nutrição", metric: "250 salvamentos", performance: 145, funnel: "topo" },
        { id: "3", title: "Tour pela academia", metric: "95 comentários", performance: 120, funnel: "meio" },
      ],
      contentMetrics: { alcance: "78K", engajamento: "6.3K", comentarios: "980", cliques: "2.5K" },
    },
  },
};

const clients = [
  { id: "1", name: "TechStart" },
  { id: "2", name: "FoodDelivery Plus" },
  { id: "3", name: "EcoStyle" },
  { id: "4", name: "FitLife Gym" },
];

const months = [
  { id: "nov", name: "Novembro 2024" },
  { id: "dec", name: "Dezembro 2024" },
];

export default function Performance() {
  const [selectedClient, setSelectedClient] = useState("1");
  const [selectedMonth, setSelectedMonth] = useState("dec");

  const data = useMemo(() => {
    return clientData[selectedClient]?.[selectedMonth] || clientData["1"]["dec"];
  }, [selectedClient, selectedMonth]);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copiado para a área de transferência!");
  };

  const handleExportPDF = () => {
    toast.info("Gerando relatório PDF...");
    // Simulate PDF generation
    setTimeout(() => {
      toast.success("Relatório PDF gerado com sucesso!");
    }, 2000);
  };

  const salesPercent = ((data.salesActual / data.salesGoal) * 100).toFixed(1);
  const leadsPercent = ((data.leadsActual / data.leadsGoal) * 100).toFixed(0);
  const cacImprovement = (((data.cacMax - data.cacActual) / data.cacMax) * 100).toFixed(0);

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Performance</h1>
            <p className="text-muted-foreground mt-1">
              Análise de resultados e métricas de negócio - {data.name}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Select value={selectedClient} onValueChange={setSelectedClient}>
              <SelectTrigger className="w-48 input-modern">
                <SelectValue placeholder="Selecione o cliente" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-40 input-modern">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent className="bg-card border-border">
                {months.map((month) => (
                  <SelectItem key={month.id} value={month.id}>
                    {month.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button variant="outline" className="gap-2" onClick={handleShare}>
              <Share2 className="w-4 h-4" />
              Compartilhar
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleExportPDF}>
              <Download className="w-4 h-4" />
              Exportar PDF
            </Button>
          </div>
        </div>

        {/* Business Metrics */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Métricas de Negócio
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Meta de Vendas</span>
                <span className={cn("status-badge", Number(salesPercent) >= 100 ? "status-success" : "status-warning")}>
                  {salesPercent}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{data.salesActual}</span>
                <span className="text-muted-foreground">/ {data.salesGoal} vendas</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Meta de Leads</span>
                <span className={cn("status-badge", Number(leadsPercent) >= 100 ? "status-success" : "status-warning")}>
                  {leadsPercent}%
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{data.leadsActual}</span>
                <span className="text-muted-foreground">/ {data.leadsGoal} leads</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">CAC Realizado</span>
                <span className={cn("status-badge", data.cacActual <= data.cacMax ? "status-success" : "status-warning")}>
                  {data.cacActual <= data.cacMax ? `${cacImprovement}% melhor` : `${Math.abs(Number(cacImprovement))}% acima`}
                </span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">R$ {data.cacActual}</span>
                <span className="text-muted-foreground">/ R$ {data.cacMax} max</span>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">ROI</span>
                <span className="status-badge status-success">+{((data.roi - 1) * 100).toFixed(0)}%</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold">{data.roi}x</span>
                <span className="text-muted-foreground">retorno</span>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Trend Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Evolução Mensal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.performanceData}>
                  <defs>
                    <linearGradient id="colorAlcance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0E4963" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0E4963" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngajamento" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ff0b45" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#ff0b45" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Area type="monotone" dataKey="alcance" stroke="#0E4963" fillOpacity={1} fill="url(#colorAlcance)" />
                  <Area type="monotone" dataKey="engajamento" stroke="#ff0b45" fillOpacity={1} fill="url(#colorEngajamento)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Funnel Distribution */}
          <div className="glass-card p-6">
            <h3 className="text-lg font-semibold mb-4">Distribuição por Funil</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.funnelData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {data.funnelData.map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {data.funnelData.map((item: any) => (
                <div key={item.name} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Content Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard
            title="Alcance Total"
            value={data.contentMetrics.alcance}
            change={18}
            changeLabel="vs anterior"
            icon={Eye}
            variant="primary"
          />
          <MetricCard
            title="Engajamento"
            value={data.contentMetrics.engajamento}
            change={24}
            changeLabel="interações"
            icon={Heart}
            variant="accent"
          />
          <MetricCard
            title="Comentários"
            value={data.contentMetrics.comentarios}
            change={12}
            changeLabel="vs meta"
            icon={MessageCircle}
            variant="warning"
          />
          <MetricCard
            title="Cliques"
            value={data.contentMetrics.cliques}
            change={31}
            changeLabel="no link"
            icon={MousePointer}
            variant="primary"
          />
        </div>

        {/* Top Posts */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Melhores Posts do Mês</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data.topPosts.map((post: any, index: number) => (
              <div 
                key={post.id}
                className={cn(
                  "p-4 rounded-lg border-l-4 bg-muted/30",
                  post.funnel === "topo" && "border-l-secondary",
                  post.funnel === "meio" && "border-l-warning",
                  post.funnel === "fundo" && "border-l-primary"
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                  <span className="status-badge status-success">{post.performance}%</span>
                </div>
                <p className="font-medium text-sm line-clamp-2 mb-2">{post.title}</p>
                <p className="text-sm text-muted-foreground">{post.metric}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
