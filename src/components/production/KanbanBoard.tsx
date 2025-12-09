import { cn } from "@/lib/utils";
import { Calendar, User, MoreVertical, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";

interface KanbanCard {
  id: string;
  title: string;
  client: string;
  date: string;
  funnel: "topo" | "meio" | "fundo";
  assignee: string;
  priority: "low" | "medium" | "high";
}

interface KanbanColumn {
  id: string;
  title: string;
  cards: KanbanCard[];
  color: string;
}

interface KanbanBoardProps {
  columns: KanbanColumn[];
}

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

export function KanbanBoard({ columns }: KanbanBoardProps) {
  return (
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-thin">
      {columns.map((column) => (
        <div
          key={column.id}
          className="flex-shrink-0 w-80 glass-card p-4 animate-slide-up"
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
                {column.cards.length}
              </span>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>

          {/* Cards */}
          <div className="space-y-3">
            {column.cards.map((card) => (
              <div
                key={card.id}
                className={cn(
                  "bg-muted/50 rounded-lg p-3 border-l-4 cursor-grab hover:bg-muted/70 transition-all group",
                  funnelBorders[card.funnel]
                )}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-medium text-sm text-foreground line-clamp-2">
                      {card.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {card.client}
                    </p>
                  </div>
                  <GripVertical className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{card.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        priorityColors[card.priority]
                      )}
                    >
                      {card.priority === "high" ? "Alta" : card.priority === "medium" ? "Média" : "Baixa"}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-xs font-medium text-primary-foreground">
                      {card.assignee.charAt(0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {column.cards.length === 0 && (
              <div className="text-center py-8 text-muted-foreground text-sm">
                Nenhum item
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
