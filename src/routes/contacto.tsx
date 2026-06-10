import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Mail, Instagram, Twitter, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contacto")({
  head: () => ({ meta: [{ title: "Contacto — Serena" }, { name: "description", content: "Escríbenos: hola@serena.app" }] }),
  component: Contacto,
});

function Contacto() {
  const [f, setF] = useState({ name: "", email: "", msg: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim() || !f.msg.trim()) return toast.error("Completa todos los campos");
    toast.success("Gracias. Te responderemos pronto 💚");
    setF({ name: "", email: "", msg: "" });
  };
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12 grid md:grid-cols-2 gap-10">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary mb-2">Contacto</p>
          <h1 className="text-5xl font-serif mb-4">Hablemos</h1>
          <p className="text-muted-foreground mb-6">¿Tienes una pregunta, idea o quieres colaborar con Serena? Escríbenos.</p>
          <div className="space-y-3 text-sm">
            <a className="flex items-center gap-3 hover:text-primary transition" href="mailto:hola@serena.app"><Mail className="w-4 h-4" /> hola@serena.app</a>
            <a className="flex items-center gap-3 hover:text-primary transition" href="#"><Instagram className="w-4 h-4" /> @serena.bienestar</a>
            <a className="flex items-center gap-3 hover:text-primary transition" href="#"><Twitter className="w-4 h-4" /> @serenaapp</a>
          </div>
          <div className="mt-10">
            <h2 className="font-medium mb-3 font-serif text-xl">Preguntas frecuentes</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="q1"><AccordionTrigger>¿Serena reemplaza a un psicólogo?</AccordionTrigger><AccordionContent>No. Serena acompaña pero no sustituye atención clínica.</AccordionContent></AccordionItem>
              <AccordionItem value="q2"><AccordionTrigger>¿Puedo usarla anónima?</AccordionTrigger><AccordionContent>Sí, con alias o totalmente anónima.</AccordionContent></AccordionItem>
              <AccordionItem value="q3"><AccordionTrigger>¿Es gratis?</AccordionTrigger><AccordionContent>Las funciones principales son gratuitas.</AccordionContent></AccordionItem>
              <AccordionItem value="q4"><AccordionTrigger>¿Quién ve mis datos?</AccordionTrigger><AccordionContent>Solo tú, salvo que autorices compartirlos.</AccordionContent></AccordionItem>
            </Accordion>
          </div>
        </div>
        <Card className="p-7 rounded-3xl">
          <form onSubmit={submit} className="space-y-4">
            <div><Label htmlFor="cn">Nombre</Label><Input id="cn" maxLength={80} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
            <div><Label htmlFor="ce">Correo</Label><Input id="ce" type="email" maxLength={120} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /></div>
            <div><Label htmlFor="cm">Mensaje</Label><Textarea id="cm" maxLength={1000} value={f.msg} className="min-h-[140px]" onChange={(e) => setF({ ...f, msg: e.target.value })} /></div>
            <Button type="submit" className="w-full rounded-full" size="lg"><Send className="w-4 h-4 mr-2" /> Enviar mensaje</Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
