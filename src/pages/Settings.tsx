import { useState, useRef } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  User, 
  Users, 
  Bell, 
  Shield, 
  Palette,
  Save,
  Plus,
  MoreVertical,
  Mail,
  Trash2,
  Upload,
  Edit,
  UserX
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

const initialTeamMembers: TeamMember[] = [
  { id: "1", name: "Ana Silva", email: "ana@syna.com", role: "Gestor", avatar: "A" },
  { id: "2", name: "Carlos Mendes", email: "carlos@syna.com", role: "Criador de Conteúdo", avatar: "C" },
  { id: "3", name: "Marina Costa", email: "marina@syna.com", role: "Designer", avatar: "M" },
  { id: "4", name: "João Santos", email: "joao@syna.com", role: "Produtor", avatar: "J" },
];

export default function Settings() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>(initialTeamMembers);
  const [profileData, setProfileData] = useState({
    name: "Gestor Admin",
    email: "gestor@syna.com",
    role: "Gestor de Contas",
    phone: "(11) 99999-9999",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteData, setInviteData] = useState({ email: "", role: "Criador de Conteúdo" });
  const [notifications, setNotifications] = useState({
    email: false,
    push: true,
    deadline: true,
    approvals: true,
    weekly: false,
  });

  const handleSaveProfile = () => {
    toast.success("Alterações salvas com sucesso!");
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        toast.error("A imagem deve ter no máximo 2MB");
        return;
      }
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
      toast.success("Foto atualizada com sucesso!");
    }
  };

  const handleInviteMember = () => {
    if (!inviteData.email.trim()) {
      toast.error("Por favor, insira o email do membro");
      return;
    }
    if (!inviteData.email.includes("@")) {
      toast.error("Por favor, insira um email válido");
      return;
    }
    
    const newMember: TeamMember = {
      id: String(teamMembers.length + 1),
      name: inviteData.email.split("@")[0],
      email: inviteData.email,
      role: inviteData.role,
      avatar: inviteData.email.charAt(0).toUpperCase(),
    };
    
    setTeamMembers(prev => [...prev, newMember]);
    toast.success(`Convite enviado para ${inviteData.email}`);
    setIsInviteModalOpen(false);
    setInviteData({ email: "", role: "Criador de Conteúdo" });
  };

  const handleEditMember = (member: TeamMember) => {
    toast.info(`Editando ${member.name}...`);
  };

  const handleRemoveMember = (member: TeamMember) => {
    setTeamMembers(prev => prev.filter(m => m.id !== member.id));
    toast.success(`${member.name} removido da equipe`);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie sua conta e preferências
          </p>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="profile" className="gap-2">
              <User className="w-4 h-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="w-4 h-4" />
              Equipe
            </TabsTrigger>
            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="w-4 h-4" />
              Notificações
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <Shield className="w-4 h-4" />
              Segurança
            </TabsTrigger>
            <TabsTrigger value="appearance" className="gap-2">
              <Palette className="w-4 h-4" />
              Aparência
            </TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-4">Informações Pessoais</h2>
              
              <div className="flex items-start gap-6 mb-6">
                <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-2xl font-bold text-primary-foreground overflow-hidden">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    "G"
                  )}
                </div>
                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" />
                    Alterar foto
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, PNG ou GIF. Máximo 2MB.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nome completo</Label>
                  <Input 
                    value={profileData.name} 
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="input-modern" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    value={profileData.email} 
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="input-modern" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Cargo</Label>
                  <Input 
                    value={profileData.role} 
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="input-modern" 
                  />
                </div>
                <div className="space-y-2">
                  <Label>Telefone</Label>
                  <Input 
                    value={profileData.phone} 
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="input-modern" 
                  />
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <Button className="gap-2" onClick={handleSaveProfile}>
                  <Save className="w-4 h-4" />
                  Salvar Alterações
                </Button>
              </div>
            </div>
          </TabsContent>

          {/* Team Tab */}
          <TabsContent value="team" className="space-y-6">
            <div className="glass-card p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">Membros da Equipe</h2>
                <Button className="gap-2" onClick={() => setIsInviteModalOpen(true)}>
                  <Plus className="w-4 h-4" />
                  Convidar Membro
                </Button>
              </div>

              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-4 rounded-lg bg-muted/30 border border-border/50 hover:border-primary/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-sm font-bold text-primary-foreground">
                        {member.avatar}
                      </div>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="status-badge bg-secondary/20 text-secondary border border-secondary/30">
                        {member.role}
                      </span>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-card border-border">
                          <DropdownMenuItem onClick={() => handleEditMember(member)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => handleRemoveMember(member)}
                            className="text-destructive focus:text-destructive"
                          >
                            <UserX className="w-4 h-4 mr-2" />
                            Remover
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="space-y-6">
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-6">Preferências de Notificação</h2>

              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações por email</p>
                    <p className="text-sm text-muted-foreground">Receba updates importantes por email</p>
                  </div>
                  <Switch 
                    checked={notifications.email}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, email: checked });
                      toast.success(checked ? "Notificações por email ativadas" : "Notificações por email desativadas");
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Notificações push</p>
                    <p className="text-sm text-muted-foreground">Alertas em tempo real no navegador</p>
                  </div>
                  <Switch 
                    checked={notifications.push}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, push: checked });
                      toast.success(checked ? "Notificações push ativadas" : "Notificações push desativadas");
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Alertas de prazo</p>
                    <p className="text-sm text-muted-foreground">Lembrete 3 dias antes de vencimentos</p>
                  </div>
                  <Switch 
                    checked={notifications.deadline}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, deadline: checked });
                      toast.success(checked ? "Alertas de prazo ativados" : "Alertas de prazo desativados");
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Novas aprovações</p>
                    <p className="text-sm text-muted-foreground">Quando cronogramas são submetidos</p>
                  </div>
                  <Switch 
                    checked={notifications.approvals}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, approvals: checked });
                      toast.success(checked ? "Alertas de aprovação ativados" : "Alertas de aprovação desativados");
                    }}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Relatórios semanais</p>
                    <p className="text-sm text-muted-foreground">Resumo de performance toda segunda</p>
                  </div>
                  <Switch 
                    checked={notifications.weekly}
                    onCheckedChange={(checked) => {
                      setNotifications({ ...notifications, weekly: checked });
                      toast.success(checked ? "Relatórios semanais ativados" : "Relatórios semanais desativados");
                    }}
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-6">Segurança da Conta</h2>

              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Alterar Senha</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Senha atual</Label>
                      <Input type="password" className="input-modern" />
                    </div>
                    <div className="space-y-2">
                      <Label>Nova senha</Label>
                      <Input type="password" className="input-modern" />
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => toast.success("Senha atualizada com sucesso!")}>
                    Atualizar Senha
                  </Button>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Autenticação de dois fatores</p>
                      <p className="text-sm text-muted-foreground">Adicione uma camada extra de segurança</p>
                    </div>
                    <Switch onCheckedChange={(checked) => toast.info(checked ? "2FA será ativado" : "2FA desativado")} />
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <h3 className="font-medium text-destructive mb-2">Zona de Perigo</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Ações irreversíveis que afetam sua conta
                  </p>
                  <Button 
                    variant="outline" 
                    className="text-destructive hover:text-destructive gap-2"
                    onClick={() => toast.error("Esta ação requer confirmação adicional")}
                  >
                    <Trash2 className="w-4 h-4" />
                    Excluir Conta
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="space-y-6">
            <div className="glass-card p-6 animate-fade-in">
              <h2 className="text-lg font-semibold mb-6">Aparência</h2>

              <div className="space-y-6">
                <div>
                  <p className="font-medium mb-3">Tema</p>
                  <div className="flex gap-4">
                    <button 
                      className="p-4 rounded-lg border-2 border-primary bg-card flex flex-col items-center gap-2 min-w-[100px]"
                      onClick={() => toast.info("Tema escuro já está ativo")}
                    >
                      <div className="w-12 h-8 rounded bg-background border border-border" />
                      <span className="text-sm">Escuro</span>
                    </button>
                    <button 
                      className="p-4 rounded-lg border border-border bg-card flex flex-col items-center gap-2 min-w-[100px] opacity-50"
                      onClick={() => toast.info("Tema claro em breve!")}
                    >
                      <div className="w-12 h-8 rounded bg-white border border-border" />
                      <span className="text-sm">Claro</span>
                    </button>
                    <button 
                      className="p-4 rounded-lg border border-border bg-card flex flex-col items-center gap-2 min-w-[100px] opacity-50"
                      onClick={() => toast.info("Tema sistema em breve!")}
                    >
                      <div className="w-12 h-8 rounded bg-gradient-to-r from-background to-white border border-border" />
                      <span className="text-sm">Sistema</span>
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Animações</p>
                      <p className="text-sm text-muted-foreground">Efeitos de transição na interface</p>
                    </div>
                    <Switch defaultChecked onCheckedChange={(checked) => toast.success(checked ? "Animações ativadas" : "Animações desativadas")} />
                  </div>
                </div>

                <div className="pt-6 border-t border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Modo compacto</p>
                      <p className="text-sm text-muted-foreground">Reduz espaçamentos para mais conteúdo</p>
                    </div>
                    <Switch onCheckedChange={(checked) => toast.success(checked ? "Modo compacto ativado" : "Modo compacto desativado")} />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent className="bg-card border-border">
          <DialogHeader>
            <DialogTitle>Convidar Membro</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="membro@exemplo.com"
                className="input-modern"
                value={inviteData.email}
                onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Função</Label>
              <Select value={inviteData.role} onValueChange={(value) => setInviteData({ ...inviteData, role: value })}>
                <SelectTrigger className="input-modern">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-card border-border">
                  <SelectItem value="Gestor">Gestor</SelectItem>
                  <SelectItem value="Criador de Conteúdo">Criador de Conteúdo</SelectItem>
                  <SelectItem value="Designer">Designer</SelectItem>
                  <SelectItem value="Produtor">Produtor</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-3 pt-4">
              <Button variant="ghost" onClick={() => setIsInviteModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleInviteMember}>
                <Mail className="w-4 h-4 mr-2" />
                Enviar Convite
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
}
