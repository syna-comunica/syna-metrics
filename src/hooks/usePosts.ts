import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type Post = Database["public"]["Tables"]["posts"]["Row"];
type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

export type FunnelStage = "topo" | "meio" | "fundo";
export type PostStatus = "rascunho" | "briefing_ok" | "em_producao" | "aguardando_aprovacao" | "aprovado" | "agendado" | "publicado";

export interface PostWithClient extends Post {
  clients?: { name: string } | null;
}

// Map DB funnel stages to UI-friendly versions
export function mapFunnelStage(dbStage: string): FunnelStage {
  const stageMap: Record<string, FunnelStage> = {
    "topo": "topo",
    "meio": "meio",
    "fundo": "fundo",
    "awareness": "topo",
    "consideration": "meio",
    "conversion": "fundo",
    "retencao": "fundo",
  };
  return stageMap[dbStage?.toLowerCase()] || "topo";
}

// Map UI status to DB-friendly versions
export function mapPostStatus(uiStatus: string): string {
  const statusMap: Record<string, string> = {
    "planning": "rascunho",
    "approved": "aprovado",
    "production": "em_producao",
    "published": "publicado",
    "briefing_ok": "briefing_ok",
    "awaiting_approval": "aguardando_aprovacao",
    "scheduled": "agendado",
  };
  return statusMap[uiStatus] || uiStatus;
}

export function mapDbStatusToUi(dbStatus: string): "planning" | "approved" | "production" | "published" {
  const statusMap: Record<string, "planning" | "approved" | "production" | "published"> = {
    "rascunho": "planning",
    "briefing_ok": "planning",
    "em_producao": "production",
    "aguardando_aprovacao": "production",
    "aprovado": "approved",
    "agendado": "approved",
    "publicado": "published",
  };
  return statusMap[dbStatus] || "planning";
}

export function usePosts(clientId?: string) {
  const queryClient = useQueryClient();

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ["posts", clientId],
    queryFn: async () => {
      let query = supabase
        .from("posts")
        .select("*, clients(name)")
        .order("scheduled_date", { ascending: true });

      if (clientId) {
        query = query.eq("client_id", clientId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as PostWithClient[];
    },
    enabled: true,
  });

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("posts-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posts",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["posts"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { posts, isLoading, error };
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (post: PostInsert) => {
      const { data, error } = await supabase.from("posts").insert(post).select().single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post criado com sucesso!");
    },
    onError: (error) => {
      console.error("Error creating post:", error);
      toast.error("Erro ao criar post. Verifique suas permissões.");
    },
  });
}

export function useUpdatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: PostUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from("posts")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post atualizado com sucesso!");
    },
    onError: (error) => {
      console.error("Error updating post:", error);
      toast.error("Erro ao atualizar post.");
    },
  });
}

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (postId: string) => {
      const { error } = await supabase.from("posts").delete().eq("id", postId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      toast.success("Post removido com sucesso!");
    },
    onError: (error) => {
      console.error("Error deleting post:", error);
      toast.error("Erro ao remover post.");
    },
  });
}
