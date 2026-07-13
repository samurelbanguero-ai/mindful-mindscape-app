import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useMood, displayAuthor, containsBadWords, MOODS, REACTIONS, type Post } from "@/lib/mood";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Users, Plus, Heart, Flag, MessageCircle, Send } from "lucide-react";

export const Route = createFileRoute("/comunidad")({
  head: () => ({
    meta: [
      { title: "Comunidad — Emowave" },
      { name: "description", content: "Comparte y encuentra apoyo de forma anónima." },
    ],
  }),
  component: Comunidad,
});

export function Comunidad() {
  const { user, posts, addPost, react, addComment, reportPost } = useMood();
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [activePost, setActivePost] = useState<Post | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Formulario de creación
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newMood, setNewMood] = useState<any>("");
  const [newAnon, setNewAnon] = useState(false);

  // Formulario de comentario
  const [commentText, setCommentText] = useState("");
  const [commentAnon, setCommentAnon] = useState(false);

  useEffect(() => {
    if (!user) navigate({ to: "/auth" });
  }, [user, navigate]);

  if (!user) return null;

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim()) {
      toast.error("Completa el título y el mensaje");
      return;
    }

    if (containsBadWords(newTitle + " " + newBody)) {
      toast.error("Detectamos lenguaje no permitido. Por favor, reformula con respeto.");
      return;
    }

    addPost({
      author: displayAuthor(user, newAnon),
      anon: newAnon || user.visibility === "anonimo",
      title: newTitle.trim(),
      body: newBody.trim(),
      mood: newMood || undefined,
    });

    setNewTitle("");
    setNewBody("");
    setNewMood("");
    setNewAnon(false);
    setCreateOpen(false);
    toast.success("¡Gracias por compartir! Tu publicación se ha creado con éxito 💚");
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePost || !commentText.trim()) return;

    if (containsBadWords(commentText)) {
      toast.error("Detectamos lenguaje no permitido. Reformula con respeto.");
      return;
    }

    try {
      await addComment(activePost.id, {
        author: displayAuthor(user, commentAnon),
        anon: commentAnon,
        text: commentText.trim(),
      });

      // Actualización optimista local en el modal activo (solo si no falló el servidor)
      const newCommentObj = {
        id: "c_" + Math.random().toString(36).slice(2, 9),
        author: displayAuthor(user, commentAnon),
        anon: commentAnon,
        text: commentText.trim(),
        createdAt: Date.now(),
      };
      setActivePost({
        ...activePost,
        comments: [...(activePost.comments || []), newCommentObj],
      });

      setCommentText("");
      toast.success("Comentario publicado 💬");
    } catch (err: any) {
      console.error(err);
      const errMsg = err?.message || "Error al publicar comentario. Inténtalo de nuevo.";
      toast.error(errMsg);
    }
  };

  const handleOpenDetail = (post: Post) => {
    setActivePost(post);
    setDetailOpen(true);
  };

  const formattedDate = (timestamp: number) => {
    try {
      const d = new Date(timestamp);
      return d.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (_) {
      return String(timestamp);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <header className="flex items-end justify-between flex-wrap gap-4 border-b border-border/40 pb-6" aria-label="Cabecera de comunidad">
          <div>
            <p className="text-sm text-muted-foreground">Estás entre personas que te entienden</p>
            <h1 className="text-4xl font-serif mt-1 flex items-center gap-2">
              <Users className="w-7 h-7 text-primary" /> Comunidad
            </h1>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="rounded-full shadow-md hover:shadow-lg transition-all">
            <Plus className="w-4 h-4 mr-2" /> Compartir algo
          </Button>
        </header>

        <Card className="p-4 rounded-2xl bg-accent/40 border-0 text-xs flex items-start gap-3">
          <Heart className="w-4 h-4 text-primary mt-0.5" />
          <p className="text-foreground/80 leading-relaxed">
            Aquí no hay "me gusta". Reaccionamos con apoyo. No se permite acoso, insultos ni discriminación de ningún tipo. Cuidemos este espacio seguro.
          </p>
        </Card>

        {/* Publicaciones */}
        <section className="space-y-4" aria-label="Publicaciones de la comunidad">
          {posts.length === 0 ? (
            <div className="text-center text-muted-foreground text-sm py-12">
              No hay publicaciones en la comunidad todavía. ¡Sé el primero en compartir!
            </div>
          ) : (
            posts.map((post) => {
              const moodObj = MOODS.find((x) => x.id === post.mood);
              return (
                <Card key={post.id} className="card-premium space-y-4">
                  <div className="flex justify-between items-start flex-wrap gap-2 text-xs">
                    <div className="flex items-center space-x-2.5">
                      <span className="font-semibold text-foreground">
                        {post.anon ? "Anónimo/a" : post.author || "Usuario"}
                      </span>
                      <span className="text-muted-foreground">•</span>
                      <span className="text-muted-foreground">{formattedDate(post.createdAt)}</span>
                    </div>
                    {moodObj && (
                      <span className="px-2.5 py-1 rounded-full bg-secondary/80 text-foreground font-medium">
                        Sintiéndose: {moodObj.emoji} {moodObj.label}
                      </span>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold font-serif leading-snug">{post.title}</h3>
                    <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-wrap">{post.body}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-wrap gap-2">
                      {REACTIONS.map((r) => {
                        const count = post.reactions?.[r.id] || 0;
                        const active = post.reactedBy === r.id;
                        return (
                          <Button
                            key={r.id}
                            size="sm"
                            variant="ghost"
                            onClick={() => react(post.id, r.id)}
                            className={`rounded-full px-2.5 py-1 text-xs h-8 flex items-center gap-1.5 ${
                              active ? "bg-primary/10 text-primary font-semibold" : "hover:bg-secondary"
                            }`}
                          >
                            <span className="text-base">{r.emoji}</span>
                            {count > 0 && <span>{count}</span>}
                          </Button>
                        );
                      })}
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleOpenDetail(post)}
                        className="rounded-full px-3 py-1 text-xs h-8 flex items-center gap-1.5 text-muted-foreground hover:text-foreground"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>{post.comments?.length || 0}</span>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => reportPost(post.id)}
                        className="rounded-full p-2 text-xs h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      >
                        <Flag className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })
          )}
        </section>
      </main>

      {/* Modal para Crear Post */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="rounded-3xl max-w-md md:max-w-lg border-0 shadow-2xl bg-card">
          <DialogHeader>
            <DialogTitle className="text-xl font-serif">Comparte con la comunidad</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreatePost} className="space-y-4 my-2">
            <div>
              <Label htmlFor="post-title">Título</Label>
              <Input
                id="post-title"
                maxLength={120}
                placeholder="Ej: Un día complicado pero saliendo adelante..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="post-body">Mensaje</Label>
              <Textarea
                id="post-body"
                maxLength={2000}
                placeholder="Escribe lo que sientes..."
                className="min-h-[140px]"
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="mb-2 block font-medium">¿Cómo te sientes? (opcional)</Label>
              <div className="flex flex-wrap gap-2 max-h-[100px] overflow-y-auto p-1 border border-border/40 rounded-xl bg-secondary/20">
                {MOODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setNewMood(newMood === m.id ? "" : m.id)}
                    className={`px-3 py-1.5 rounded-full text-xs border transition-all ${
                      newMood === m.id
                        ? "border-primary bg-primary/10 text-primary-foreground font-semibold"
                        : "border-border hover:bg-secondary"
                    }`}
                  >
                    {m.emoji} {m.label}
                  </button>
                ))}
              </div>
            </div>

            <label className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary/50 cursor-pointer text-xs">
              <Checkbox
                checked={newAnon}
                onCheckedChange={(v) => setNewAnon(!!v)}
                className="mt-0.5"
              />
              <span>Publicar de forma anónima</span>
            </label>

            <DialogFooter>
              <Button type="submit" className="rounded-full w-full py-5 font-semibold">
                Publicar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal para Detalles del Post */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="rounded-3xl max-w-md md:max-w-xl border-0 shadow-2xl bg-card flex flex-col h-[500px]">
          {activePost && (
            <>
              <DialogHeader>
                <DialogTitle className="text-lg font-serif border-b border-border/40 pb-2">
                  Publicación de {activePost.anon ? "Anónimo/a" : activePost.author || "Usuario"}
                </DialogTitle>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 scrollbar-thin my-2">
                <div className="space-y-2 bg-secondary/20 p-4 rounded-2xl border border-border/40">
                  <span className="text-[11px] text-muted-foreground block">{formattedDate(activePost.createdAt)}</span>
                  <h3 className="text-base font-bold leading-snug">{activePost.title}</h3>
                  <p className="text-xs text-foreground/80 leading-relaxed whitespace-pre-wrap">{activePost.body}</p>
                </div>

                <div className="text-xs font-semibold text-muted-foreground pt-1">
                  Comentarios ({activePost.comments?.length || 0})
                </div>

                {(!activePost.comments || activePost.comments.length === 0) ? (
                  <div className="text-center text-xs text-muted-foreground py-8">
                    No hay comentarios todavía. Comparte un mensaje de aliento y empatía.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {[...activePost.comments].sort((a: any, b: any) => a.createdAt - b.createdAt).map((c: any) => (
                      <div key={c.id} className="bg-secondary/40 p-3 rounded-2xl border border-border/20 space-y-1.5">
                        <div className="flex justify-between items-center text-[10px]">
                          <span className="font-semibold text-foreground">{c.anon ? "Anónimo/a" : c.author || "Usuario"}</span>
                          <span className="text-muted-foreground">{formattedDate(c.createdAt)}</span>
                        </div>
                        <p className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{c.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <form onSubmit={handleAddComment} className="pt-3 border-t border-border/40 space-y-3 shrink-0">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Escribe un mensaje de apoyo..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-4 py-2.5 rounded-full border border-border text-xs focus:outline-none focus:ring-1 focus:ring-primary bg-background"
                    maxLength={500}
                    required
                  />
                  <Button type="submit" size="icon" className="rounded-full h-9 w-9 shrink-0">
                    <Send className="w-3.5 h-3.5" />
                  </Button>
                </div>

                <label className="flex items-center gap-2 text-[11px] text-muted-foreground cursor-pointer p-1">
                  <Checkbox
                    checked={commentAnon}
                    onCheckedChange={(v) => setCommentAnon(!!v)}
                    className="h-3.5 w-3.5 rounded"
                  />
                  <span>Comentar de forma anónima</span>
                </label>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
