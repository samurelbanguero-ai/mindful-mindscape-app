import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Phone, BookOpen, MapPin, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/recursos")({
  head: () => ({
    meta: [
      { title: "Recursos gratuitos — Emowave" },
      {
        name: "description",
        content: "Líneas de ayuda, centros de apoyo y recursos de salud mental.",
      },
    ],
  }),
  component: Recursos,
});

const LINES = [
  {
    name: "Línea de la Vida (México)",
    phone: "800 290 0024",
    note: "24/7, gratuita y confidencial",
  },
  { name: "Teléfono de la Esperanza (España)", phone: "717 003 717", note: "Apoyo emocional 24h" },
  {
    name: "Crisis Text Line (Internacional)",
    phone: "Texto HOME al 741741",
    note: "Soporte vía mensaje",
  },
  { name: "SAPTEL (México)", phone: "55 5259 8121", note: "Atención psicológica gratuita" },
  { name: "Centro de Asistencia al Suicida (Argentina)", phone: "135", note: "Línea gratuita 24h" },
  { name: "Samaritans (Reino Unido)", phone: "116 123", note: "Llamadas gratuitas 24/7" },
];

const READS = [
  {
    title: "OMS — Salud mental",
    text: "Información oficial de la Organización Mundial de la Salud sobre bienestar mental.",
  },
  {
    title: "Mente Sana",
    text: "Guías prácticas en español sobre ansiedad, depresión y autocuidado.",
  },
  { title: "Mind.org.uk", text: "Recursos comprensivos en inglés con material descargable." },
];

function Recursos() {
  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-12 space-y-10">
        <div>
          <p className="text-sm uppercase tracking-widest text-primary mb-2">Recursos gratuitos</p>
          <h1 className="text-5xl font-serif">Apoyo cuando lo necesites</h1>
          <p className="text-muted-foreground mt-3 max-w-2xl">
            Si estás en una situación de emergencia, contacta una línea de ayuda. Estos servicios
            son gratuitos, confidenciales y atendidos por profesionales y voluntarios.
          </p>
        </div>

        <Card className="p-5 rounded-2xl border border-destructive/20 bg-destructive/5 flex items-start gap-3 animate-pulse">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-sm">
            <strong>Emergencia:</strong> Si tu vida o la de otra persona está en riesgo inmediato,
            llama de inmediato al número de emergencias de tu país.
          </p>
        </Card>

        <section>
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <Phone className="w-5 h-5 text-primary" /> Líneas de atención
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {LINES.map((r) => (
              <Card key={r.name} className="p-6 rounded-2xl card-premium hover:shadow-md transition-all">
                <h3 className="font-semibold text-foreground/90">{r.name}</h3>
                <p className="text-2xl font-serif text-primary mt-1 font-bold">{r.phone}</p>
                <p className="text-xs text-muted-foreground mt-1">{r.note}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" /> Información de salud mental
          </h2>
          <div className="grid md:grid-cols-3 gap-4">
            {READS.map((r) => (
              <Card key={r.title} className="p-6 rounded-2xl card-premium hover:shadow-md transition-all">
                <h3 className="font-semibold mb-1 text-foreground/90">{r.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{r.text}</p>
              </Card>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-serif mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" /> Centros de apoyo
          </h2>
          <Card className="p-6 rounded-2xl card-premium text-xs text-muted-foreground leading-relaxed">
            Busca centros comunitarios, universidades y servicios públicos de salud mental en tu
            localidad. Muchos ofrecen consultas gratuitas o de bajo costo.
          </Card>
        </section>
      </main>
    </div>
  );
}
