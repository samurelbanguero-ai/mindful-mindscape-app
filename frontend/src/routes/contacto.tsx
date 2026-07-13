import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Mail, Instagram, Twitter, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contacto")({
  head: () => ({
    meta: [
      { title: "Contacto — Emowave" },
      { name: "description", content: "Escríbenos: hola@emowave.app" },
    ],
  }),
  component: Contacto,
});

function Contacto() {
  const [f, setF] = useState({ name: "", email: "", msg: "" });
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!f.name.trim() || !f.email.trim() || !f.msg.trim())
      return toast.error("Completa todos los campos");
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
          <p className="text-muted-foreground mb-6">
            ¿Tienes una pregunta, idea o quieres colaborar con Emowave? Escríbenos.
          </p>
          <div className="space-y-3 text-sm">
            <a
              className="flex items-center gap-3 hover:text-primary transition"
              href="mailto:hola@emowave.app"
            >
              <Mail className="w-4 h-4" /> hola@emowave.app
            </a>
            <a className="flex items-center gap-3 hover:text-primary transition" href="#">
              <Instagram className="w-4 h-4" /> @emowave.bienestar
            </a>
            <a className="flex items-center gap-3 hover:text-primary transition" href="#">
              <Twitter className="w-4 h-4" /> @emowaveapp
            </a>
          </div>
          <div className="mt-10">
            <h2 className="font-medium mb-3 font-serif text-xl">Preguntas frecuentes</h2>
            <Accordion type="single" collapsible>
              <AccordionItem value="q1">
                <AccordionTrigger>¿Emowave reemplaza a un psicólogo?</AccordionTrigger>
                <AccordionContent>
                  No. Emowave acompaña pero no sustituye atención clínica.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="q2">
                <AccordionTrigger>¿Puedo usarla anónima?</AccordionTrigger>
                <AccordionContent>Sí, con alias o totalmente anónima.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q3">
                <AccordionTrigger>¿Es gratis?</AccordionTrigger>
                <AccordionContent>Las funciones principales son gratuitas.</AccordionContent>
              </AccordionItem>
              <AccordionItem value="q4">
                <AccordionTrigger>¿Quién ve mis datos?</AccordionTrigger>
                <AccordionContent>Solo tú, salvo que autorices compartirlos.</AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </div>
        <Card className="p-7 rounded-3xl card-premium shadow-lg">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="cn" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Nombre</Label>
              <Input
                id="cn"
                maxLength={80}
                value={f.name}
                onChange={(e) => setF({ ...f, name: e.target.value })}
                className="rounded-xl input-premium"
              />
            </div>
            <div>
              <Label htmlFor="ce" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Correo electrónico</Label>
              <Input
                id="ce"
                type="email"
                maxLength={120}
                value={f.email}
                onChange={(e) => setF({ ...f, email: e.target.value })}
                className="rounded-xl input-premium"
              />
            </div>
            <div>
              <Label htmlFor="cm" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Mensaje</Label>
              <Textarea
                id="cm"
                maxLength={1000}
                value={f.msg}
                className="min-h-[140px] rounded-xl input-premium"
                onChange={(e) => setF({ ...f, msg: e.target.value })}
              />
            </div>
            <Button type="submit" className="w-full rounded-full btn-premium-primary py-6" size="lg">
              <Send className="w-4 h-4 mr-2" /> Enviar mensaje
            </Button>
          </form>
        </Card>
      </main>
    </div>
  );
}
