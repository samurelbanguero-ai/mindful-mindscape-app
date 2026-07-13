import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMood } from "@/lib/mood";
import { support as supportApi, admin as adminApi, community as communityApi, type SupportRequest, type AuditLog } from "@/lib/api";
import { useEffect, useState, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Shield,
  HeartHandshake,
  MessageSquare,
  BarChart2,
  Check,
  Ban,
  Edit,
  Trash,
  ArrowLeft,
  ArrowRight,
  Search,
  Send,
  Loader2,
} from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/psicologo")({
  head: () => ({ meta: [{ title: "Panel profesional — Emowave" }] }),
  component: Panel,
});

interface ModerationPost {
  id: string | number;
  title: string;
  body: string;
  author: string;
  anon: boolean;
  status: "approved" | "pending" | "rejected";
}

export function Panel() {
  const { user } = useMood();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isPsico = user?.role === "psicologo" || isAdmin;

  const [activeTab, setActiveTab] = useState<string>("stats");

  // Soporte
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [selectedReq, setSelectedReq] = useState<SupportRequest | null>(null);
  const [supportSearch, setSupportSearch] = useState("");
  const [supportStatusFilter, setSupportStatusFilter] = useState("pending");
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Moderación
  const [posts, setPosts] = useState<ModerationPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [postSearch, setPostSearch] = useState("");
  const [postStatusFilter, setPostStatusFilter] = useState("");
  const [moderationPage, setModerationPage] = useState(1);

  // Edición Moderación
  const [editingPost, setEditingPost] = useState<ModerationPost | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [submittingEdit, setSubmittingEdit] = useState(false);

  // Creación de Cuentas (Admin)
  const [createName, setCreateName] = useState("");
  const [createUsername, setCreateUsername] = useState("");
  const [createEmail, setCreateEmail] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [createRole, setCreateRole] = useState<"usuario" | "psicologo">("usuario");
  const [submittingCreate, setSubmittingCreate] = useState(false);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createEmail.trim() || !createUsername.trim() || !createPassword.trim()) {
      toast.error("Por favor completa los campos obligatorios");
      return;
    }
    if (createUsername.trim().length < 3) {
      toast.error("El nombre de usuario debe tener al menos 3 caracteres");
      return;
    }
    if (createPassword.length < 6) {
      toast.error("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setSubmittingCreate(true);
    try {
      await adminApi.createUser(
        createEmail.trim().toLowerCase(),
        createUsername.trim().toLowerCase(),
        createPassword,
        createName.trim(),
        createRole,
      );
      toast.success(`Cuenta de tipo ${createRole} creada con éxito 🎉`);
      setCreateName("");
      setCreateUsername("");
      setCreateEmail("");
      setCreatePassword("");
      setCreateRole("usuario");
    } catch (err: any) {
      toast.error(err.message || "Error al crear la cuenta");
    } finally {
      setSubmittingCreate(false);
    }
  };

  // Auditoría
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
    else if (user.role !== "psicologo" && user.role !== "admin") navigate({ to: "/app" });
  }, [user, navigate]);

  // Auto-scroll al final del chat
  useEffect(() => {
    if (selectedReq?.messages) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedReq?.messages]);

  // Cargar soporte
  const loadRequests = async () => {
    if (!isPsico) return;
    setLoadingRequests(true);
    try {
      const res = await supportApi.getAllRequests(
        supportStatusFilter === "all" ? "" : supportStatusFilter,
        supportSearch,
      );
      
      const flattened: SupportRequest[] = (res.requests || []).map((item: any) => ({
        ...item.request,
        messages: item.messages,
        journal_entries: item.journal_entries,
      }));

      setRequests(flattened);

      if (selectedReq) {
        const updated = flattened.find((r) => r.id === selectedReq.id);
        if (updated) setSelectedReq(updated);
      }
    } catch (err: any) {
      toast.error(err.message || "Error al cargar solicitudes de soporte");
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    if (!isPsico || activeTab !== "support") return;
    loadRequests();
    const interval = setInterval(loadRequests, 12000);
    return () => clearInterval(interval);
  }, [isPsico, activeTab, supportStatusFilter, supportSearch, selectedReq]);

  // Cargar posts para moderación
  const loadPosts = async () => {
    if (!isAdmin) return;
    setLoadingPosts(true);
    try {
      const limit = 10;
      const offset = (moderationPage - 1) * limit;
      const res = await communityApi.getPosts(limit, offset);

      let items = (res.posts || []) as ModerationPost[];
      if (postStatusFilter) {
        items = items.filter((p) => p.status === postStatusFilter);
      }
      if (postSearch.trim()) {
        const q = postSearch.toLowerCase().trim();
        items = items.filter((p) => p.title.toLowerCase().includes(q) || p.body.toLowerCase().includes(q));
      }
      setPosts(items);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar publicaciones para moderar");
    } finally {
      setLoadingPosts(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === "moderation") {
      loadPosts();
    }
  }, [isAdmin, activeTab, moderationPage, postStatusFilter, postSearch]);

  // Cargar logs de auditoría
  const loadAuditLogs = async () => {
    if (!isAdmin) return;
    setLoadingLogs(true);
    try {
      const res = await adminApi.getAuditLogs();
      setAuditLogs(res.logs || []);
    } catch (err: any) {
      toast.error(err.message || "Error al cargar registros de auditoría");
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isAdmin && activeTab === "audit") {
      loadAuditLogs();
    }
  }, [isAdmin, activeTab]);

  // Enviar mensaje en chat de soporte
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReq || !chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput("");
    try {
      await supportApi.sendMessage(selectedReq.id, text);
      await loadRequests();
    } catch (err: any) {
      toast.error(err.message || "Error al enviar mensaje");
      setChatInput(text);
    }
  };

  // Resolver ticket de soporte
  const handleResolveRequest = async () => {
    if (!selectedReq) return;
    try {
      await supportApi.resolveRequest(selectedReq.id);
      toast.success("Consulta finalizada.");
      setSelectedReq(null);
      await loadRequests();
    } catch (err: any) {
      toast.error(err.message || "Error al cerrar la consulta");
    }
  };

  // Acciones de moderación
  const handleApprovePost = async (postId: number | string) => {
    try {
      await adminApi.approvePost(String(postId));
      toast.success("Publicación aprobada.");
      await loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Error al aprobar publicación");
    }
  };

  const handleRejectPost = async (postId: number | string) => {
    try {
      await adminApi.rejectPost(String(postId));
      toast.success("Publicación rechazada.");
      await loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Error al rechazar publicación");
    }
  };

  const handleEditPost = async () => {
    if (!editingPost) return;
    setSubmittingEdit(true);
    try {
      await adminApi.editPost(String(editingPost.id), editTitle.trim(), editBody.trim());
      toast.success("Publicación editada.");
      setEditingPost(null);
      await loadPosts();
    } catch (err: any) {
      toast.error(err.message || "Error al guardar edición");
    } finally {
      setSubmittingEdit(false);
    }
  };

  const formattedDate = (dateStr: string) => {
    if (!dateStr) return "";
    try {
      const formattedStr = dateStr.includes(" ") && !dateStr.includes("T") ? dateStr.replace(" ", "T") : dateStr;
      const d = new Date(formattedStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return dateStr;
    }
  };

  // Recharts Stats
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {};
    requests.forEach((r) => {
      if (r.journal_entries && r.journal_entries.length > 0) {
        const lastEntry = r.journal_entries[0];
        const mood = lastEntry.mood || "indefinido";
        counts[mood] = (counts[mood] || 0) + 1;
      } else {
        counts["No compartido"] = (counts["No compartido"] || 0) + 1;
      }
    });

    return Object.entries(counts).map(([name, cantidad]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      cantidad,
    }));
  }, [requests]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5" aria-label="Cabecera del panel">
          <div>
            <h1 className="text-3xl font-serif flex items-center gap-2">
              <Shield className="w-7 h-7 text-primary" /> Panel Profesional
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Área de soporte terapéutico {isAdmin && "y administración del sistema"}
            </p>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="flex flex-wrap h-auto p-1 bg-secondary/40 rounded-full border border-border/40 w-fit max-w-full overflow-x-auto">
            <TabsTrigger value="stats" className="rounded-full py-2 text-xs">Estadísticas</TabsTrigger>
            <TabsTrigger value="support" className="rounded-full py-2 text-xs" onClick={loadRequests}>Apoyo Psicológico</TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="moderation" className="rounded-full py-2 text-xs">Moderación</TabsTrigger>
                <TabsTrigger value="accounts" className="rounded-full py-2 text-xs">Crear Cuentas</TabsTrigger>
                <TabsTrigger value="audit" className="rounded-full py-2 text-xs">Auditoría</TabsTrigger>
              </>
            )}
          </TabsList>

          {/* PESTAÑA 1: Estadísticas */}
          <TabsContent value="stats">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <Card className="p-5 card-premium shadow bg-card">
                  <div className="flex items-center space-x-3">
                    <HeartHandshake className="w-5 h-5 text-primary" />
                    <span className="text-xs text-muted-foreground font-medium">Total solicitudes</span>
                  </div>
                  <span className="text-3xl font-bold block mt-2">{requests.length}</span>
                </Card>

                <Card className="p-5 card-premium shadow bg-card">
                  <div className="flex items-center space-x-3">
                    <MessageSquare className="w-5 h-5 text-amber-500" />
                    <span className="text-xs text-muted-foreground font-medium">Pendientes</span>
                  </div>
                  <span className="text-3xl font-bold block mt-2 text-amber-500">
                    {requests.filter((r) => r.status === "pending").length}
                  </span>
                </Card>

                <Card className="p-5 card-premium shadow bg-card">
                  <div className="flex items-center space-x-3">
                    <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                    <span className="text-xs text-muted-foreground font-medium">En proceso</span>
                  </div>
                  <span className="text-3xl font-bold block mt-2 text-blue-500">
                    {requests.filter((r) => r.status === "active").length}
                  </span>
                </Card>

                <Card className="p-5 card-premium shadow bg-card">
                  <div className="flex items-center space-x-3">
                    <Shield className="w-5 h-5 text-emerald-500" />
                    <span className="text-xs text-muted-foreground font-medium">Resueltas</span>
                  </div>
                  <span className="text-3xl font-bold block mt-2 text-emerald-500">
                    {requests.filter((r) => r.status === "resolved").length}
                  </span>
                </Card>
              </div>

              <Card className="p-6 card-premium shadow bg-card">
                <h3 className="text-lg font-serif mb-4 flex items-center gap-1.5" id="psy-chart-title">
                  <BarChart2 className="w-5 h-5 text-primary" /> Emociones de Pacientes
                </h3>
                <div className="h-[280px] w-full" role="region" aria-labelledby="psy-chart-title">
                  {chartData.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-muted-foreground text-xs">
                      No hay suficientes datos.
                    </div>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(var(--border), 0.1)" />
                        <XAxis dataKey="name" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis fontSize={10} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip />
                        <Bar dataKey="cantidad" fill="var(--primary)" radius={[4, 4, 0, 0]} barSize={35} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          {/* PESTAÑA 2: Apoyo Psicológico */}
          <TabsContent value="support">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-4 md:col-span-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar paciente..."
                    value={supportSearch}
                    onChange={(e) => setSupportSearch(e.target.value)}
                    className="pl-9 rounded-xl text-xs input-premium"
                  />
                </div>

                <select
                  value={supportStatusFilter}
                  onChange={(e) => setSupportStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-background input-premium"
                >
                  <option value="pending">Pendientes</option>
                  <option value="active">En proceso</option>
                  <option value="resolved">Resueltas</option>
                  <option value="all">Todas</option>
                </select>

                <div className="space-y-2.5 max-h-[400px] overflow-y-auto pr-1">
                  {requests.map((r) => (
                    <button
                      key={r.id}
                      onClick={() => setSelectedReq(r)}
                      className={`w-full text-left p-4 rounded-2xl border transition-all ${
                        selectedReq?.id === r.id ? "border-primary bg-primary/5 shadow-sm" : "border-border bg-card hover:bg-secondary/40"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-semibold text-xs text-foreground/90">
                          {r.visibility === "anonimo" ? `Anónimo/a (${r.alias || "Paciente"})` : r.username}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{formattedDate(r.created_at)}</span>
                      </div>
                      <p className="text-[11px] text-muted-foreground line-clamp-2">{r.message}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                {!selectedReq ? (
                  <Card className="h-[480px] rounded-3xl card-premium flex flex-col items-center justify-center text-muted-foreground p-6 text-center">
                    <HeartHandshake className="w-12 h-12 text-primary/30 mb-3" />
                    <h4 className="text-sm font-semibold">Ninguna solicitud seleccionada</h4>
                    <p className="text-xs text-muted-foreground mt-1">Selecciona un paciente de la lista lateral para iniciar la conversación de apoyo.</p>
                  </Card>
                ) : (
                  <Card className="h-[480px] rounded-3xl card-premium flex flex-col p-5 overflow-hidden">
                    <div className="flex justify-between items-center border-b border-border/40 pb-3 mb-3 text-xs shrink-0">
                      <div>
                        <span className="font-bold text-sm block text-foreground/90">
                          Paciente: {selectedReq.visibility === "anonimo" ? `Anónimo/a (${selectedReq.alias || "Paciente"})` : selectedReq.username}
                        </span>
                        <span className="text-[10px] text-muted-foreground">ID: {selectedReq.user_id}</span>
                      </div>
                      {selectedReq.status !== "resolved" && (
                        <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10 text-xs rounded-full px-3" onClick={handleResolveRequest}>
                          Marcar resuelta
                        </Button>
                      )}
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin">
                      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-3.5 text-xs text-foreground/80 leading-relaxed">
                        <span className="font-semibold block mb-0.5 text-primary">Motivo de consulta:</span>
                        {selectedReq.message}
                      </div>

                      {selectedReq.share_journal === 1 && selectedReq.journal_entries && selectedReq.journal_entries.length > 0 && (
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-3.5 text-xs space-y-2">
                          <span className="font-semibold text-emerald-600 block">🌿 Diario de emociones compartido:</span>
                          {selectedReq.journal_entries.map((entry, idx) => (
                            <div key={idx} className="border-b border-border/30 pb-2 last:border-0 text-foreground/80">
                              <p className="text-[10px] text-muted-foreground">{entry.date} - {entry.mood} ({entry.intensity}/10)</p>
                              {entry.note && <p className="italic mt-0.5">"{entry.note}"</p>}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-3.5 pt-2">
                        {selectedReq.messages?.map((m) => {
                          const isMe = m.sender_id === user.id;
                          return (
                            <div key={m.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
                              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs ${isMe ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-secondary text-foreground rounded-tl-none border"}`}>
                                {!isMe && <span className="font-bold block text-[10px] text-primary/80 mb-0.5">Paciente</span>}
                                <p>{m.message}</p>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={chatEndRef} />
                      </div>
                    </div>

                    {selectedReq.status !== "resolved" ? (
                      <form onSubmit={handleSendMessage} className="mt-4 flex gap-2 shrink-0">
                        <input
                          type="text"
                          placeholder="Escribe un mensaje..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-full border text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-background input-premium"
                        />
                        <Button type="submit" size="icon" className="rounded-full h-9 w-9 shrink-0 btn-premium-primary">
                          <Send className="w-3.5 h-3.5" />
                        </Button>
                      </form>
                    ) : (
                      <div className="mt-4 p-3 bg-secondary/40 text-center text-xs text-muted-foreground rounded-xl shrink-0">
                        Consulta cerrada.
                      </div>
                    )}
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* PESTAÑA 3: Moderación */}
          {isAdmin && (
            <TabsContent value="moderation">
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Buscar..." value={postSearch} onChange={(e) => setPostSearch(e.target.value)} className="pl-9 text-xs input-premium" />
                  </div>

                  <select value={postStatusFilter} onChange={(e) => setPostStatusFilter(e.target.value)} className="px-3.5 py-1.5 rounded-xl border text-xs bg-background input-premium">
                    <option value="">Todos los estados</option>
                    <option value="pending">Pendientes</option>
                    <option value="approved">Aprobados</option>
                    <option value="rejected">Rechazados</option>
                  </select>
                </div>

                <Card className="card-premium shadow overflow-hidden rounded-2xl border-0">
                  <Table>
                    <TableHeader className="bg-secondary/40 text-xs">
                      <TableRow>
                        <TableHead>Autor</TableHead>
                        <TableHead>Título</TableHead>
                        <TableHead>Contenido</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-right">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody className="text-xs">
                      {posts.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell>{p.anon ? `Anón (${p.author})` : p.author}</TableCell>
                          <TableCell className="font-medium">{p.title}</TableCell>
                          <TableCell className="max-w-xs truncate text-muted-foreground">{p.body}</TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${p.status === "pending" ? "bg-amber-100 text-amber-800" : p.status === "approved" ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"}`}>
                              {p.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right space-x-1">
                            {p.status !== "approved" && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-emerald-600 hover:bg-emerald-50" onClick={() => handleApprovePost(p.id)}>
                                <Check className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            {p.status !== "rejected" && (
                              <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive hover:bg-red-50" onClick={() => handleRejectPost(p.id)}>
                                <Ban className="w-3.5 h-3.5" />
                              </Button>
                            )}
                            <Button size="icon" variant="ghost" className="h-7 w-7 text-primary hover:bg-primary/5" onClick={() => { setEditingPost(p); setEditTitle(p.title); setEditBody(p.body); }}>
                              <Edit className="w-3.5 h-3.5" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>

                <div className="flex justify-end gap-4 text-xs pt-2">
                  <Button size="sm" variant="outline" disabled={moderationPage <= 1} onClick={() => setModerationPage(moderationPage - 1)}>
                    Anterior
                  </Button>
                  <span className="font-medium">Página {moderationPage}</span>
                  <Button size="sm" variant="outline" disabled={posts.length < 10} onClick={() => setModerationPage(moderationPage + 1)}>
                    Siguiente
                  </Button>
                </div>
              </div>
            </TabsContent>
          )}

          {/* PESTAÑA: Crear Cuentas */}
          {isAdmin && (
            <TabsContent value="accounts">
              <Card className="max-w-xl mx-auto p-6 card-premium shadow bg-card space-y-6">
                <div>
                  <h3 className="text-lg font-serif font-semibold text-foreground/90">Crear nueva cuenta</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">Introduce los datos para dar de alta a un nuevo psicólogo o usuario.</p>
                </div>

                <form onSubmit={handleCreateUser} className="space-y-4 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-name" className="text-[10px] font-semibold text-muted-foreground uppercase">Nombre Completo (Opcional)</Label>
                      <Input
                        id="c-name"
                        value={createName}
                        onChange={(e) => setCreateName(e.target.value)}
                        placeholder="Ej: Dr. Alejandro Sanz"
                        className="rounded-xl input-premium"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-username" className="text-[10px] font-semibold text-muted-foreground uppercase">Nombre de usuario *</Label>
                      <Input
                        id="c-username"
                        value={createUsername}
                        onChange={(e) => setCreateUsername(e.target.value)}
                        placeholder="Ej: alejandrosanz"
                        className="rounded-xl input-premium"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label htmlFor="c-email" className="text-[10px] font-semibold text-muted-foreground uppercase">Correo electrónico *</Label>
                      <Input
                        id="c-email"
                        type="email"
                        value={createEmail}
                        onChange={(e) => setCreateEmail(e.target.value)}
                        placeholder="Ej: alejandro@emowave.app"
                        className="rounded-xl input-premium"
                        required
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="c-pw" className="text-[10px] font-semibold text-muted-foreground uppercase">Contraseña temporal *</Label>
                      <Input
                        id="c-pw"
                        type="password"
                        value={createPassword}
                        onChange={(e) => setCreatePassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="rounded-xl input-premium"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="c-role" className="text-[10px] font-semibold text-muted-foreground uppercase">Rol de la cuenta</Label>
                    <select
                      id="c-role"
                      value={createRole}
                      onChange={(e) => setCreateRole(e.target.value as "usuario" | "psicologo")}
                      className="w-full px-3 py-2 rounded-xl border border-border text-xs bg-background input-premium"
                    >
                      <option value="usuario">Usuario común</option>
                      <option value="psicologo">Psicólogo/a del equipo</option>
                    </select>
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submittingCreate}
                      className="w-full rounded-full py-5 font-semibold text-xs btn-premium-primary"
                    >
                      {submittingCreate ? "Creando cuenta..." : "Crear cuenta y activar"}
                    </Button>
                  </div>
                </form>
              </Card>
            </TabsContent>
          )}

          {/* PESTAÑA 4: Auditoría */}
          {isAdmin && (
            <TabsContent value="audit">
              <Card className="card-premium shadow overflow-hidden rounded-2xl border-0">
                <Table>
                  <TableHeader className="bg-secondary/40 text-xs">
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Usuario ID</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Detalles</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody className="text-xs">
                    {auditLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="text-muted-foreground">{formattedDate(log.created_at)}</TableCell>
                        <TableCell>{log.user_id}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-0.5 rounded-full text-[9px] font-bold ${log.action.includes("success") ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                            {log.action}
                          </span>
                        </TableCell>
                        <TableCell>{log.details}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Dialog para Editar Publicación */}
      <Dialog open={!!editingPost} onOpenChange={(val: boolean) => !val && setEditingPost(null)}>
        <DialogContent className="rounded-3xl max-w-md card-premium border-0 shadow bg-card">
          <DialogHeader>
            <DialogTitle className="text-lg font-serif">Editar publicación</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 my-2">
            <div>
              <Label htmlFor="edit-post-title" className="text-xs font-semibold text-muted-foreground uppercase">Título</Label>
              <Input id="edit-post-title" value={editTitle} onChange={(e) => setEditTitle(e.target.value)} className="input-premium" />
            </div>
            <div>
              <Label htmlFor="edit-post-body" className="text-xs font-semibold text-muted-foreground uppercase">Contenido</Label>
              <Textarea id="edit-post-body" value={editBody} onChange={(e) => setEditBody(e.target.value)} className="min-h-[120px] input-premium" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setEditingPost(null)}>Cancelar</Button>
            <Button onClick={handleEditPost} disabled={submittingEdit} className="btn-premium-primary">
              {submittingEdit ? "Guardando..." : "Guardar cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
