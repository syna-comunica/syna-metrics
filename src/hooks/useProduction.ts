import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];

export type ProductionStatus = "backlog" | "briefing_aprovado" | "em_criacao" | "revisao_interna" | "aprovacao_cliente" | "agendado" | "publicado";

export interface ProductionPost extends Post {
  clientName: string;
  assigneeName?: string;
}

// Map production_status to column IDs
export const productionStatusMap: Record<string, string> = {
  "backlog": "briefing",
  "briefing_aprovado": "briefing",
  "em_criacao": "creation",
  "em_producao": "creation",
  "revisao_interna": "review",
  "em_revisao": "review",
  "aprovacao_cliente": "client_approval",
  "aguardando_aprovacao": "client_approval",
  "agendado": "scheduled",
  "aprovado": "scheduled",
  "publicado": "published",
  "concluido": "published",
};

// Reverse map - column ID to production_status
export const columnToStatusMap: Record<string, string> = {
  "briefing": "briefing_aprovado",
  "creation": "em_criacao",
  "review": "revisao_interna",
  "client_approval": "aprovacao_cliente",
  "scheduled": "agendado",
  "published": "publicado",
};

export function useProductionPosts(clientId?: string) {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["production-posts", clientId],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*, clients(name)")
        .not("status", "eq", "rascunho") // Only show posts that are past draft stage
        .order("scheduled_date", { ascending: true });

      if (clientId && clientId !== "all") {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Transform data with client names
      const transformedPosts: ProductionPost[] = (data || []).map((post: any) => ({
        ...post,
        clientName: post.clients?.name || "Cliente",
      }));

      return transformedPosts;
    },
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("production-posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["production-posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { posts, isLoading, error };
}

export function useUpdateProductionStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ postId, productionStatus }: { postId: string; productionStatus: string }) => {
      const { data, error } = await supabase
        .from("posts")
        .update({ production_status: productionStatus })
        .eq("id", postId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["production-posts"] });
    },
    onError: (error) => {
      console.error("Error updating production status:", error);
      toast.error("Erro ao atualizar status de produção.");
    },
  });
}

// Fetch team members (profiles)
export function useTeamMembers() {
  return useQuery({
    queryKey: ["team-members"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, full_name");

      if (error) throw error;
      return data || [];
    },
  });
}
