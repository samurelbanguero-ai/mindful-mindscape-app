import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { useMood, MOODS, REACTIONS, displayAuthor, containsBadWords, type Mood, type Post } from "@/lib/mood";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Users, Plus, Flag, MessageCircle, Heart } from "lucide-react";

export const Route = createFileRoute("/comunidad")({
  head: () => ({ meta: [{ title: "Comunidad — Serena" }, { name: "description", content: "Comparte y encuentra apoyo de forma anónima." }] }),
  component: Comunidad,
});

function Comunidad() {
  const { user, posts, addPost, react, addComment, reportPost } = useMood();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState({ title: "", body: "", mood: "" as Mood | "", anon: false });
  const [active, setActive] = useState<Post | null>(null);

  useEffect(() => { if (!user) navigate({ to: "/auth" }); }, [user, navigate]);
  if (!user) return null;

  const submitPost = () => {
    if (!draft.title.trim() || !draft.body.trim()) return toast.error("Completa título y mensaje");
    if (containsBadWords(draft.title + " " + draft.body)) return toast.error("Detectamos lenguaje no permitido. Reformula con respeto.");
    addPost({
      author: displayAuthor(user, draft.anon),
      anon: draft.anon || user.visibility === "anonimo",
      title: draft.title.trim(), body: draft.body.trim(),
      mood: draft.mood || undefined,
    });
    setDraft({ title: "", body: "", mood: "", anon: false });
    setOpen(false);
    toast.success("Gracias por compartir 💚");
  };

  return (
    <div>
      <Navbar />
      <main className="max-w-4xl mx-auto px-6 py-10 space-y-6">
        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Estás entre personas que te entienden</p>
            <h1 className="text-4xl font-serif mt-1 flex items-center gap-2"><Users className="w-7 h-7 text-primary" /> Comunidad</h1>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild><Button className="rounded-full"><Plus className="w-4 h-4 mr-2" /> Compartir algo</Button></DialogTrigger>
            <DialogContent className="rounded-3xl">
              <DialogHeader><DialogTitle>Comparte con la comunidad</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <div><Label htmlFor="t">Título</Label><Input id="t" maxLength={120} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} /></div>
                <div><Label htmlFor="b">Mensaje</Label><Textarea id="b" maxLength={2000} className="min-h-[140px]" value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} /></div>
                <div>
                  <Label className="mb-2 block">¿Cómo te sientes? (opcional)</Label>
                  <div className="flex flex-wrap gap-2">
                    {MOODS.map((m) => (
                      <button key={m.id} onClick={() => setDraft({ ...draft, mood: draft.mood === m.id ? "" : m.id })} className={`px-3 py-1.5 rounded-full text-xs border-2 ${draft.mood === m.id ? "border-primary bg-primary/10" : "border-border"}`}>{m.emoji} {m.label}</button>
                    ))}
                  </div>
                </div>
                <label className="flex items-start gap-2 text-sm p-3 rounded-xl bg-secondary/60 cursor-pointer">
                  <Checkbox checked={draft.anon} onCheckedChange={(v) => setDraft({ ...draft, anon: !!v })} className="mt-0.5" />
                  <span>Publicar como anónimo/a</span>
                </label>
              </div>
              <DialogFooter><Button onClick={submitPost} className="rounded-full">Publicar</Button></DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card className="p-4 rounded-2xl bg-accent/40 border-0 text-sm flex items-start gap-3">
          <Heart className="w-4 h-4 text-primary mt-0.5" />
          <p className="text-foreground/80">Aquí no hay "me gusta". Reaccionamos con apoyo. No se permite acoso, insultos ni discriminación.</p>
        </Card>

        <div className="space-y-4">
          {posts.map((p) => {
            const moodObj = p.mood ? MOODS.find((m) => m.id === p.mood) : null;
            return (
              <Card key={p.id} className="p-5 rounded-2xl hover:shadow-md transition cursor-pointer" onClick={() => setActive(p)}>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <span className="font-medium text-foreground/70">{p.author}</span>
                  <span>·</span><span>{timeAgo(p.createdAt)}</span>
                  {moodObj && <><span>·</span><span>{moodObj.emoji} {moodObj.label}</span></>}
                  {p.reported && <span className="ml-auto text-destructive">reportado</span>}
                </div>
                <h3 className="text-lg font-medium mb-1">{p.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2">{p.body}</p>
                <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                  {REACTIONS.map((r) => p.reactions[r.id] ? (
                    <span key={r.id}>{r.emoji} {p.reactions[r.id]}</span>
                  ) : null)}
                  <span className="ml-auto flex items-center gap-1"><MessageCircle className="w-3.5 h-3.5" /> {p.comments.length}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detail dialog */}
        <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <DialogContent className="rounded-3xl max-w-2xl max-h-[85vh] overflow-y-auto">
            {active && (
              <PostDetail
                post={posts.find((p) => p.id === active.id) || active}
                onReact={(r) => react(active.id, r)}
                onComment={(text, anon) => {
                  if (containsBadWords(text)) return toast.error("Detectamos lenguaje no permitido.");
                  addComment(active.id, { author: displayAuthor(user, anon), anon: anon || user.visibility === "anonimo", text });
                }}
                onReport={() => { reportPost(active.id); toast.success("Reporte enviado. Lo revisaremos."); }}
                viewerName={displayAuthor(user, false)}
                viewerForceAnon={user.visibility === "anonimo"}
              />
            )}
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}

function PostDetail({ post, onReact, onComment, onReport, viewerForceAnon }: {
  post: Post; onReact: (r: any) => void; onComment: (text: string, anon: boolean) => void; onReport: () => void; viewerName: string; viewerForceAnon: boolean;
}) {
  const [text, setText] = useState(""); const [anon, setAnon] = useState(false);
  const send = () => { if (!text.trim()) return; onComment(text.trim(), anon); setText(""); };
  const moodObj = post.mood ? MOODS.find((m) => m.id === post.mood) : null;
  return (
    <>
      <DialogHeader><DialogTitle className="text-2xl font-serif">{post.title}</DialogTitle></DialogHeader>
      <div className="text-xs text-muted-foreground flex items-center gap-2">
        <span className="text-foreground/70 font-medium">{post.author}</span>·<span>{timeAgo(post.createdAt)}</span>
        {moodObj && <><span>·</span><span>{moodObj.emoji} {moodObj.label}</span></>}
        <button onClick={onReport} className="ml-auto hover:text-destructive flex items-center gap-1"><Flag className="w-3 h-3" /> Reportar</button>
      </div>
      <p className="text-sm leading-relaxed whitespace-pre-wrap">{post.body}</p>

      <div className="flex flex-wrap gap-2 py-2 border-y border-border">
        {REACTIONS.map((r) => (
          <button key={r.id} onClick={() => onReact(r.id)} className={`px-3 py-1.5 rounded-full text-xs border-2 transition ${post.reactedBy === r.id ? "border-primary bg-primary/10" : "border-border hover:border-primary/40"}`}>
            {r.emoji} {r.label} {post.reactions[r.id] ? <span className="text-muted-foreground ml-1">{post.reactions[r.id]}</span> : null}
          </button>
        ))}
      </div>

      <div>
        <p className="text-sm font-medium mb-3">{post.comments.length} comentarios</p>
        <div className="space-y-3 max-h-[260px] overflow-y-auto pr-1">
          {post.comments.map((c) => (
            <div key={c.id} className="bg-secondary/40 p-3 rounded-xl">
              <p className="text-xs text-muted-foreground"><span className="font-medium text-foreground/70">{c.author}</span> · {timeAgo(c.createdAt)}</p>
              <p className="text-sm mt-1 whitespace-pre-wrap">{c.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Textarea placeholder="Escribe un comentario respetuoso…" value={text} maxLength={800} onChange={(e) => setText(e.target.value)} className="min-h-[70px]" />
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={anon || viewerForceAnon} disabled={viewerForceAnon} onCheckedChange={(v) => setAnon(!!v)} />
              Comentar como anónimo/a
            </label>
            <Button onClick={send} size="sm" className="rounded-full">Comentar</Button>
          </div>
        </div>
      </div>
    </>
  );
}

function timeAgo(ts: number) {
  const s = Math.floor((Date.now() - ts) / 1000);
  if (s < 60) return "ahora";
  if (s < 3600) return `hace ${Math.floor(s / 60)} min`;
  if (s < 86400) return `hace ${Math.floor(s / 3600)} h`;
  return `hace ${Math.floor(s / 86400)} d`;
}
