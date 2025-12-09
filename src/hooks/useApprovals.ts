import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Client = Database["public"]["Tables"]["clients"]["Row"];
type Post = Database["public"]["Tables"]["posts"]["Row"];

export interface ScheduleSubmission {
  id: string;
  clientId: string;
  clientName: string;
  month: string;
  postsCount: number;
  submittedAt: string;
  submittedBy: string;
  submittedByName: string;
  status: "pending" | "approved" | "rejected";
  matrixBalanced: boolean;
  objectiveDefined: boolean;
  feedback?: string;
  topoCount: number;
  meioCount: number;
  fundoCount: number;
}

// Get pending schedules for approval (gestors only)
export function useScheduleApprovals() {
  const queryClient = useQueryClient();

  const { data: approvals, isLoading, error } = useQuery({
    queryKey: ["schedule-approvals"],
    queryFn: async () => {
      // Fetch all clients
      const { data: clients, error: clientsError } = await supabase
        .from("clients")
        .select("*")
        .eq("status", "active");

      if (clientsError) throw clientsError;

      // Fetch all posts with status aguardando_aprovacao or aprovado or rejected
      const { data: posts, error: postsError } = await supabase
        .from("posts")
        .select("*, profiles:submitted_by(full_name)")
        .in("status", ["aguardando_aprovacao", "aprovado", "reprovado"]);

      if (postsError) throw postsError;

      // Fetch profiles for submitted_by
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      const profileMap = new Map(profiles?.map(p => [p.user_id, p.full_name]) || []);

      // Group posts by client and month
      const submissionMap = new Map<string, ScheduleSubmission>();

      for (const post of posts || []) {
        const client = clients?.find(c => c.id === post.client_id);
        if (!client) continue;

        const postDate = new Date(post.scheduled_date);
        const monthKey = `${client.id}-${postDate.getFullYear()}-${postDate.getMonth()}`;
        const monthLabel = postDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });

        if (!submissionMap.has(monthKey)) {
          submissionMap.set(monthKey, {
            id: monthKey,
            clientId: client.id,
            clientName: client.name,
            month: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
            postsCount: 0,
            submittedAt: post.submitted_at || post.updated_at,
            submittedBy: post.submitted_by || "",
            submittedByName: profileMap.get(post.submitted_by || "") || "Usuário",
            status: "pending",
            matrixBalanced: false,
            objectiveDefined: !!client.monthly_objective,
            feedback: post.review_feedback || undefined,
            topoCount: 0,
            meioCount: 0,
            fundoCount: 0,
          });
        }

        const submission = submissionMap.get(monthKey)!;
        submission.postsCount++;

        // Count funnel stages
        const funnelStage = post.funnel_stage?.toLowerCase();
        if (funnelStage === "topo" || funnelStage === "awareness") {
          submission.topoCount++;
        } else if (funnelStage === "meio" || funnelStage === "consideration") {
          submission.meioCount++;
        } else if (funnelStage === "fundo" || funnelStage === "conversion" || funnelStage === "retencao") {
          submission.fundoCount++;
        }

        // Update status based on posts
        if (post.status === "reprovado") {
          submission.status = "rejected";
          submission.feedback = post.review_feedback || undefined;
        } else if (post.status === "aprovado" && submission.status !== "rejected") {
          submission.status = "approved";
        }
      }

      // Calculate matrix balance for each submission
      for (const submission of submissionMap.values()) {
        const total = submission.topoCount + submission.meioCount + submission.fundoCount;
        if (total > 0) {
          const topoPercent = (submission.topoCount / total) * 100;
          const meioPercent = (submission.meioCount / total) * 100;
          const fundoPercent = (submission.fundoCount / total) * 100;
          submission.matrixBalanced = 
            Math.abs(topoPercent - 40) <= 15 && 
            Math.abs(meioPercent - 30) <= 15 && 
            Math.abs(fundoPercent - 30) <= 15;
        }
      }

      // Sort by submitted date
      const result = Array.from(submissionMap.values()).sort((a, b) => {
        return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
      });

      return result;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("approvals-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["schedule-approvals"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { approvals, isLoading, error };
}

// Approve a schedule
export function useApproveSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, month }: { clientId: string; month: string }) => {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) throw new Error("Not authenticated");

      // Update all posts for this client with status aguardando_aprovacao
      const { error } = await supabase
        .from("posts")
        .update({ 
          status: "aprovado",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          production_status: "em_criacao",
        })
        .eq("client_id", clientId)
        .eq("status", "aguardando_aprovacao");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Cronograma aprovado com sucesso!");
    },
    onError: (error) => {
      console.error("Error approving schedule:", error);
      toast.error("Erro ao aprovar cronograma.");
    },
  });
}

// Reject a schedule
export function useRejectSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, feedback }: { clientId: string; feedback: string }) => {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) throw new Error("Not authenticated");

      // Update all posts for this client with status aguardando_aprovacao
      const { error } = await supabase
        .from("posts")
        .update({ 
          status: "reprovado",
          reviewed_at: new Date().toISOString(),
          reviewed_by: user.id,
          review_feedback: feedback,
        })
        .eq("client_id", clientId)
        .eq("status", "aguardando_aprovacao");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.error("Cronograma reprovado.");
    },
    onError: (error) => {
      console.error("Error rejecting schedule:", error);
      toast.error("Erro ao reprovar cronograma.");
    },
  });
}

// Submit schedule for approval
export function useSubmitSchedule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) throw new Error("Not authenticated");

      // Update all posts for this client with status rascunho or briefing_ok
      const { error } = await supabase
        .from("posts")
        .update({ 
          status: "aguardando_aprovacao",
          submitted_at: new Date().toISOString(),
          submitted_by: user.id,
        })
        .eq("client_id", clientId)
        .in("status", ["rascunho", "briefing_ok"]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-approvals"] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Cronograma submetido para aprovação!");
    },
    onError: (error) => {
      console.error("Error submitting schedule:", error);
      toast.error("Erro ao submeter cronograma.");
    },
  });
}
