import { useEffect, useState } from "react";
import { Activity, Loader2, TrendingDown, TrendingUp, Minus, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ml, type AnxietyEstimate } from "@/lib/api";
import { cn } from "@/lib/utils";

const LEVEL_STYLE: Record<string, { label: string; text: string; bar: string; badge: string }> = {
  bajo: {
    label: "Bajo",
    text: "text-emerald-600",
    bar: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-700",
  },
  moderado: {
    label: "Moderado",
    text: "text-amber-600",
    bar: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700",
  },
  alto: {
    label: "Alto",
    text: "text-orange-600",
    bar: "bg-orange-500",
    badge: "bg-orange-500/10 text-orange-700",
  },
  severo: {
    label: "Severo",
    text: "text-red-600",
    bar: "bg-red-500",
    badge: "bg-red-500/10 text-red-700",
  },
};

const FACTOR_LABEL = {
  stress: "Estrés",
  panic_attacks: "Señales de pánico",
  depression: "Ánimo bajo",
} as const;

type Props = {
  /** Sin `requestId` muestra la estimación del usuario actual; con él, la de un paciente (panel profesional). */
  requestId?: number;
  /** Cambia este valor para volver a pedir la estimación (p. ej. el número de registros del diario). */
  refreshKey?: unknown;
  compact?: boolean;
  onRequestSupport?: () => void;
};

export function AnxietyIndicator({
  requestId,
  refreshKey,
  compact = false,
  onRequestSupport,
}: Props) {
  const [estimate, setEstimate] = useState<AnxietyEstimate | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    const request = requestId !== undefined ? ml.getRequestAnxiety(requestId) : ml.getMyAnxiety();
    request
      .then((res) => {
        if (!cancelled) setEstimate(res);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [requestId, refreshKey]);

  const title =
    requestId !== undefined ? "Indicador de ansiedad del paciente" : "Tu indicador de ansiedad";

  const body = (() => {
    if (loading && !estimate) {
      return (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-4">
          <Loader2 className="w-4 h-4 animate-spin" /> Analizando registros con el modelo…
        </div>
      );
    }

    if (error) {
      return (
        <p className="text-xs text-muted-foreground py-2">
          No se pudo calcular el indicador: {error}
        </p>
      );
    }

    if (!estimate) return null;

    if (!estimate.available || !estimate.prediction) {
      const have = estimate.entriesInWindow ?? 0;
      const need = estimate.window.minEntries;
      return (
        <div className="text-xs text-muted-foreground space-y-2 py-1">
          <p>
            Se necesitan al menos {need} registros en los últimos {estimate.window.days} días para
            estimar el indicador. {requestId !== undefined ? "El paciente lleva" : "Llevas"} {have}{" "}
            de {need}.
          </p>
          <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, (have / need) * 100)}%` }}
            />
          </div>
        </div>
      );
    }

    const p = estimate.prediction;
    const style = LEVEL_STYLE[p.nivel_riesgo] ?? LEVEL_STYLE.moderado;
    const trend = estimate.trend;
    const TrendIcon =
      trend?.direction === "sube" ? TrendingUp : trend?.direction === "baja" ? TrendingDown : Minus;

    return (
      <div className="space-y-4">
        <div className="flex items-end justify-between gap-3 flex-wrap">
          <div>
            <span className={cn("text-3xl font-bold tabular-nums", style.text)}>
              {Math.round(p.ansiedad_predicha)}
            </span>
            <span className="text-xs text-muted-foreground"> / 100</span>
          </div>
          <span className={cn("text-xs font-semibold px-3 py-1 rounded-full", style.badge)}>
            Nivel {style.label}
          </span>
        </div>

        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden" aria-hidden>
          <div
            className={cn("h-full transition-all duration-700", style.bar)}
            style={{ width: `${p.ansiedad_predicha}%` }}
          />
        </div>

        <p className="text-xs text-foreground/80">{p.descripcion}</p>

        {trend && (
          <p className="text-xs text-muted-foreground flex items-center gap-1.5">
            <TrendIcon className="w-3.5 h-3.5" />
            {trend.direction === "estable"
              ? "Estable respecto a las 2 semanas anteriores"
              : `${trend.direction === "sube" ? "Sube" : "Baja"} ${Math.abs(Math.round(trend.delta))} puntos respecto a las 2 semanas anteriores`}
          </p>
        )}

        {!compact && (
          <div className="space-y-2">
            <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
              Factores calculados de {estimate.entriesUsed} registros
            </span>
            {(Object.keys(FACTOR_LABEL) as (keyof typeof FACTOR_LABEL)[]).map((key) => (
              <div key={key} className="space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>{FACTOR_LABEL[key]}</span>
                  <span className="tabular-nums text-muted-foreground">
                    {Math.round(p.factores[key])} · peso{" "}
                    {Math.round(p.importancia_variables[key] * 100)}%
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-primary/70" style={{ width: `${p.factores[key]}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {onRequestSupport && (p.nivel_riesgo === "alto" || p.nivel_riesgo === "severo") && (
          <Button size="sm" className="w-full rounded-full" onClick={onRequestSupport}>
            Hablar con un profesional
          </Button>
        )}

        <p className="text-[10px] text-muted-foreground flex gap-1 leading-snug">
          <Info className="w-3 h-3 shrink-0 mt-0.5" /> {estimate.disclaimer}
        </p>
      </div>
    );
  })();

  if (compact) {
    return (
      <div className="bg-violet-500/5 border border-violet-500/10 rounded-2xl p-3.5 text-xs space-y-2">
        <span className="font-semibold text-violet-600 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5" /> {title} (modelo ML)
        </span>
        {body}
      </div>
    );
  }

  return (
    <Card className="card-premium">
      <h3 className="text-lg font-serif flex items-center gap-1.5 mb-4">
        <Activity className="w-5 h-5 text-primary" /> {title}
      </h3>
      {body}
    </Card>
  );
}
