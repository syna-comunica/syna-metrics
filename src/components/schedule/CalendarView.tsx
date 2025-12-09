import { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { PostWithClient } from "@/hooks/usePosts";

interface TransformedPost {
  id: string;
  date: string;
  time: string;
  title: string;
  funnel: "topo" | "meio" | "fundo";
  status: "planning" | "approved" | "production" | "published";
  dbPost?: PostWithClient;
}

interface CalendarViewProps {
  posts: TransformedPost[];
  onAddPost?: (date?: Date) => void;
  onSelectPost?: (post: TransformedPost) => void;
}

const funnelColors = {
  topo: "bg-secondary/80 border-secondary",
  meio: "bg-warning/80 border-warning",
  fundo: "bg-primary/80 border-primary",
};

export function CalendarView({ posts, onAddPost, onSelectPost }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Get the starting day of the week (0 = Sunday)
  const startDay = monthStart.getDay();
  const emptyDays = Array(startDay).fill(null);

  const getPostsForDay = (date: Date) => {
    const dateStr = format(date, "yyyy-MM-dd");
    return posts.filter(post => post.date === dateStr);
  };

  return (
    <div className="glass-card p-6 animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <h2 className="text-xl font-bold capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-secondary" />
              <span className="text-muted-foreground">Topo</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-warning" />
              <span className="text-muted-foreground">Meio</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-muted-foreground">Fundo</span>
            </div>
          </div>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
          <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Empty days */}
        {emptyDays.map((_, index) => (
          <div key={`empty-${index}`} className="aspect-square" />
        ))}
        
        {/* Actual days */}
        {days.map((day) => {
          const dayPosts = getPostsForDay(day);
          const isCurrentDay = isToday(day);
          
          return (
            <div
              key={day.toISOString()}
              className={cn(
                "calendar-day min-h-[100px] flex flex-col group",
                isCurrentDay && "calendar-day-today",
                !isSameMonth(day, currentMonth) && "opacity-50"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className={cn(
                  "text-sm font-medium",
                  isCurrentDay && "text-primary"
                )}>
                  {format(day, "d")}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onAddPost?.(day)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </div>
              
              <div className="flex-1 space-y-1 overflow-hidden">
                {dayPosts.slice(0, 3).map((post) => (
                  <div
                    key={post.id}
                    onClick={() => onSelectPost?.(post)}
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded border-l-2 truncate cursor-pointer hover:opacity-80 transition-opacity",
                      funnelColors[post.funnel],
                      "text-foreground"
                    )}
                  >
                    {post.time} - {post.title}
                  </div>
                ))}
                {dayPosts.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{dayPosts.length - 3} mais
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
