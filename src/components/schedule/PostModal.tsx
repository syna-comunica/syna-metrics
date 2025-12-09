import { useState, useRef, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, Clock, Instagram, Facebook, Linkedin, Sparkles, Save, CheckCircle, Upload, X, Image, Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useCreatePost, useUpdatePost, useDeletePost, type PostWithClient } from "@/hooks/usePosts";
import { useAuth } from "@/hooks/useAuth";
import { format } from "date-fns";

interface PostModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  clientId?: string;
  clientName?: string;
  existingPost?: PostWithClient | null;
}

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram },
  { id: "facebook", name: "Facebook", icon: Facebook },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin },
];

const formats = [
  { value: "carousel", label: "Carrossel" },
  { value: "reels", label: "Reels" },
  { value: "post", label: "Post Simples" },
  { value: "video", label: "Vídeo" },
  { value: "stories", label: "Stories" },
];

const funnelStages = [
  { value: "topo", label: "AWARENESS (Topo) - Fazer conhecer", color: "bg-secondary" },
  { value: "meio", label: "CONSIDERAÇÃO (Meio) - Fazer avaliar", color: "bg-warning" },
  { value: "fundo", label: "CONVERSÃO (Fundo) - Fazer agir", color: "bg-primary" },
  { value: "retencao", label: "RETENÇÃO - Pós-venda", color: "bg-accent" },
];

const audienceStages = [
  "Não sabe que tem o problema",
  "Sabe o problema, busca solução",
  "Conhece soluções, está comparando",
  "Conhece nossa marca, está decidindo",
  "Cliente atual",
];

const desiredActions = [
  "Salvar (viralização)",
  "Compartilhar (alcance)",
  "Comentar (engajamento)",
  "Clicar no link (tráfego)",
  "Enviar DM (lead)",
  "Assistir até o fim (retenção)",
];

const triggers = [
  "Escassez",
  "Prova Social",
  "Autoridade",
  "Reciprocidade",
  "Curiosidade",
  "Urgência",
  "Consistência",
];

