import { cn } from "@/lib/utils";
import { Calendar, TrendingUp, MoreVertical, ExternalLink, Eye, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

interface ClientCardProps {
  id: string;
  name: string;
  logo?: string;
  segment: string;
  scheduleStatus: "pending" | "approved" | "in_production" | "published";
  goalProgress: number;
  postsCompleted: number;
  postsTotal: number;
  lastUpdate: string;
  onDelete?: () => void;
}

const statusConfig = {
  pending: { label: "Pendente", class: "status-warning" },
  approved: { label: "Aprovado", class: "status-success" },
  in_production: { label: "Em Produção", class: "funnel-topo" },
  published: { label: "Publicado", class: "status-success" },
};

export function ClientCard({
  id,
  name,
  logo,
  segment,
  scheduleStatus,
  goalProgress,
  postsCompleted,
  postsTotal,
  lastUpdate,
  onDelete,
}: ClientCardProps) {
  const navigate = useNavigate();
  const status = statusConfig[scheduleStatus];

  const handleViewClient = () => {
    navigate(`/schedule?client=${id}`);
    toast.info(`Abrindo cronograma de ${name}`);
  };

  const handleEditClient = () => {
    toast.info(`Editando cliente ${name}`);
  };

  const handleDeleteClient = () => {
    if (onDelete) {
      onDelete();
    } else {
      toast.error(`Cliente ${name} removido`);
    }
  };

  return (
    <div className="glass-card p-5 hover:border-primary/30 transition-all duration-300 group animate-slide-up">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center overflow-hidden">
            {logo ? (
              <img src={logo} alt={name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-lg font-bold text-primary">
                {name.charAt(0)}
              </span>
            )}
          </div>
          <div>
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">{segment}</p>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-card border-border">
            <DropdownMenuItem onClick={handleViewClient}>
              <Eye className="w-4 h-4 mr-2" />
              Ver Cronograma
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleEditClient}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Cliente
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleDeleteClient} className="text-destructive focus:text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Remover Cliente
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="space-y-4">
        {/* Schedule Status */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Cronograma</span>
          </div>
          <span className={cn("status-badge", status.class)}>
            {status.label}
          </span>
        </div>

        {/* Goal Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Meta do mês</span>
            <span className="font-medium text-foreground">{goalProgress}%</span>
          </div>
          <Progress value={goalProgress} className="h-2" />
        </div>

        {/* Posts Progress */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Posts</span>
          <span className="font-medium">
            <span className="text-primary">{postsCompleted}</span>
            <span className="text-muted-foreground">/{postsTotal}</span>
          </span>
        </div>

        {/* Last Update */}
        <div className="pt-3 border-t border-border/50 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Atualizado {lastUpdate}
          </p>
          <Button 
            variant="ghost" 
            size="sm" 
            className="gap-1.5 text-xs"
            onClick={handleViewClient}
          >
            Ver mais
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
