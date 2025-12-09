import { useState } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  Eye,
  MessageSquare,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  useScheduleApprovals, 
  useApproveSchedule, 
  useRejectSchedule,
  type ScheduleSubmission 
} from "@/hooks/useApprovals";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const statusConfig = {
  pending: { label: "Pendente", icon: Clock, class: "bg-warning/20 text-warning border-warning/30" },
  approved: { label: "Aprovado", icon: CheckCircle, class: "bg-success/20 text-success border-success/30" },
  rejected: { label: "Reprovado", icon: XCircle, class: "bg-destructive/20 text-destructive border-destructive/30" },
};

export default function Approvals() {
  const { approvals, isLoading, error } = useScheduleApprovals();
  const approveSchedule = useApproveSchedule();
  const rejectSchedule = useRejectSchedule();

  const [activeTab, setActiveTab] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedApproval, setSelectedApproval] = useState<ScheduleSubmission | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [rejectFeedback, setRejectFeedback] = useState("");

  const filteredApprovals = (approvals || []).filter(a => a.status === activeTab);
  const pendingCount = (approvals || []).filter(a => a.status === "pending").length;
  const approvedCount = (approvals || []).filter(a => a.status === "approved").length;
  const rejectedCount = (approvals || []).filter(a => a.status === "rejected").length;

  const handleApprove = async (item: ScheduleSubmission) => {
    await approveSchedule.mutateAsync({ clientId: item.clientId, month: item.month });
  };

  const handleReject = async () => {
    if (!selectedApproval) return;
    if (!rejectFeedback.trim()) {
      return;
    }
    await rejectSchedule.mutateAsync({ clientId: selectedApproval.clientId, feedback: rejectFeedback });
    setIsRejectModalOpen(false);
    setRejectFeedback("");
    setSelectedApproval(null);
  };

  const handleOpenReject = (item: ScheduleSubmission) => {
    setSelectedApproval(item);
    setIsRejectModalOpen(true);
  };

  const handleOpenReview = (item: ScheduleSubmission) => {
    setSelectedApproval(item);
    setIsReviewModalOpen(true);
  };

  const handleOpenFeedback = (item: ScheduleSubmission) => {
    setSelectedApproval(item);
    setIsFeedbackModalOpen(true);
  };

  const handleOpenDetails = (item: ScheduleSubmission) => {
    setSelectedApproval(item);
    setIsDetailsModalOpen(true);
  };

  const formatSubmittedAt = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: ptBR });
    } catch {
      return date;
    }
  };

  if (error) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
          <p className="text-destructive">Erro ao carregar aprovações</p>
          <p className="text-sm text-muted-foreground">{error.message}</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold text-foreground">Aprovações</h1>
              {pendingCount > 0 && (
                <Badge className="bg-primary text-primary-foreground">
                  {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground mt-1">
              Revise e aprove os cronogramas submetidos pela equipe
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-border pb-4">
          <Button 
            variant="ghost" 
            className={cn(
              "gap-2 rounded-none",
              activeTab === "pending" && "text-primary border-b-2 border-primary"
            )}
            onClick={() => setActiveTab("pending")}
          >
            <Clock className="w-4 h-4" />
            Pendentes ({pendingCount})
          </Button>
          <Button 
            variant="ghost" 
            className={cn(
              "gap-2 rounded-none",
              activeTab === "approved" && "text-primary border-b-2 border-primary"
            )}
            onClick={() => setActiveTab("approved")}
          >
            <CheckCircle className="w-4 h-4" />
            Aprovados ({approvedCount})
          </Button>
          <Button 
            variant="ghost" 
            className={cn(
              "gap-2 rounded-none",
              activeTab === "rejected" && "text-primary border-b-2 border-primary"
            )}
            onClick={() => setActiveTab("rejected")}
          >
            <XCircle className="w-4 h-4" />
            Reprovados ({rejectedCount})
          </Button>
        </div>

        {/* Approval Cards */}
        <div className="space-y-4">
          {isLoading ? (
            [1, 2, 3].map((i) => (
              <div key={i} className="glass-card p-6">
                <div className="flex items-start gap-4">
                  <Skeleton className="w-12 h-12 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
              </div>
            ))
          ) : filteredApprovals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">
                Nenhum cronograma {activeTab === "pending" ? "pendente" : activeTab === "approved" ? "aprovado" : "reprovado"}
              </p>
              {activeTab === "pending" && approvals?.length === 0 && (
                <p className="text-sm mt-2">
                  Os cronogramas aparecerão aqui quando forem submetidos para aprovação
                </p>
              )}
            </div>
          ) : (
            filteredApprovals.map((item, index) => {
              const status = statusConfig[item.status];
              const StatusIcon = status.icon;
              const isPending = approveSchedule.isPending || rejectSchedule.isPending;

              return (
                <div
                  key={item.id}
                  className="glass-card p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 border border-border/50 flex items-center justify-center">
                        <span className="text-lg font-bold text-primary">
                          {item.clientName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold text-lg">{item.clientName}</h3>
                          <Badge className={cn("border", status.class)}>
                            <StatusIcon className="w-3 h-3 mr-1" />
                            {status.label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {item.month}
                          </span>
                          <span>{item.postsCount} posts</span>
                          <span>por {item.submittedByName}</span>
                          <span>{formatSubmittedAt(item.submittedAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Validation indicators */}
                      <div className="flex items-center gap-2 mr-4">
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-xs",
                          item.matrixBalanced 
                            ? "bg-success/20 text-success" 
                            : "bg-warning/20 text-warning"
                        )}>
                          {item.matrixBalanced ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          Matriz
                        </div>
                        <div className={cn(
                          "flex items-center gap-1 px-2 py-1 rounded text-xs",
                          item.objectiveDefined 
                            ? "bg-success/20 text-success" 
                            : "bg-warning/20 text-warning"
                        )}>
                          {item.objectiveDefined ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertTriangle className="w-3 h-3" />
                          )}
                          Objetivo
                        </div>
                      </div>

                      {item.status === "pending" && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2" 
                            onClick={() => handleOpenReview(item)}
                            disabled={isPending}
                          >
                            <Eye className="w-4 h-4" />
                            Revisar
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="gap-2 text-destructive hover:text-destructive" 
                            onClick={() => handleOpenReject(item)}
                            disabled={isPending}
                          >
                            <XCircle className="w-4 h-4" />
                            Reprovar
                          </Button>
                          <Button 
                            size="sm" 
                            className="gap-2" 
                            onClick={() => handleApprove(item)}
                            disabled={isPending}
                          >
                            {isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                            Aprovar
                          </Button>
                        </>
                      )}

                      {item.status === "approved" && (
                        <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenDetails(item)}>
                          <Eye className="w-4 h-4" />
                          Ver Detalhes
                        </Button>
                      )}

                      {item.status === "rejected" && (
                        <>
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenFeedback(item)}>
                            <MessageSquare className="w-4 h-4" />
                            Ver Feedback
                          </Button>
                          <Button variant="outline" size="sm" className="gap-2" onClick={() => handleOpenDetails(item)}>
                            <Eye className="w-4 h-4" />
                            Ver Detalhes
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Review Modal */}
      <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Revisar Cronograma - {selectedApproval?.clientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Mês</p>
                <p className="font-medium">{selectedApproval?.month}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Total de Posts</p>
                <p className="font-medium">{selectedApproval?.postsCount} posts</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Submetido por</p>
                <p className="font-medium">{selectedApproval?.submittedByName}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Data de Submissão</p>
                <p className="font-medium">{selectedApproval && formatSubmittedAt(selectedApproval.submittedAt)}</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-medium mb-3">Distribuição do Funil</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-secondary">{selectedApproval?.topoCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Topo (40%)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{selectedApproval?.meioCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Meio (30%)</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{selectedApproval?.fundoCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Fundo (30%)</p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-medium mb-3">Checklist de Validação</h4>
              <div className="space-y-2">
                <div className={cn("flex items-center gap-2 text-sm", selectedApproval?.matrixBalanced ? "text-success" : "text-warning")}>
                  {selectedApproval?.matrixBalanced ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  Matriz 40-30-30 {selectedApproval?.matrixBalanced ? "balanceada" : "desbalanceada"}
                </div>
                <div className={cn("flex items-center gap-2 text-sm", selectedApproval?.objectiveDefined ? "text-success" : "text-warning")}>
                  {selectedApproval?.objectiveDefined ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  Objetivos do mês {selectedApproval?.objectiveDefined ? "definidos" : "não definidos"}
                </div>
                <div className={cn("flex items-center gap-2 text-sm", (selectedApproval?.postsCount || 0) >= 15 ? "text-success" : "text-warning")}>
                  {(selectedApproval?.postsCount || 0) >= 15 ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  Mínimo de 15 posts {(selectedApproval?.postsCount || 0) >= 15 ? "atingido" : "não atingido"}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsReviewModalOpen(false)}>
                Fechar
              </Button>
              <Button 
                variant="outline" 
                className="text-destructive" 
                onClick={() => {
                  setIsReviewModalOpen(false);
                  if (selectedApproval) handleOpenReject(selectedApproval);
                }}
              >
                Reprovar
              </Button>
              <Button onClick={() => {
                if (selectedApproval) handleApprove(selectedApproval);
                setIsReviewModalOpen(false);
              }}>
                Aprovar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject Modal */}
      <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Reprovar Cronograma - {selectedApproval?.clientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Motivo da Reprovação *</Label>
              <Textarea
                placeholder="Descreva o motivo da reprovação e sugestões de melhoria..."
                className="input-modern min-h-[120px]"
                value={rejectFeedback}
                onChange={(e) => setRejectFeedback(e.target.value)}
              />
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsRejectModalOpen(false)}>
                Cancelar
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleReject}
                disabled={!rejectFeedback.trim() || rejectSchedule.isPending}
              >
                {rejectSchedule.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Confirmar Reprovação
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Feedback Modal */}
      <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Feedback - {selectedApproval?.clientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30">
              <p className="text-sm">{selectedApproval?.feedback || "Nenhum feedback disponível."}</p>
            </div>
            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsFeedbackModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Details Modal */}
      <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
        <DialogContent className="bg-card border-border max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes - {selectedApproval?.clientName}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Mês</p>
                <p className="font-medium">{selectedApproval?.month}</p>
              </div>
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <p className="text-sm text-muted-foreground">Total de Posts</p>
                <p className="font-medium">{selectedApproval?.postsCount} posts</p>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-muted/30 border border-border">
              <h4 className="font-medium mb-3">Distribuição do Funil</h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-secondary">{selectedApproval?.topoCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Topo</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-warning">{selectedApproval?.meioCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Meio</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-primary">{selectedApproval?.fundoCount || 0}</p>
                  <p className="text-xs text-muted-foreground">Fundo</p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="ghost" onClick={() => setIsDetailsModalOpen(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
