import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

export interface DashboardMetrics {
  totalClients: number;
  activeClients: number;
  totalPosts: number;
  approvedSchedules: number;
  pendingSchedules: number;
  averageGoalProgress: number;
  postsPublished: number;
  postsInProduction: number;
  topoCount: number;
  meioCount: number;
  fundoCount: number;
}

export interface DashboardAlert {
  id: string;
  type: "deadline" | "warning" | "success" | "info";
  title: string;
  description: string;
  time: string;
}

function formatTimeAgo(date: string): string {
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "há poucos minutos";
  if (diffHours < 24) return `há ${diffHours}h`;
  return `há ${diffDays} dia${diffDays > 1 ? "s" : ""}`;
}

export function useDashboardMetrics() {
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["dashboard-metrics"],
    queryFn: async () => {
      // Fetch clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*");

      if (clientsError) throw clientsError;

      // Fetch posts
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*");

      if (postsError) throw postsError;

      const totalClients = clients?.length || 0;
      const activeClients = clients?.filter(c => c.status === "active").length || 0;
      const totalPosts = posts?.length || 0;

      // Count posts by status
      const postsPublished = posts?.filter(p => p.status === "publicado").length || 0;
      const postsInProduction = posts?.filter(p => 
        p.production_status === "em_criacao" || 
        p.production_status === "em_producao" ||
        p.production_status === "revisao_interna"
      ).length || 0;

      // Count approved vs pending schedules (by client)
      const clientsWithApprovedPosts = new Set<string>();
      const clientsWithPendingPosts = new Set<string>();

      posts?.forEach(post => {
        if (post.status === "aprovado" || post.status === "publicado") {
          clientsWithApprovedPosts.add(post.client_id);
        }
        if (post.status === "aguardando_aprovacao" || post.status === "rascunho") {
          clientsWithPendingPosts.add(post.client_id);
        }
      });

      // Count funnel distribution
      let topoCount = 0;
      let meioCount = 0;
      let fundoCount = 0;

      posts?.forEach(post => {
        const funnel = post.funnel_stage?.toLowerCase();
        if (funnel === "topo" || funnel === "awareness") {
          topoCount++;
        } else if (funnel === "meio" || funnel === "consideration") {
          meioCount++;
        } else if (funnel === "fundo" || funnel === "conversion" || funnel === "retencao") {
          fundoCount++;
        }
      });

      // Calculate average goal progress (based on completed posts ratio)
      let totalProgress = 0;
      let clientsWithPosts = 0;

      clients?.forEach(client => {
        const clientPosts = posts?.filter(p => p.client_id === client.id) || [];
        if (clientPosts.length > 0) {
          const completed = clientPosts.filter(p => 
            p.status === "publicado" || p.production_status === "concluido"
          ).length;
          totalProgress += (completed / clientPosts.length) * 100;
          clientsWithPosts++;
        }
      });

      const averageGoalProgress = clientsWithPosts > 0 
        ? Math.round(totalProgress / clientsWithPosts) 
        : 0;

      // Generate alerts based on real data
      const alerts: DashboardAlert[] = [];

      // Check for pending approvals
      const pendingPosts = posts?.filter(p => p.status === "aguardando_aprovacao") || [];
      if (pendingPosts.length > 0) {
        const uniqueClients = new Set(pendingPosts.map(p => p.client_id));
        alerts.push({
          id: "pending-approvals",
          type: "deadline",
          title: "Cronogramas pendentes",
          description: `${uniqueClients.size} cliente${uniqueClients.size > 1 ? "s" : ""} aguardando aprovação`,
          time: formatTimeAgo(pendingPosts[0].submitted_at || pendingPosts[0].updated_at),
        });
      }

      // Check for matrix imbalance
      const total = topoCount + meioCount + fundoCount;
      if (total > 0) {
        const topoPercent = (topoCount / total) * 100;
        const meioPercent = (meioCount / total) * 100;
        const fundoPercent = (fundoCount / total) * 100;

        if (Math.abs(topoPercent - 40) > 15 || Math.abs(meioPercent - 30) > 15 || Math.abs(fundoPercent - 30) > 15) {
          alerts.push({
            id: "matrix-imbalance",
            type: "warning",
            title: "Matriz desbalanceada",
            description: `Distribuição atual: ${Math.round(topoPercent)}% topo, ${Math.round(meioPercent)}% meio, ${Math.round(fundoPercent)}% fundo`,
            time: "geral",
          });
        }
      }

      // Check for high performing clients
      clients?.forEach(client => {
        const clientPosts = posts?.filter(p => p.client_id === client.id) || [];
        if (clientPosts.length >= 15) {
          const completed = clientPosts.filter(p => 
            p.status === "publicado" || p.production_status === "concluido"
          ).length;
          const progress = (completed / clientPosts.length) * 100;
          if (progress >= 90) {
            alerts.push({
              id: `success-${client.id}`,
              type: "success",
              title: "Meta atingida!",
              description: `${client.name} atingiu ${Math.round(progress)}% da meta`,
              time: formatTimeAgo(client.updated_at),
            });
          }
        }
      });

      // Limit alerts to 5
      const limitedAlerts = alerts.slice(0, 5);

      // If no alerts, add info alert
      if (limitedAlerts.length === 0) {
        limitedAlerts.push({
          id: "no-alerts",
          type: "info",
          title: "Tudo em ordem",
          description: "Nenhum alerta no momento",
          time: "agora",
        });
      }

      const metrics: DashboardMetrics = {
        totalClients,
        activeClients,
        totalPosts,
        approvedSchedules: clientsWithApprovedPosts.size,
        pendingSchedules: clientsWithPendingPosts.size,
        averageGoalProgress,
        postsPublished,
        postsInProduction,
        topoCount,
        meioCount,
        fundoCount,
      };

      return { metrics, alerts: limitedAlerts };
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("dashboard-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "clients" },
        () => queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posts" },
        () => queryClient.invalidateQueries({ queryKey: ["dashboard-metrics"] })
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { 
    metrics: data?.metrics, 
    alerts: data?.alerts || [], 
    isLoading, 
    error 
  };
}