export function PostModal({ open, onOpenChange, clientId, clientName = "Cliente", existingPost }: PostModalProps) {
  const { user } = useAuth();
  const createPost = useCreatePost();
  const updatePost = useUpdatePost();
  const deletePost = useDeletePost();

  // Form state
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [platform, setPlatform] = useState("instagram");
  const [postType, setPostType] = useState("");
  const [funnel, setFunnel] = useState("");
  const [audienceStage, setAudienceStage] = useState("");
  const [desiredAction, setDesiredAction] = useState("");
  const [selectedTriggers, setSelectedTriggers] = useState<string[]>([]);
  const [mainMessage, setMainMessage] = useState("");
  const [cta, setCta] = useState("");
  const [metricTarget, setMetricTarget] = useState("");
  const [successMetric, setSuccessMetric] = useState("");
  const [copyText, setCopyText] = useState("");
  const [status, setStatus] = useState("rascunho");
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes or existing post changes
  useEffect(() => {
    if (open && existingPost) {
      setTitle(existingPost.title || "");
      setDate(existingPost.scheduled_date || "");
      setTime(existingPost.scheduled_time || "");
      setPlatform(existingPost.platform || "instagram");
      setPostType(existingPost.post_type || "");
      setFunnel(existingPost.funnel_stage || "");
      setAudienceStage(existingPost.target_audience_stage || "");
      setDesiredAction(existingPost.desired_action || "");
      setSelectedTriggers(existingPost.psychological_triggers || []);
      setMainMessage(existingPost.main_message || "");
      setCta(existingPost.cta || "");
      setMetricTarget(existingPost.metric_target?.toString() || "");
      setSuccessMetric(existingPost.success_metric || "");
      setCopyText(existingPost.content || "");
      setStatus(existingPost.status || "rascunho");
    } else if (open) {
      // Reset for new post
      setTitle("");
      setDate(format(new Date(), "yyyy-MM-dd"));
      setTime("10:00");
      setPlatform("instagram");
      setPostType("");
      setFunnel("");
      setAudienceStage("");
      setDesiredAction("");
      setSelectedTriggers([]);
      setMainMessage("");
      setCta("");
      setMetricTarget("");
      setSuccessMetric("");
      setCopyText("");
      setStatus("rascunho");
      setUploadedFiles([]);
    }
  }, [open, existingPost]);

  const toggleTrigger = (trigger: string) => {
    setSelectedTriggers((prev) =>
      prev.includes(trigger)
        ? prev.filter((t) => t !== trigger)
        : [...prev, trigger]
    );
  };

  const handleGenerateWithAI = async () => {
    setIsGeneratingAI(true);
    toast.info("Gerando sugestão com IA...");
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const suggestions = [
      "🚀 Você sabia que 70% das empresas que investem em marketing digital crescem 2x mais rápido?\n\nNeste post, vamos mostrar 5 estratégias que estão transformando negócios em 2024:\n\n1️⃣ Conteúdo de valor\n2️⃣ Consistência nas redes\n3️⃣ Engajamento autêntico\n4️⃣ Análise de métricas\n5️⃣ Testes A/B\n\nSalve este post para consultar depois! 💾\n\n#MarketingDigital #Crescimento #Estratégia",
      "💡 O segredo que as grandes marcas não contam sobre engajamento...\n\nNão é sobre postar mais, é sobre postar MELHOR.\n\nAqui estão 3 dicas práticas:\n\n✅ Conheça sua audiência profundamente\n✅ Crie conteúdo que resolve problemas reais\n✅ Seja consistente, não perfeito\n\nComente 'QUERO' e receba nosso guia completo! 📩\n\n#SocialMedia #Dicas #Marketing"
    ];
    
    setCopyText(suggestions[Math.floor(Math.random() * suggestions.length)]);
    setIsGeneratingAI(false);
    toast.success("Sugestão gerada com sucesso!");
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const newFiles = Array.from(files);
      const validFiles = newFiles.filter(file => {
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`${file.name} é muito grande. Máximo 10MB.`);
          return false;
        }
        return true;
      });
      setUploadedFiles(prev => [...prev, ...validFiles]);
      toast.success(`${validFiles.length} arquivo(s) adicionado(s)`);
    }
  };

  const handleRemoveFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleFinalize = async () => {
    if (!clientId) {
      toast.error("Nenhum cliente selecionado");
      return;
    }

    if (!title.trim()) {
      toast.error("Por favor, insira um título para o post");
      return;
    }

    if (!date) {
      toast.error("Por favor, selecione uma data");
      return;
    }

    if (!funnel) {
      toast.error("Por favor, selecione o objetivo macro (funil)");
      return;
    }

    const postData = {
      client_id: clientId,
      title: title.trim(),
      scheduled_date: date,
      scheduled_time: time || null,
      platform,
      post_type: postType || null,
      funnel_stage: funnel,
      target_audience_stage: audienceStage || null,
      desired_action: desiredAction || null,
      psychological_triggers: selectedTriggers.length > 0 ? selectedTriggers : null,
      main_message: mainMessage || null,
      cta: cta || null,
      metric_target: metricTarget ? parseFloat(metricTarget) : null,
      success_metric: successMetric || null,
      content: copyText || null,
      status,
      created_by: user?.id,
    };

    try {
      if (existingPost) {
        await updatePost.mutateAsync({ id: existingPost.id, ...postData });
      } else {
        await createPost.mutateAsync(postData);
      }
      onOpenChange(false);
    } catch (error) {
      // Error handled by mutations
    }
  };

  const handleSaveDraft = async () => {
    setStatus("rascunho");
    await handleFinalize();
  };

  const handleDelete = async () => {
    if (existingPost) {
      await deletePost.mutateAsync(existingPost.id);
      onOpenChange(false);
    }
  };

  const isPending = createPost.isPending || updatePost.isPending || deletePost.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {existingPost ? `Editar Post - ${clientName}` : `Criar Novo Post - ${clientName}`}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-muted/50">
            <TabsTrigger value="basic">Básico</TabsTrigger>
            <TabsTrigger value="briefing">Briefing</TabsTrigger>
            <TabsTrigger value="copy">Copy</TabsTrigger>
            <TabsTrigger value="review">Revisão</TabsTrigger>
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh] mt-4 pr-2 scrollbar-thin">
            <TabsContent value="basic" className="space-y-6 animate-fade-in">
              {/* Title */}
              <div className="space-y-2">
                <Label>Título do Post *</Label>
                <Input
                  placeholder="Ex: 5 dicas de produtividade"
                  className="input-modern"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    Data *
                  </Label>
                  <Input 
                    type="date" 
                    className="input-modern" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    Horário
                  </Label>
                  <Input 
                    type="time" 
                    className="input-modern" 
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                  />
                </div>
              </div>

              {/* Platforms */}
              <div className="space-y-2">
                <Label>Plataforma</Label>
                <div className="flex gap-3">
                  {platforms.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setPlatform(p.id)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-lg border transition-all",
                        platform === p.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-muted/30 text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <p.icon className="w-4 h-4" />
                      <span className="text-sm">{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label>Formato</Label>
                <Select value={postType} onValueChange={setPostType}>
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {formats.map((f) => (
                      <SelectItem key={f.value} value={f.value}>
                        {f.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="briefing" className="space-y-6 animate-fade-in">
              {/* Funnel Stage */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">1️⃣ Objetivo Macro *</Label>
                <div className="grid grid-cols-2 gap-3">
                  {funnelStages.map((stage) => (
                    <button
                      key={stage.value}
                      onClick={() => setFunnel(stage.value)}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border transition-all text-left",
                        funnel === stage.value
                          ? "border-primary bg-primary/10"
                          : "border-border bg-muted/30 hover:border-primary/50"
                      )}
                    >
                      <div className={cn("w-3 h-3 rounded-full", stage.color)} />
                      <span className="text-sm">{stage.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Audience Stage */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">2️⃣ Estágio do Público-Alvo</Label>
                <Select value={audienceStage} onValueChange={setAudienceStage}>
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Selecione o estágio" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {audienceStages.map((stage) => (
                      <SelectItem key={stage} value={stage}>
                        {stage}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Desired Action */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">3️⃣ Ação Desejada</Label>
                <Select value={desiredAction} onValueChange={setDesiredAction}>
                  <SelectTrigger className="input-modern">
                    <SelectValue placeholder="Selecione a ação" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    {desiredActions.map((action) => (
                      <SelectItem key={action} value={action}>
                        {action}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Psychological Triggers */}
              <div className="space-y-3">
                <Label className="text-base font-semibold">4️⃣ Gatilhos Psicológicos</Label>
                <div className="flex flex-wrap gap-2">
                  {triggers.map((trigger) => (
                    <button
                      key={trigger}
                      onClick={() => toggleTrigger(trigger)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-sm transition-all",
                        selectedTriggers.includes(trigger)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-muted/80"
                      )}
                    >
                      {trigger}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Concept */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">5️⃣ Conceito/Mensagem Principal</Label>
                <Textarea
                  placeholder="Ex: 5 sinais de que você está perdendo clientes no digital"
                  className="input-modern min-h-[80px]"
                  maxLength={500}
                  value={mainMessage}
                  onChange={(e) => setMainMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">{mainMessage.length}/500 caracteres</p>
              </div>

              {/* CTA */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">6️⃣ CTA (Call To Action)</Label>
                <Input
                  placeholder="Ex: Salva esse post pra não esquecer!"
                  className="input-modern"
                  value={cta}
                  onChange={(e) => setCta(e.target.value)}
                />
              </div>

              {/* Success Metric */}
              <div className="space-y-2">
                <Label className="text-base font-semibold">7️⃣ Métrica de Sucesso</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="number"
                    placeholder="Meta numérica"
                    className="input-modern"
                    value={metricTarget}
                    onChange={(e) => setMetricTarget(e.target.value)}
                  />
                  <Select value={successMetric} onValueChange={setSuccessMetric}>
                    <SelectTrigger className="input-modern">
                      <SelectValue placeholder="Tipo de métrica" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="saves">Salvamentos</SelectItem>
                      <SelectItem value="clicks">Cliques</SelectItem>
                      <SelectItem value="comments">Comentários</SelectItem>
                      <SelectItem value="views">Views</SelectItem>
                      <SelectItem value="dms">DMs</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="copy" className="space-y-6 animate-fade-in">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">📝 Legenda/Copy</Label>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="gap-2 text-accent"
                    onClick={handleGenerateWithAI}
                    disabled={isGeneratingAI}
                  >
                    <Sparkles className={cn("w-4 h-4", isGeneratingAI && "animate-spin")} />
                    {isGeneratingAI ? "Gerando..." : "Gerar com IA"}
                  </Button>
                </div>
                <Textarea
                  placeholder="Escreva a legenda do post..."
                  className="input-modern min-h-[200px]"
                  maxLength={2200}
                  value={copyText}
                  onChange={(e) => setCopyText(e.target.value)}
                />
                <p className="text-xs text-muted-foreground text-right">{copyText.length}/2200 caracteres</p>
              </div>

              <div className="space-y-2">
                <Label className="text-base font-semibold">🎨 Referências Visuais</Label>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <div 
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">
                    Arraste arquivos ou clique para fazer upload
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PNG, JPG, GIF até 10MB
                  </p>
                </div>

                {/* Uploaded files preview */}
                {uploadedFiles.length > 0 && (
                  <div className="grid grid-cols-4 gap-2 mt-4">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="relative group">
                        <div className="aspect-square rounded-lg bg-muted/50 border border-border flex items-center justify-center overflow-hidden">
                          {file.type.startsWith('image/') ? (
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={file.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Image className="w-8 h-8 text-muted-foreground" />
                          )}
                        </div>
                        <button
                          onClick={() => handleRemoveFile(index)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="review" className="space-y-6 animate-fade-in">
              <div className="p-4 rounded-lg bg-muted/30 border border-border">
                <h4 className="font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success" />
                  Checklist de Validação
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "Título definido", checked: !!title.trim() },
                    { label: "Data agendada", checked: !!date },
                    { label: "Objetivo macro (funil) selecionado", checked: !!funnel },
                    { label: "Mensagem principal definida", checked: !!mainMessage.trim() },
                    { label: "CTA claro", checked: !!cta.trim() },
                    { label: "Meta numérica definida", checked: !!metricTarget },
                  ].map((item, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Checkbox id={`check-${index}`} checked={item.checked} disabled />
                      <label htmlFor={`check-${index}`} className={cn("text-sm", !item.checked && "text-muted-foreground")}>
                        {item.label}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Status do Post</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="input-modern">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="rascunho">Rascunho</SelectItem>
                    <SelectItem value="briefing_ok">Briefing OK</SelectItem>
                    <SelectItem value="em_producao">Em Produção</SelectItem>
                    <SelectItem value="aguardando_aprovacao">Aguardando Aprovação</SelectItem>
                    <SelectItem value="aprovado">Aprovado</SelectItem>
                    <SelectItem value="agendado">Agendado</SelectItem>
                    <SelectItem value="publicado">Publicado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <div>
            {existingPost && (
              <Button 
                variant="destructive" 
                size="sm" 
                className="gap-2" 
                onClick={handleDelete}
                disabled={isPending}
              >
                <Trash2 className="w-4 h-4" />
                Excluir
              </Button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>
              Cancelar
            </Button>
            <Button variant="outline" className="gap-2" onClick={handleSaveDraft} disabled={isPending}>
              <Save className="w-4 h-4" />
              Salvar Rascunho
            </Button>
            <Button className="gap-2" onClick={handleFinalize} disabled={isPending}>
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Finalizar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
